
import { getNotionClient } from "@/lib/notion"
import { mapNotionProject } from "@/lib/notion/mappers"
import { createProjectSchema } from "@/lib/validations/project"
import type { CreateProjectInput } from "@/lib/validations/project"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

async function getProjectsDataSourceId() {
  const notion = getNotionClient()
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID

  if (!databaseId) {
    throw new Error("NOTION_PROJECTS_DATABASE_ID não configurado")
  }

  const database = await notion.databases.retrieve({
    database_id: databaseId,
  })

  if (!("data_sources" in database)) {
    throw new Error("A database não retornou data sources")
  }

  const dataSourceId = database.data_sources?.[0]?.id

  if (!dataSourceId) {
    throw new Error("Nenhuma data source encontrada")
  }

  return dataSourceId
}

export async function listNotionProjects() {
  const notion = getNotionClient()
  const dataSourceId = await getProjectsDataSourceId()

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
  })

  const projects = response.results.filter(
    (item): item is PageObjectResponse =>
      item.object === "page" && "properties" in item
  )

  return projects.map(mapNotionProject)
}

export async function createNotionProject(
  input: CreateProjectInput,
  localId?: string
) {
  const notion = getNotionClient()
  const dataSourceId = await getProjectsDataSourceId()

  const project = createProjectSchema.parse(input)

  const response = await notion.pages.create({
    parent: {
      type: "data_source_id",
      data_source_id: dataSourceId,
    },
    properties: {
      Name: {
        type: "title",
        title: [
          {
            text: {
              content: project.name,
            },
          },
        ],
      },
      Status: {
        type: "select",
        select: {
          name: project.status,
        },
      },
      Description: {
        type: "rich_text",
        rich_text: [
          {
            text: {
              content: project.description,
            },
          },
        ],
      },
      "Created At": {
        type: "date",
        date: {
          start: new Date().toISOString(),
        },
      },
      ...(localId
        ? {
            "Local ID": {
              type: "rich_text" as const,
              rich_text: [
                {
                  text: {
                    content: localId,
                  },
                },
              ],
            },
          }
        : {}),
    },
  })

  if (!("properties" in response)) {
    throw new Error("O Notion retornou uma página incompleta")
  }

  return mapNotionProject(response)
}

export async function findNotionProjectByLocalId(localId: string) {
  const notion = getNotionClient()
  const dataSourceId = await getProjectsDataSourceId()

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: "Local ID",
      rich_text: {
        equals: localId,
      },
    },
    page_size: 1,
  })

  const page = response.results.find(
    (item): item is PageObjectResponse =>
      item.object === "page" && "properties" in item
  )

  return page ? mapNotionProject(page) : null
}