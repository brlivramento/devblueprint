import { retryOutboxOperation } from "@/lib/sync/retry-outbox"

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

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { status: "error", message: "JSON inválido" },
      { status: 400 }
    )
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    typeof body.id !== "string" ||
    !body.id.trim()
  ) {
    return Response.json(
      { status: "error", message: "ID inválido" },
      { status: 400 }
    )
  }

  const retried = await retryOutboxOperation(body.id)

  if (!retried) {
    return Response.json(
      {
        status: "error",
        message: "Operação não encontrada ou não está com falha",
      },
      { status: 409 }
    )
  }

  return Response.json({
    status: "ok",
    message: "Operação devolvida à fila",
  })
}