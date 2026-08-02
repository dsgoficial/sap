#!/usr/bin/env node
// Path: sap.js
'use strict'

// sap - interface de linha de comando do SAP, desenhada para AGENTES.
//
// O client web serve humanos; este CLI serve agentes. Sao dois clientes da mesma
// API, com ergonomias diferentes de proposito: a tela otimiza clique e
// descoberta visual, o CLI otimiza contexto e encadeamento.
//
// Cinco principios, e o codigo os segue:
//   1. Nada de contrato copiado. A FORMA sai do Joi vivo do server/ e a
//      DESCRICAO de cada rota sai dos blocos @swagger, as duas em tempo de
//      execucao. Nao ha arquivo gerado nem catalogo em markdown para apodrecer.
//   2. Prosa curada so para o que a introspeccao nao alcanca (lib/regras.js):
//      trigger, UNIQUE, idempotencia, fuso. Curta.
//   3. Saida compacta por padrao. O consumidor tem janela finita: --json existe
//      para encadear, mas nao e o default.
//   4. Verbos de intencao, nao espelho do CRUD. `producao` colapsa dezenove
//      requisicoes numa tabela; `secao2` chama a rota que o SERVIDOR ja tem, em
//      vez de reimplementar a agregacao aqui.
//   5. O guardrail mora na interface. Confirmacao de acao irreversivel,
//      normalizacao de fuso e validacao local ficam aqui, nao na skill que
//      chama: skill e de um cliente so, a interface serve todos.

const argsLib = require('./lib/args')
const { resolver } = require('./lib/config')
const { RECURSOS, listarChaves } = require('./lib/recursos')

const AJUDA = `sap - CLI do Sistema de Apoio a Producao (SAP), para agentes

CONTRATO  (nao gasta rede nem credencial; leia isto antes de montar um corpo)
  sap schema                      lista os recursos e o que vale para todos
  sap schema campo                operacoes, campos e regras da atividade de campo
  sap schema login                o Joi.when() de plugins/qgis, que derruba integracao nova

DIA A DIA
  sap producao --ano 2026 [--mes 7]     estado do PIT (com lote e sem lote)
  sap secao2 --ano 2026 --mes 7         subsecoes do RPCMTec (SAP) em markdown
  sap secao2 --ano 2026 --mes 7 --docx --saida rpcmtec.docx
  sap dominio                           tabelas de dominio (os codigos dos *_id)
  sap dominio tipo_etapa

RECURSOS  (${listarChaves().join(', ')})
  sap <recurso> listar [--campos a,b] [--formato tsv|tabela|json]
  sap <recurso> obter     --uuid <uuid>          (onde houver)
  sap <recurso> criar     --data '{...}'   [--dry-run]
  sap <recurso> atualizar --data '{...}'   [--dry-run]
  sap <recurso> deletar   ... --confirmar <alvo> [--dry-run]

  As acoes de cada recurso saem de: sap schema <recurso>. Elas NAO sao uniformes:
  campo e capacitacao sao REST por uuid; lote, bloco, produto e unidade de
  trabalho operam na colecao, com array no corpo ate no DELETE.

LOTE  (verbos proprios; ver sap lote --ajuda)
  sap lote fechar --id 9 --confirmar 9
  sap lote pipeline --plano plano.json                 valida os 7 corpos, offline
  sap lote pipeline --plano plano.json --executar --confirmar "<nome>"

PRODUCAO RETROATIVA  (ver sap finalizar --ajuda)
  sap finalizar --arquivo lancamentos.json --dry-run
  sap finalizar --arquivo lancamentos.json --confirmar <quantidade>

SESSAO
  sap status                      o SAP esta no ar? ha token em cache?
  sap login                       autentica uma vez e guarda o token (~10h)
  sap logout                      descarta o token em cache

AMBIENTE  (catalogo em env-guia.md; nunca ponha senha na linha de comando)
  SAP_SERVER   URL do backend, ex.: http://IP:PORTA
  SAP_USER     login de admin          SAP_SENHA   senha
  SAP_TOKEN    JWT pronto (dispensa o login)

FLAGS GLOBAIS
  --json          saida crua e completa (para encadear)
  --formato       tsv (padrao) | tabela | json
  --campos a,b    recorta colunas na listagem
  --dry-run       valida contra o Joi do server/ e mostra a requisicao, NAO envia
  --server URL    sobrepoe SAP_SERVER
  --cliente NOME  aplicacao no servico de autenticacao (padrao: sap)
  --insecure      aceita HTTPS com certificado self-signed
  --sem-cache     nao le nem grava o token em cache

Quase toda rota de escrita exige administrador. O corpo e validado com
stripUnknown no servidor: campo com nome errado some CALADO, e o sap avisa antes.`

// Comandos que nao sao recurso.
const ROTEADOR = {
  schema: './comandos/schema',
  producao: './comandos/producao',
  secao2: './comandos/producao',
  finalizar: './comandos/finalizar',
  dominio: './comandos/dominio',
  login: './comandos/sessao',
  logout: './comandos/sessao',
  status: './comandos/sessao'
}

// Subcomandos que sequestram um nome de recurso. `lote` e recurso (listar,
// criar) E verbo (fechar, pipeline); sem este mapa, `sap lote fechar` cairia no
// crud generico e daria "acao desconhecida".
const SUBVERBOS = {
  'lote fechar': './comandos/lote',
  'lote pipeline': './comandos/lote',
  'lote fase': './comandos/lote'
}

async function principal () {
  const args = argsLib.parse(process.argv.slice(2))
  const comando = args._[0]

  if (!comando || ((args.flags.ajuda || args.flags.help) && !ROTEADOR[comando] && !RECURSOS[comando])) {
    process.stdout.write(AJUDA + '\n')
    return 0
  }

  const querAjuda = args.flags.ajuda === true || args.flags.help === true

  let modulo = SUBVERBOS[`${comando} ${args._[1]}`] || ROTEADOR[comando]
  if (!modulo && RECURSOS[comando]) {
    if (querAjuda) {
      // `sap campo --ajuda` = o contrato do recurso, que e a ajuda que serve.
      // `sap lote --ajuda` = os verbos proprios do lote, que sao outra coisa.
      modulo = SUBVERBOS[`${comando} fechar`] || './comandos/schema'
      if (modulo === './comandos/schema') args._ = ['schema', comando]
    } else {
      modulo = './comandos/crud'
    }
  }

  if (!modulo) {
    process.stderr.write(
      `Comando desconhecido: "${comando}".\n` +
      `Comandos: ${Object.keys(ROTEADOR).join(', ')}.\n` +
      `Recursos: ${listarChaves().join(', ')}.\n` +
      'Use sap --ajuda para o mapa completo.\n'
    )
    return 1
  }

  const cmd = require(modulo)

  // Quem decide se precisa de rede e o COMANDO, nao uma flag fixa. `sap schema`
  // le so o repo; `--dry-run` valida contra o Joi sem sair da maquina; e o
  // `lote pipeline` so toca a rede com --executar (o dry-run e o padrao dele,
  // porque sao sete escritas nao transacionais). Pedir SAP_SERVER para uma
  // operacao offline tiraria do agente o jeito mais barato de conferir um corpo.
  const precisa = typeof cmd.precisaServidor === 'function'
    ? cmd.precisaServidor(args)
    : cmd.precisaServidor
  const cfg = precisa && !querAjuda ? resolver(args.flags, true) : null

  const resultado = await cmd.executar(args, cfg)

  // Avisos vao para stderr: nao poluem o stdout que o agente pode estar
  // encadeando (--json), mas continuam visiveis.
  for (const aviso of resultado.avisos || []) {
    process.stderr.write('[aviso] ' + aviso + '\n')
  }
  if (resultado.texto) process.stdout.write(resultado.texto + '\n')
  return 0
}

principal()
  .then(codigo => { process.exitCode = codigo })
  .catch(err => {
    // Erro ja formatado (validacao local com o contrato junto) sai limpo; o
    // resto sai com o prefixo, sem stack: stack em CLI de agente e ruido.
    for (const aviso of err.avisos || []) {
      process.stderr.write('[aviso] ' + aviso + '\n')
    }
    process.stderr.write(
      (err.jaFormatado ? err.message : '[erro] ' + err.message) + '\n'
    )
    process.exitCode = 1
  })
