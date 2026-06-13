import { vi } from 'vitest'

// Cria um "connection" pg-promise mockado. Métodos de query resolvem para
// valores neutros por padrão; cada teste sobrescreve com mockResolvedValue(Once).
export function makeConn() {
  const conn = {
    none: vi.fn().mockResolvedValue(null),
    one: vi.fn().mockResolvedValue({}),
    oneOrNone: vi.fn().mockResolvedValue(null),
    many: vi.fn().mockResolvedValue([]),
    manyOrNone: vi.fn().mockResolvedValue([]),
    any: vi.fn().mockResolvedValue([]),
    result: vi.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    map: vi.fn().mockResolvedValue([]),
    each: vi.fn().mockResolvedValue([]),
    func: vi.fn().mockResolvedValue([]),
    query: vi.fn().mockResolvedValue([]),
    multi: vi.fn().mockResolvedValue([]),
    batch: vi.fn().mockResolvedValue([]),
  }
  conn.tx = vi.fn((arg, cb) => (typeof arg === 'function' ? arg(conn) : cb(conn)))
  conn.task = vi.fn((arg, cb) => (typeof arg === 'function' ? arg(conn) : cb(conn)))
  return conn
}

// Injeta um conn mockado no objeto `db` REAL (singleton) — o `db.sapConn` só é
// definido no startup (createSapConn), então fica undefined nos testes; aqui o
// substituímos. Retorna o conn para o teste configurar respostas.
export function patchDb(database) {
  const conn = makeConn()
  database.db.sapConn = conn
  database.db.microConn = conn
  return conn
}
