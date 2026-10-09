import { prisma } from "@/lib/prisma"

export type OutboxOperation = "create" | "update"

export async function enqueueSyncOperation(
  entityType: string,
  entityId: string,
  operation: OutboxOperation,
  payload: Record<string, unknown>
) {
  return prisma.syncOutbox.create({
    data: {
      entityType,
      entityId,
      operation,
      payload: JSON.stringify(payload),
      status: "pending",
    },
  })
}