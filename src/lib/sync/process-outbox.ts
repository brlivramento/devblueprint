import { prisma } from "@/lib/prisma"
import {
  createNotionProject,
  findNotionProjectByLocalId,
} from "@/lib/notion/projects"
import { createProjectSchema } from "@/lib/validations/project"
import { recoverStaleOutboxOperations } from "@/lib/sync/recover-outbox"

export async function processSyncOutbox() {
  const recovery = await recoverStaleOutboxOperations()
  const operations = await prisma.syncOutbox.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 20,
  })

  let processed = 0
  let failed = 0
  let skipped = 0

  for (const operation of operations) {
    // Reserva a operação somente se continuar pendente.
    const claim = await prisma.syncOutbox.updateMany({
      where: {
        id: operation.id,
        status: "pending",
      },
      data: {
        status: "processing",
        lockedAt: new Date(),
        attempts: { increment: 1 },
      },
    })

    if (claim.count === 0) {
      skipped++
      continue
    }

    try {
      if (
        operation.entityType !== "project" ||
        operation.operation !== "create"
      ) {
        throw new Error("Operação ainda não suportada")
      }

      const payload = createProjectSchema.parse(
        JSON.parse(operation.payload)
      )

      const localProject = await prisma.project.findUniqueOrThrow({
        where: { id: operation.entityId },
      })

      let notionProject = null

      if (localProject.notionId) {
        await prisma.syncOutbox.update({
          where: { id: operation.id },
          data: {
            status: "completed",
            lastError: null,
          },
        })

        processed++
        continue
      }

      notionProject = await findNotionProjectByLocalId(
        operation.entityId
      )

      if (!notionProject) {
        notionProject = await createNotionProject(
          payload,
          operation.entityId
        )
      }

      await prisma.$transaction([
        prisma.project.update({
          where: { id: operation.entityId },
          data: {
            notionId: notionProject.id,
            name: notionProject.name,
            description: notionProject.description,
            status: notionProject.status ?? "Planning",
          },
        }),

        prisma.syncOutbox.update({
          where: { id: operation.id },
          data: {
            status: "completed",
            lastError: null,
          },
        }),
      ])

      processed++
    } catch (error) {
      failed++

      await prisma.syncOutbox.update({
        where: { id: operation.id },
        data: {
          status: "failed",
          lastError:
            error instanceof Error
              ? error.message
              : "Erro desconhecido",
        },
      })
    }
  }

  return {
    total: operations.length,
    processed,
    failed,
    skipped,
    recovered: recovery.recovered,
  }
}