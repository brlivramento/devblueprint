import { Client } from "@notionhq/client"

let notionClient: Client | undefined

export function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN não configurado")
  }

  notionClient ??= new Client({
    auth: process.env.NOTION_TOKEN,
  })

  return notionClient
}