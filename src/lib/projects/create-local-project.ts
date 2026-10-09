import { prisma } from "@/lib/prisma"
import { createProjectSchema } from "@/lib/validations/project"
import type { CreateProjectInput } from "@/lib/validations/project"

export async function createLocalProject(input: CreateProjectInput) {
  const data = createProjectSchema.parse(input)

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
      },
    })

    await tx.syncOutbox.create({
      data: {
        entityType: "project",
        entityId: project.id,
        operation: "create",
        payload: JSON.stringify(data),
        status: "pending",
      },
    })

    return project
  })
}