import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export type NotionProject = {
  id: string
  name: string
  status: string | null
  description: string
  createdAt: string
  url: string
}

export function mapNotionProject(page: PageObjectResponse): NotionProject {
  const properties = page.properties

  const name = properties.Name
  const status = properties.Status
  const description = properties.Description

  return {
    id: page.id,
    name:
      name?.type === "title"
        ? name.title.map((item) => item.plain_text).join("")
        : "",
    status:
      status?.type === "select"
        ? status.select?.name ?? null
        : null,
    description:
      description?.type === "rich_text"
        ? description.rich_text.map((item) => item.plain_text).join("")
        : "",
    createdAt: page.created_time,
    url: page.url,
  }
}