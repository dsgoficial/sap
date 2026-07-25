// Path: comandos\finalizar.js
'use strict'

// `sap finalizar` - lancamento RETROATIVO de atividade ja executada (modo local).
//
// E a escrita mais perigosa que um agente faz no SAP: ela move producao de mes,
// e o mes errado vira relatorio errado. Tres guardrails moram aqui:
//
//   1. FUSO. O servidor grava data_inicio e data_fim como vieram, e o Node
//      renderiza em UTC-3: uma data a meia-noite UTC aparece no dia ANTERIOR e
//      cai no mes anterior do RPCMTec. O CLI normaliza data sem hora para
//      MEIO-DIA UTC, e recusa hora que caia perto da virada, em vez de deixar o
//      erro aparecer so na fechada do mes.
//   2. LOTE. Sao N requisicoes, uma por atividade, sem transacao entre elas. O
//      plano e mostrado antes, e a confirmacao pede o NUMERO de atividades.
//   3. OFFLINE. --dry-run valida todos os corpos contra o Joi do server/ e
//      imprime o plano, sem servidor e sem credencial.

const fs = require('fs')

const { RAIZ_SERVER } = require('../lib/recursos')
const esquema = require('../lib/schema')
const http = require('../lib/http')
const argsLib = require('../lib/args')
const { VERBOS } = require('../lib/regras')

const AJUDA = `sap finalizar - lancamento retroativo de atividade (modo local)

  sap finalizar --atividade 1234 --usuario-uuid <uuid> \\
                --inicio 2026-07-01 --fim 2026-07-05 --dry-run

  sap finalizar --arquivo lancamentos.json --dry-run
  sap finalizar --arquivo lancamentos.json --confirmar 288

O arquivo aceita duas formas:
  [{"atividade_id":1,"usuario_uuid":"...","data_inicio":"...","data_fim":"..."}]
  {"atividade_ids":[1,2,3],"usuario_uuid":"...","data_inicio":"...","data_fim":"..."}

LACUNA DE API: nao existe rota que liste as atividades de um lote (so
GET /api/gerencia/atividade/:id). Os ids ainda saem de leitura do banco.`

/**
 * Normaliza a data para meio-dia UTC quando vier so o dia, e denuncia a hora
 * que vai virar o dia na exibicao em UTC-3.
 * @returns {{valor: string, aviso?: string}}
 */
function normalizarData (bruto, rotulo) {
  const texto = String(bruto).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return { valor: `${texto}T12:00:00.000Z` }
  }

  const d = new Date(texto)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`${rotulo}: "${texto}" nao e uma data valida (use YYYY-MM-DD).`)
  }

  // Em UTC-3, hora UTC < 03:00 pertence ao dia anterior no fuso local.
  const horaUtc = d.getUTCHours()
  if (horaUtc < 3) {
    return {
      valor: d.toISOString(),
      aviso: `${rotulo} = ${d.toISOString()} esta antes das 03:00 UTC. Em UTC-3 ` +
        `isso e o dia ${new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10)}, ` +
        'e a producao vai aparecer no dia (e possivelmente no MES) anterior. ' +
        'Prefira passar so YYYY-MM-DD e deixar o sap por meio-dia UTC.'
    }
  }
  return { valor: d.toISOString() }
}

/** Le os lancamentos das flags ou do arquivo, nas duas formas aceitas. */
function lerLancamentos (flags) {
  if (flags.arquivo && flags.arquivo !== true) {
    const bruto = JSON.parse(fs.readFileSync(flags.arquivo, 'utf8'))
    if (Array.isArray(bruto)) return bruto
    if (bruto && Array.isArray(bruto.atividade_ids)) {
      return bruto.atividade_ids.map(id => ({
        atividade_id: id,
        usuario_uuid: bruto.usuario_uuid,
        data_inicio: bruto.data_inicio,
        data_fim: bruto.data_fim
      }))
    }
    throw new Error(
      `${flags.arquivo} nao tem nem um array de lancamentos nem a chave atividade_ids.`
    )
  }

  const id = argsLib.numero(flags, 'atividade', null)
  if (id === null) {
    throw new Error('Informe --atividade <id> ou --arquivo <lancamentos.json>.')
  }
  return [{
    atividade_id: id,
    usuario_uuid: argsLib.exigir(flags, 'usuario-uuid', 'uuid do militar que executou'),
    data_inicio: argsLib.exigir(flags, 'inicio', 'data de inicio, YYYY-MM-DD'),
    data_fim: argsLib.exigir(flags, 'fim', 'data de fim, YYYY-MM-DD')
  }]
}

async function executar (args, cfg) {
  const flags = args.flags
  if (flags.ajuda || flags.help) {
    return { texto: AJUDA + '\n\nregras\n' + VERBOS.finalizar.map(l => '  ' + l).join('\n') }
  }

  const gerenciaSchema = require(require('path').join(RAIZ_SERVER, 'gerencia', 'gerencia_schema'))
  const schemaJoi = gerenciaSchema.finalizaAtivModoLocal

  const brutos = lerLancamentos(flags)
  if (!brutos.length) return { texto: '(nenhum lancamento no arquivo)' }

  const avisos = []
  const corpos = []

  brutos.forEach((l, i) => {
    const rotulo = `lancamento ${i + 1} (atividade ${l.atividade_id})`
    const ini = normalizarData(l.data_inicio, `${rotulo} data_inicio`)
    const fim = normalizarData(l.data_fim, `${rotulo} data_fim`)
    if (ini.aviso) avisos.push(ini.aviso)
    if (fim.aviso) avisos.push(fim.aviso)

    const corpo = {
      atividade_id: l.atividade_id,
      usuario_uuid: l.usuario_uuid,
      data_inicio: ini.valor,
      data_fim: fim.valor
    }

    const r = esquema.validarCorpo(schemaJoi, corpo)
    if (r.descartados.length) {
      avisos.push(`${rotulo}: campos descartados pelo servidor: ${r.descartados.join(', ')}`)
    }
    if (!r.ok) {
      const erro = new Error(
        `${rotulo} invalido:\n` +
        esquema.explicarErro(schemaJoi, r.erros, 'sap schema finalizar')
      )
      erro.jaFormatado = true
      throw erro
    }
    // Guarda o corpo ORIGINAL (com a data em texto ISO). O Joi converte date
    // para objeto Date no valor validado, e serializar isso de volta funciona,
    // mas manter o texto que conferimos e o que o servidor recebe deixa o
    // dry-run identico ao envio.
    corpos.push(corpo)
  })

  const plano = [
    `${corpos.length} atividade${corpos.length === 1 ? '' : 's'} a finalizar, ` +
    'uma requisicao PUT /api/gerencia/finalizar_modo_local por atividade.',
    '',
    'atividade_id\tusuario_uuid\tdata_inicio\tdata_fim',
    ...corpos.slice(0, 20).map(c =>
      [c.atividade_id, c.usuario_uuid, c.data_inicio, c.data_fim].join('\t'))
  ]
  if (corpos.length > 20) plano.push(`... e mais ${corpos.length - 20}`)

  if (flags['dry-run']) {
    return {
      texto: ['[dry-run] nada foi enviado. Todos os corpos passaram no Joi do server/.', '', ...plano].join('\n'),
      avisos
    }
  }

  if (String(flags.confirmar) !== String(corpos.length)) {
    throw new Error(
      [
        'Escrita em LOTE na producao real, e sem transacao entre as chamadas: se ' +
        'parar no meio, parte fica lancada.',
        '',
        ...plano,
        '',
        `Para executar, confirme a QUANTIDADE: --confirmar ${corpos.length}`,
        'Para so conferir os corpos, sem servidor: --dry-run'
      ].join('\n')
    )
  }

  const ok = []
  const falhas = []
  for (const corpo of corpos) {
    try {
      await http.autenticada(cfg, 'PUT', '/gerencia/finalizar_modo_local', { corpo })
      ok.push(corpo.atividade_id)
    } catch (err) {
      falhas.push({ id: corpo.atividade_id, erro: err.message })
    }
  }

  const linhas = [`finalizadas: ${ok.length} de ${corpos.length}.`]
  if (falhas.length) {
    linhas.push('')
    linhas.push('falharam (as demais JA foram lancadas, nao repita o lote inteiro):')
    for (const f of falhas) linhas.push(`  atividade ${f.id}: ${f.erro}`)
    linhas.push('')
    linhas.push('A rota so pega atividade em tipo_situacao_id = 1, entao reprocessar')
    linhas.push('so as que faltam e seguro.')
  }
  return { texto: linhas.join('\n'), avisos }
}

const precisaServidor = args => args.flags['dry-run'] !== true

module.exports = { executar, precisaServidor, normalizarData, lerLancamentos }
