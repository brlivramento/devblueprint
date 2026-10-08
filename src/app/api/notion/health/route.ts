import { listNotionProjects } from "@/lib/notion/projects"

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
      { status: 503 },
    )
  }
}