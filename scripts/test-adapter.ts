import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  })

  const connection = await adapter.connect()

  try {
    const result = await connection.queryRaw({
      sql: "SELECT 1 AS connected",
      args: [],
      argTypes: [],
    })

    console.log(result)
  } finally {
    await connection.dispose()
  }
}

main().catch(console.error)