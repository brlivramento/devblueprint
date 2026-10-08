
import {
  listNotionProjects,
  createNotionProject,
} from "@/lib/notion/projects"
import { createProjectSchema } from "@/lib/validations/project"

export const runtime = "nodejs"

export async function GET() {
  try {
    const projects = await listNotionProjects()

    return Response.json({
      status: "ok",
      count: projects.length,
      projects,
    })
  } catch (error) {
    console.error("Failed to list Notion projects:", error)

    return Response.json(
      {
        status: "error",
        message: "Não foi possível consultar os projetos",
      },
      { status: 503 }
    )
  }
}

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
    const project = await createNotionProject(validation.data)

    return Response.json(
      { status: "ok", project },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create Notion project:", error)

    return Response.json(
      {
        status: "error",
        message: "Não foi possível criar o projeto",
      },
      { status: 503 }
    )
  }
}
