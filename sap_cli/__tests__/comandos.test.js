// Path: __tests__\comandos.test.js
'use strict'

// Testes dos comandos no caminho OFFLINE: contrato, dry-run e guardrails. Tudo
// aqui roda sem servidor e sem credencial, que e o requisito do proprio padrao:
// o jeito mais barato de conferir um corpo nao pode depender da rede.
//
// Os caminhos de REDE nao sao testados aqui, e isso e deliberado, nao esquecido:
// nao ha instancia do SAP alcancavel na maquina de desenvolvimento. Mock de HTTP
// so testaria o mock.

const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const crud = require('../comandos/crud')
const finalizar = require('../comandos/finalizar')
const lote = require('../comandos/lote')
const cmdSchema = require('../comandos/schema')
const args = require('../lib/args')

const CAMPO_VALIDO = {
  campo: {
    nome: 'Campo Teste', descricao: null, orgao: '1 CGEO', pit: 2026,
    militares: null, placas_vtr: null,
    inicio: '2026-07-01T12:00:00Z', fim: '2026-07-05T12:00:00Z',
    situacao_id: 1, categorias: ['Apoio']
  }
}

const parse = linha => args.parse(linha)

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------

test('parser: booleana nao consome o proximo argumento', () => {
  const r = parse(['campo', 'criar', '--dry-run', '--data', '{}'])
  assert.deepStrictEqual(r._, ['campo', 'criar'])
  assert.strictEqual(r.flags['dry-run'], true)
  assert.strictEqual(r.flags.data, '{}')
})

test('parser: --flag=valor e -- encerrando as flags', () => {
  const r = parse(['x', '--ano=2026', '--', '--nao-e-flag'])
  assert.strictEqual(r.flags.ano, '2026')
  assert.deepStrictEqual(r._, ['x', '--nao-e-flag'])
})

test('parser: flag desconhecida sem valor nao engole a proxima flag', () => {
  const r = parse(['--desconhecida', '--json'])
  assert.strictEqual(r.flags.desconhecida, true)
  assert.strictEqual(r.flags.json, true)
})

// ---------------------------------------------------------------------------
// dry-run offline
// ---------------------------------------------------------------------------

test('dry-run com corpo valido nao exige servidor e mostra a requisicao', async () => {
  const r = await crud.executar(
    parse(['campo', 'criar', '--dry-run', '--data', JSON.stringify(CAMPO_VALIDO)]),
    null
  )
  assert.match(r.texto, /\[dry-run\] nada foi enviado/)
  assert.match(r.texto, /POST \/api\/campo\/campos/)
  assert.match(r.texto, /"Campo Teste"/)
  assert.deepStrictEqual(r.avisos, [])
})

test('dry-run com corpo invalido reprova e imprime o contrato do campo', async () => {
  const torto = JSON.parse(JSON.stringify(CAMPO_VALIDO))
  torto.campo.pit = '2026'
  delete torto.campo.orgao

  await assert.rejects(
    () => crud.executar(parse(['campo', 'criar', '--dry-run', '--data', JSON.stringify(torto)]), null),
    err => {
      assert.strictEqual(err.jaFormatado, true)
      assert.match(err.message, /"campo.orgao" is required/)
      assert.match(err.message, /"campo.pit" must be a number/)
      assert.match(err.message, /contrato dos campos citados/)
      assert.match(err.message, /orgao\*/)
      return true
    }
  )
})

test('dry-run avisa campo descartado em silencio pelo stripUnknown', async () => {
  const corpo = JSON.parse(JSON.stringify(CAMPO_VALIDO))
  corpo.campo.orgaoo = 'typo'

  const r = await crud.executar(
    parse(['campo', 'criar', '--dry-run', '--data', JSON.stringify(corpo)]), null
  )
  assert.strictEqual(r.avisos.length, 1)
  assert.match(r.avisos[0], /DESCARTADOS em silencio/)
  assert.match(r.avisos[0], /campo\.orgaoo/)
})

test('dry-run avisa data que vai cair no mes anterior', async () => {
  const corpo = JSON.parse(JSON.stringify(CAMPO_VALIDO))
  corpo.campo.inicio = '2026-07-01'

  const r = await crud.executar(
    parse(['campo', 'criar', '--dry-run', '--data', JSON.stringify(corpo)]), null
  )
  assert.ok(r.avisos.some(a => /2026-06-30/.test(a)))
})

test('parametro de rota e validado antes de gastar a requisicao', async () => {
  await assert.rejects(
    () => crud.executar(parse(['pit_execucao', 'listar', '--ano', '2026', '--mes', '13']), null),
    /mes.*less than or equal to 12|Parametro de rota invalido/s
  )
})

// ---------------------------------------------------------------------------
// Guardrails de exclusao
// ---------------------------------------------------------------------------

test('deletar sem --confirmar recusa e ensina o comando exato', async () => {
  await assert.rejects(
    () => crud.executar(parse(['campo', 'deletar', '--uuid', 'abc']), null),
    err => {
      assert.match(err.message, /irreversivel e nao foi confirmada/)
      assert.match(err.message, /--confirmar abc/)
      return true
    }
  )
})

test('deletar em lote exige repetir TODOS os ids do corpo', async () => {
  const linha = ['lote', 'deletar', '--data', '{"lote_ids":[7,9]}']

  await assert.rejects(
    () => crud.executar(parse([...linha, '--confirmar', '7']), null),
    /--confirmar 7,9/
  )

  const ok = await crud.executar(parse([...linha, '--confirmar', '7,9', '--dry-run']), null)
  assert.match(ok.texto, /DELETE \/api\/projeto\/lote/)
})

// ---------------------------------------------------------------------------
// finalizar: fuso e confirmacao por quantidade
// ---------------------------------------------------------------------------

test('data sem hora vira meio-dia UTC, sem aviso', () => {
  const r = finalizar.normalizarData('2026-07-01', 'x')
  assert.strictEqual(r.valor, '2026-07-01T12:00:00.000Z')
  assert.strictEqual(r.aviso, undefined)
})

test('hora antes das 03:00 UTC passa, mas com aviso do dia anterior', () => {
  const r = finalizar.normalizarData('2026-07-01T00:00:00Z', 'data_fim')
  assert.match(r.aviso, /2026-06-30/)
  assert.match(r.aviso, /MES/)
})

test('data impossivel e recusada com o formato esperado na mensagem', () => {
  assert.throws(() => finalizar.normalizarData('ontem', 'data_inicio'), /YYYY-MM-DD/)
})

test('finalizar --dry-run valida todos os corpos e nao pede servidor', async () => {
  const arquivo = path.join(os.tmpdir(), `sap_cli_lanc_${process.pid}.json`)
  fs.writeFileSync(arquivo, JSON.stringify({
    atividade_ids: [11, 22, 33],
    usuario_uuid: '3f2a9c1e-5b6d-4a7f-8e9c-0d1b2a3c4d5e',
    data_inicio: '2026-07-01',
    data_fim: '2026-07-05'
  }))
  try {
    const r = await finalizar.executar(parse(['finalizar', '--arquivo', arquivo, '--dry-run']), null)
    assert.match(r.texto, /3 atividades a finalizar/)
    assert.match(r.texto, /T12:00:00\.000Z/)

    await assert.rejects(
      () => finalizar.executar(parse(['finalizar', '--arquivo', arquivo, '--confirmar', '2']), null),
      /--confirmar 3/
    )
  } finally {
    fs.unlinkSync(arquivo)
  }
})

test('finalizar recusa uuid que nao e v4, como o Joi do server/', async () => {
  await assert.rejects(
    () => finalizar.executar(parse([
      'finalizar', '--atividade', '1', '--usuario-uuid', 'nao-e-uuid',
      '--inicio', '2026-07-01', '--fim', '2026-07-02', '--dry-run'
    ]), null),
    /usuario_uuid/
  )
})

// ---------------------------------------------------------------------------
// pipeline do lote
// ---------------------------------------------------------------------------

const PLANO = {
  lote: { lotes: [{ nome: 'Lote T', nome_abrev: 'LT', denominador_escala: 25000, linha_producao_id: 1, projeto_id: 1, descricao: 'x', status_id: 1 }] },
  bloco: { blocos: [{ nome: 'B1', prioridade: 1, lote_id: null, status_id: 1 }] },
  produto: { produtos: [{ uuid: '3f2a9c1e-5b6d-4a7f-8e9c-0d1b2a3c4d5e', nome: 'F', mi: '1', inom: '1', denominador_escala: '25000', edicao: '1', geom: 'SRID=4326;MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))' }], lote_id: null },
  unidade_trabalho: { unidades_trabalho: [{ nome: 'UT', epsg: '31982', observacao: '', geom: 'SRID=4326;POLYGON((0 0,0 1,1 1,1 0,0 0))', dado_producao_id: 1, bloco_id: null, disponivel: false, prioridade: 1, dificuldade: 0, tempo_estimado_minutos: 0 }], subfase_ids: [1], lote_id: null },
  etapas: [{ padrao_cq: 1, fase_id: 1, lote_id: null }],
  atividades: { lote_id: null, atividades_revisao: false, atividades_revisao_correcao: false, atividades_revisao_final: false },
  copiar: { lote_id_origem: 9, lote_id_destino: null, copiar_estilo: true, copiar_menu: true, copiar_regra: true, copiar_modelo: true, copiar_workflow: true, copiar_alias: true, copiar_linhagem: true, copiar_finalizacao: true, copiar_tema: true, copiar_fme: true, copiar_configuracao_qgis: true, copiar_monitoramento: true }
}

function comPlano (plano, fn) {
  const arquivo = path.join(os.tmpdir(), `sap_cli_plano_${process.pid}_${Math.random().toString(36).slice(2)}.json`)
  fs.writeFileSync(arquivo, JSON.stringify(plano))
  return Promise.resolve(fn(arquivo)).finally(() => fs.unlinkSync(arquivo))
}

test('pipeline sem --executar valida os sete corpos offline', async () => {
  await comPlano(PLANO, async arquivo => {
    const r = await lote.executar(parse(['lote', 'pipeline', '--plano', arquivo]), null)
    assert.match(r.texto, /\[dry-run\] nada foi enviado/)
    for (let n = 1; n <= 7; n++) {
      assert.match(r.texto, new RegExp(`passo ${n} `), `passo ${n} sumiu do plano`)
    }
    assert.match(r.texto, /NAO IDEMPOTENTE e sem UNIQUE/)
    assert.deepStrictEqual(r.avisos, [])
  })
})

test('pipeline aponta o passo e o campo errado sem tocar a rede', async () => {
  const ruim = JSON.parse(JSON.stringify(PLANO))
  ruim.unidade_trabalho.unidades_trabalho[0].epsg = 31982

  await comPlano(ruim, async arquivo => {
    await assert.rejects(
      () => lote.executar(parse(['lote', 'pipeline', '--plano', arquivo]), null),
      err => {
        assert.match(err.message, /Passo 4 \(unidade_trabalho\) invalido/)
        assert.match(err.message, /epsg" must be a string/)
        return true
      }
    )
  })
})

test('pipeline recusa executar sem confirmar o nome do lote', async () => {
  await comPlano(PLANO, async arquivo => {
    await assert.rejects(
      () => lote.executar(parse(['lote', 'pipeline', '--plano', arquivo, '--executar']), null),
      /--confirmar "Lote T"/
    )
  })
})

test('pipeline precisa de servidor SO com --executar', () => {
  assert.strictEqual(lote.precisaServidor(parse(['lote', 'pipeline', '--plano', 'x'])), false)
  assert.strictEqual(lote.precisaServidor(parse(['lote', 'pipeline', '--plano', 'x', '--executar'])), true)
  assert.strictEqual(crud.precisaServidor(parse(['campo', 'criar', '--dry-run'])), false)
  assert.strictEqual(crud.precisaServidor(parse(['campo', 'listar'])), true)
})

test('preencher troca so os nulls das chaves resolvidas', () => {
  const r = lote.preencher(
    { a: null, lote_id: null, dentro: [{ bloco_id: null, x: null }] },
    { lote_id: 5, bloco_id: 7 }
  )
  assert.deepStrictEqual(r, { a: null, lote_id: 5, dentro: [{ bloco_id: 7, x: null }] })
})

// ---------------------------------------------------------------------------
// schema, offline por construcao
// ---------------------------------------------------------------------------

test('sap schema nao precisa de servidor e lista tudo', () => {
  assert.strictEqual(cmdSchema.precisaServidor, false)
  const r = cmdSchema.executar(parse(['schema']))
  assert.match(r.texto, /unidade_trabalho/)
  assert.match(r.texto, /verbos de intencao/)
  // O defeito das rotas de /acompanhamento tem que estar a vista de quem le.
  assert.match(r.texto, /respondem 400 SEMPRE/)
})
