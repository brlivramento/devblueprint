import { syncProjectsFromNotion } from "@/lib/sync/projects"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const expectedToken = process.env.SYNC_API_TOKEN

  if (!expectedToken) {
    return Response.json(
      { status: "error", message: "Sincronização não configurada" },
      { status: 503 }
    )
  }

  if (request.headers.get("authorization") !== `Bearer ${expectedToken}`) {
    return Response.json(
      { status: "error", message: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const result = await syncProjectsFromNotion()

    return Response.json({
      status: "ok",
      ...result,
    })
  } catch (error) {
    console.error("Project synchronization failed:", error)

    return Response.json(
      {
        status: "error",
        message: "Falha ao sincronizar projetos",
      },
      { status: 503 }
    )
  }
}