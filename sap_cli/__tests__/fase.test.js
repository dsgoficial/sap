'use strict'

// `sap lote fase`: completar fase que faltou num lote ja configurado.
//
// Substitui o `cadastra_fase_faltante.py` do vault, que lia o molde por `psql`
// direto no banco de producao. As duas decisoes que aquele script tomava e que
// nao podem se perder na migracao estao cobertas aqui: como se clona a unidade
// de trabalho, e de onde sai a data de um lancamento retroativo.

const { test } = require('node:test')
const assert = require('node:assert')

const { clonarUnidades, resolverData } = require('../comandos/lote')

const MOLDE = [
  { id: 900, nome: 'A', epsg: '31982', dado_producao_id: 3, bloco_id: 7, geom: 'SRID=4326;POLYGON((0 0,1 0,1 1,0 0))' },
  { id: 901, nome: 'B', epsg: '31982', dado_producao_id: 3, bloco_id: 7, geom: 'SRID=4326;POLYGON((2 2,3 2,3 3,2 2))' }
]

test('clona uma unidade por unidade do molde, renumerando', () => {
  const u = clonarUnidades(MOLDE)
  assert.strictEqual(u.length, 2)
  assert.deepStrictEqual(u.map(x => x.nome), ['1', '2'])
  assert.deepStrictEqual(u.map(x => x.prioridade), [1, 2])
})

test('herda epsg, dado de producao e bloco do molde', () => {
  const [u] = clonarUnidades(MOLDE)
  assert.strictEqual(u.epsg, '31982')
  assert.strictEqual(u.dado_producao_id, 3)
  assert.strictEqual(u.bloco_id, 7)
})

// O erro que o EWKT do servidor evita: `epsg` e o CRS de TRABALHO da unidade
// (UTM), e a coluna geom e 4326. Quem remontasse a geometria a partir do epsg
// gravaria um poligono geografico rotulado como UTM.
test('a geometria passa intacta, com o SRID que veio, e NAO com o epsg', () => {
  const u = clonarUnidades(MOLDE)
  assert.strictEqual(u[0].geom, 'SRID=4326;POLYGON((0 0,1 0,1 1,0 0))')
  assert.ok(!u[0].geom.includes('31982'), 'o epsg de trabalho nao pode virar SRID da geometria')
})

test('unidade nova nasce disponivel e sem estimativa', () => {
  const [u] = clonarUnidades(MOLDE)
  assert.strictEqual(u.disponivel, true)
  assert.strictEqual(u.dificuldade, 0)
  assert.strictEqual(u.tempo_estimado_minutos, 0)
  assert.strictEqual(u.observacao, '')
})

test('molde vazio nao inventa unidade', () => {
  assert.deepStrictEqual(clonarUnidades([]), [])
})

test('a data explicita vence, sem consultar o molde', () => {
  assert.strictEqual(resolverData('2026-05-28T12:00:00.000Z', 163, []), '2026-05-28T12:00:00.000Z')
})

test('sem data e sem molde-vf, RECUSA em vez de datar com hoje', () => {
  assert.throws(() => resolverData(null, null, []), /falsifica o mes do relatorio/)
})

test('herda a data da Verificacao Final quando ela e unica', () => {
  assert.strictEqual(resolverData(null, 163, ['2026-05-28T12:00:00.000Z']), '2026-05-28T12:00:00.000Z')
})

// O caso que importa: o lote que nao fechou de uma vez. Escolher a primeira
// data seria inventar, e o numero iria para o mes errado de um relatorio
// assinado.
test('duas datas de conclusao distintas RECUSAM, em vez de escolher uma', () => {
  assert.throws(
    () => resolverData(null, 163, ['2026-05-28T12:00:00.000Z', '2026-06-02T12:00:00.000Z']),
    /2 data\(s\) de conclusao distintas/
  )
})

test('nenhuma data de conclusao tambem RECUSA', () => {
  assert.throws(() => resolverData(null, 163, []), /0 data\(s\)/)
})
