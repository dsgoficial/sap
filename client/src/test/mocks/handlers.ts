import { http, HttpResponse } from 'msw'

// Handlers padrão (vazio por design): cada teste declara explicitamente o que a
// API deve responder via `server.use(...)`, deixando o cenário óbvio no teste.
// `re` exportado abaixo para encurtar a criação de handlers nos testes.
export const handlers = []

export { http, HttpResponse }
