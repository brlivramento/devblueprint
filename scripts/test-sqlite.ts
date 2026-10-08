import Database from "better-sqlite3"

const db = new Database("data/devblueprint.db")

try {
  console.log("Conexão:", db.prepare("SELECT 1 AS connected").get())

  console.log(
    "Tabelas:",
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(),
  )
} finally {
  db.close()
}