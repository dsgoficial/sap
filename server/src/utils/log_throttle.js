'use strict'

// Limita logs repetitivos (ex.: cliente com JWT expirado reenviando sem parar).
// Para cada chave, deixa passar o primeiro log e suprime os seguintes dentro da
// janela; ao reabrir a janela informa quantos foram suprimidos.
const WINDOW_MS = 5 * 60 * 1000
const MAX_KEYS = 1000

const entries = new Map()

const prune = now => {
  for (const [key, entry] of entries) {
    if (now - entry.start >= WINDOW_MS) {
      entries.delete(key)
    }
  }
  if (entries.size > MAX_KEYS) {
    entries.clear()
  }
}

// Retorna { log: boolean, suppressed: number }. `suppressed` só vale quando
// log é true e conta as ocorrências ocultadas na janela anterior.
const shouldLog = (key, now = Date.now()) => {
  const entry = entries.get(key)
  if (entry && now - entry.start < WINDOW_MS) {
    entry.suppressed += 1
    return { log: false, suppressed: 0 }
  }
  const suppressed = entry ? entry.suppressed : 0
  if (entries.size >= MAX_KEYS) {
    prune(now)
  }
  entries.set(key, { start: now, suppressed: 0 })
  return { log: true, suppressed }
}

module.exports = { shouldLog, WINDOW_MS }
