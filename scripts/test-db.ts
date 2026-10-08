import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../src/generated/prisma/client"

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  })

  const prisma = new PrismaClient({ adapter })

  try {
    const result = await prisma.$queryRaw`SELECT 1 AS connected`
    console.log("SQLite:", result)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("Prisma error:", error)
  process.exitCode = 1
})