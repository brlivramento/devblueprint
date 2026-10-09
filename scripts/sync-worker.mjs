const interval = Number(process.env.SYNC_INTERVAL_MS ?? 60000)

const apiUrl =
  process.env.SYNC_API_URL ??
  "http://app:3000/api/sync/outbox"

const token = process.env.SYNC_API_TOKEN

if (!token) {
  throw new Error("SYNC_API_TOKEN não configurado")
}

if (!Number.isFinite(interval) || interval < 10000) {
  throw new Error("SYNC_INTERVAL_MS deve ser >= 10000")
}

async function processOutbox() {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    console.log(
      `[sync-worker] ${new Date().toISOString()}`,
      result
    )
  } catch (error) {
    console.error("[sync-worker] Erro:", error)
  }
}

async function start() {
  console.log("[sync-worker] Iniciado")

  while (true) {
    await processOutbox()
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

start()