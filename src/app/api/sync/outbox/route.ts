import { processSyncOutbox } from "@/lib/sync/process-outbox"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const token = process.env.SYNC_API_TOKEN

  if (!token) {
    return Response.json(
      { status: "error", message: "Sincronização não configurada" },
      { status: 503 }
    )
  }

  if (request.headers.get("authorization") !== `Bearer ${token}`) {
    return Response.json(
      { status: "error", message: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const result = await processSyncOutbox()

    return Response.json({ status: "ok", ...result })
  } catch (error) {
    console.error("Outbox processing failed:", error)

    return Response.json(
      { status: "error", message: "Falha ao processar outbox" },
      { status: 503 }
    )
  }
}