import { prisma } from "@/lib/prisma"

const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000

export async function recoverStaleOutboxOperations() {
  const timeout = new Date(
    Date.now() - PROCESSING_TIMEOUT_MS
  )

  const result = await prisma.syncOutbox.updateMany({
    where: {
      status: "processing",
      lockedAt: {
        lt: timeout,
      },
    },
    data: {
      status: "failed",
      lockedAt: null,
      lastError:
        "Processamento interrompido ou tempo limite excedido",
    },
  })

  return {
    recovered: result.count,
  }
}