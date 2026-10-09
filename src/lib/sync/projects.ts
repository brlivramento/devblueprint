import { prisma } from "@/lib/prisma"
import { listNotionProjects } from "@/lib/notion/projects"

export async function syncProjectsFromNotion() {
  const projects = await listNotionProjects()

  let created = 0
  let updated = 0

  for (const project of projects) {
    const existing = await prisma.project.findUnique({
      where: {
        notionId: project.id,
      },
    })

    await prisma.project.upsert({
      where: {
        notionId: project.id,
      },
      create: {
        notionId: project.id,
        name: project.name,
        description: project.description,
        status: project.status ?? "Planning",
      },
      update: {
        name: project.name,
        description: project.description,
        status: project.status ?? "Planning",
      },
    })

    if (existing) {
      updated++
    } else {
      created++
    }
  }

  return {
    total: projects.length,
    created,
    updated,
  }
}