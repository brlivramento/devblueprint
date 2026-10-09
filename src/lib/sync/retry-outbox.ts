import { prisma } from "@/lib/prisma"

export async function retryOutboxOperation(id: string) {
  const result = await prisma.syncOutbox.updateMany({
    where: {
      id,
      status: "failed",
    },
    data: {
      status: "pending",
      lockedAt: null,
      lastError: null,
    },
  })

  return result.count > 0
}