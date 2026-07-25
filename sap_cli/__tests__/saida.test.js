// Path: __tests__\saida.test.js
'use strict'

// A saida existe para caber na janela de quem le. Estes testes travam as
// decisoes que mais afetam isso: recorte de coluna, truncamento de geometria e
// TSV que nao se despedaca.

const test = require('node:test')
const assert = require('node:assert')

const saida = require('../lib/saida')
const producao = require('../comandos/producao')

test('lista compacta pelas colunas padrao do recurso e conta o que escondeu', () => {
  const dados = [
    { id: 1, nome: 'a', ruido: 'x', mais_ruido: 'y' },
    { id: 2, nome: 'b', ruido: 'x', mais_ruido: 'y' }
  ]
  const r = saida.lista(dados, { padrao: ['id', 'nome'] })
  assert.match(r.texto, /^id\tnome\n/)
  assert.ok(!/ruido/.test(r.texto))
  assert.match(r.texto, /\(2 registros, 2 de 4 colunas\)/)
})

test('coluna pedida que nao existe vira aviso, nunca coluna vazia', () => {
  const r = saida.lista([{ id: 1 }], { campos: ['id', 'inexistente'] })
  assert.strictEqual(r.avisos.length, 1)
  assert.match(r.avisos[0], /inexistente/)
})

test('geometria WKT nao estoura a linha', () => {
  const wkt = 'SRID=4326;MULTIPOLYGON(((' + '0 0,'.repeat(400) + '0 0)))'
  const c = saida.celula('geom', wkt)
  assert.ok(c.length <= 123, `celula com ${c.length} caracteres`)
  assert.match(c, /\.\.\.$/)
})

test('tabulacao dentro do dado nao quebra a coluna do TSV', () => {
  const r = saida.lista([{ a: 'x\ty', b: 'z' }], { padrao: ['a', 'b'] })
  const linha = r.texto.split('\n')[1]
  assert.strictEqual(linha.split('\t').length, 2)
})

test('data com hora vira so a data; booleano vira sim/nao; vazio vira tracinho', () => {
  assert.strictEqual(saida.celula('inicio', '2026-07-01T12:00:00.000Z'), '2026-07-01')
  assert.strictEqual(saida.celula('disponivel', false), 'nao')
  assert.strictEqual(saida.celula('x', null), '-')
  assert.strictEqual(saida.celula('x', ''), '-')
})

test('array de categorias sai legivel, nao como JSON', () => {
  assert.strictEqual(saida.celula('categorias', ['Apoio', 'Reconhecimento']), 'Apoio|Reconhecimento')
})

test('numero usa separador pt-BR', () => {
  assert.strictEqual(saida.numero(1234567), '1.234.567')
  assert.strictEqual(saida.numero(null), '-')
})

test('markdown da secao2 escapa a barra vertical do dado', () => {
  const md = producao.markdown([{ a: 'x|y' }], ['a'])
  assert.match(md, /x\\\|y/)
})

test('markdown vazio nao vira tabela quebrada', () => {
  assert.strictEqual(producao.markdown([], ['a']), '_(nenhum registro)_')
  assert.strictEqual(producao.markdown(undefined, ['a']), '_(nenhum registro)_')
})

test('as secoes do RPCMTec cobrem as chaves que o servidor devolve', () => {
  // O nome das chaves vem do relatorio_ctrl.js do server/; se ele renomear uma
  // secao, a tabela some do markdown em silencio. Este teste amarra as duas.
  const fs = require('fs')
  const path = require('path')
  const { RAIZ_SERVER } = require('../lib/recursos')
  // O repo esta com CRLF; normalizar evita um teste que passa em Linux e falha
  // em Windows por causa de um \r.
  const fonte = fs
    .readFileSync(path.join(RAIZ_SERVER, 'relatorio', 'relatorio_ctrl.js'), 'utf8')
    .replace(/\r\n/g, '\n')
  const inicio = fonte.lastIndexOf('  return {\n    ano,')
  assert.ok(inicio > 0, 'nao achei o retorno de gerarRelatorioSap no server/')
  const retorno = fonte.slice(inicio, fonte.indexOf('\n}', inicio))

  for (const [chave] of producao.SECOES) {
    assert.ok(
      new RegExp(`\\b${chave}\\b`).test(retorno),
      `a secao "${chave}" nao esta no retorno de gerarRelatorioSap: renomeada no server/?`
    )
  }
})
