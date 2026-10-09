import { createLocalProject } from "@/lib/projects/create-local-project"
import { createProjectSchema } from "@/lib/validations/project"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { status: "error", message: "JSON inválido" },
      { status: 400 }
    )
  }

  const validation = createProjectSchema.safeParse(body)

  if (!validation.success) {
    return Response.json(
      {
        status: "error",
        message: "Dados inválidos",
        issues: validation.error.issues,
      },
      { status: 400 }
    )
  }

  try {
    const project = await createLocalProject(validation.data)

    return Response.json(
      {
        status: "ok",
        syncStatus: "pending",
        project,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create local project:", error)

    return Response.json(
      { status: "error", message: "Erro ao criar projeto" },
      { status: 503 }
    )
  }
}