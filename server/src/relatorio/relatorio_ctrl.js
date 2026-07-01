'use strict'

// Gerador do RPCMTec - seções de PRODUÇÃO e PESSOAL que o SAP conhece:
// Estado Atual do PIT, 2.1 (execução por lote/bloco), 2.2 (entregas de
// produtos finais), 2.3 (campo), 2.5 (capacitações ministradas), 2.6
// (Extra-PIT), 5.1 (aproveitamento do efetivo), 5.2 (capacitação do efetivo),
// Total de Capacitação e Totais do Mês e do Ano.
//
// Reaproveita os controllers já existentes (rh, campo, capacitacao, extra_pit,
// acompanhamento); só há SQL novo para o detalhe de produtos finalizados por
// mês (2.2), o número de produtos por bloco (2.1) e o estado das metas de
// não-produção com recorte por mês. O mesmo objeto alimenta o preview em tela
// (rota JSON) e o export DOCX.

const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, TextRun } = require('docx')

const { db } = require('../database')
const rhCtrl = require('../rh/rh_ctrl')
const campoCtrl = require('../campo/campo_ctrl')
const capacitacaoCtrl = require('../capacitacao/capacitacao_ctrl')
const extraPitCtrl = require('../extra_pit/extra_pit_ctrl')
const acompanhamentoCtrl = require('../acompanhamento/acompanhamento_ctrl')

const controller = {}

// --------------------------------------------------------------------------
// Helpers de data e formatação
// --------------------------------------------------------------------------

const isoDate = (ano, mes, dia) =>
  `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

// Último dia do mês (mes 1..12): new Date(ano, mes, 0) = dia 0 do mês seguinte.
const ultimoDiaDoMes = (ano, mes) => new Date(ano, mes, 0).getDate()

const texto = valor => (valor == null || valor === '' ? '-' : String(valor))

// dd/mm/aaaa a partir de Date/string; '-' quando vazio/inválido.
const formatData = valor => {
  if (!valor) return '-'
  const d = valor instanceof Date ? valor : new Date(valor)
  if (isNaN(d.getTime())) return '-'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const escalaDisplay = den => (den ? `1:${Number(den).toLocaleString('pt-BR')}` : '-')

const pct = v => (v == null ? '-' : `${v}%`)

// --------------------------------------------------------------------------
// SQL novo (o que os controllers existentes não cobrem)
// --------------------------------------------------------------------------

// Produtos finalizados (TODAS as UT do produto finalizadas) entre [inicio, fim).
// Nível de produto, com tipo/escala/identificador/lote. Sem UUID do BDGEx (esse
// vive no SCA). Adaptação da CTE de acompanhamento.getFinalizadasAno.
const getProdutosFinalizados = async (inicio, fimExclusivo) => {
  return db.sapConn.any(
    `
    WITH ut_fin AS (
      SELECT ut.id,
             (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS finalizada,
             max(a.data_fim) AS data_fim
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
      GROUP BY ut.id
    ),
    prod_fin AS (
      SELECT p.id, bool_and(ut.finalizada) AS finalizada, max(ut.data_fim) AS data_fim
      FROM macrocontrole.produto AS p
      INNER JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
      INNER JOIN ut_fin AS ut ON ut.id = rp.ut_id
      GROUP BY p.id
    )
    SELECT tp.nome AS tipo,
           p.denominador_escala,
           COALESCE(p.mi, p.inom, p.nome) AS identificador,
           p.uuid,
           l.nome AS lote,
           pf.data_fim
    FROM prod_fin AS pf
    INNER JOIN macrocontrole.produto AS p ON p.id = pf.id
    INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
    WHERE pf.finalizada IS TRUE
      AND pf.data_fim >= $<inicio>::timestamptz
      AND pf.data_fim < $<fimExclusivo>::timestamptz
    ORDER BY pf.data_fim, l.nome, identificador
    `,
    { inicio: `${inicio} 00:00:00`, fimExclusivo: `${fimExclusivo} 00:00:00` }
  )
}

// 2.1 Execução por bloco. Chaveado por bloco.id (há blocos com nome repetido, ex.
// linha CT e CDGV do mesmo lote). Só blocos ativos (status_id = 1) com alguma
// atividade finalizada no mês. Percentual concluído ACUMULADO até o fim do mês
// (data_fim <= fimMes), não até "agora" — assim um relatório de mês passado não
// conta finalizações posteriores. Operadores = quem finalizou atividade no mês
// (método documentado da skill consultar-sap). Número de produtos por bloco vem
// à parte (getNumProdutosPorBloco), pois é outra granularidade (produto x UT).
const getExecucaoBlocos = async (inicioMes, fimMes) => {
  return db.sapConn.any(
    `SELECT b.id, b.nome,
       COUNT(*) FILTER (WHERE a.tipo_situacao_id = 4 AND a.data_fim <= $<fimMes>::timestamptz) * 1.0
         / NULLIF(COUNT(*), 0) AS percentual,
       COUNT(DISTINCT a.usuario_id) FILTER (
         WHERE a.tipo_situacao_id = 4
           AND a.data_fim BETWEEN $<inicioMes>::timestamptz AND $<fimMes>::timestamptz
       ) AS num_operadores
     FROM macrocontrole.bloco AS b
     INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id
     INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
     WHERE b.status_id = 1 AND a.tipo_situacao_id BETWEEN 1 AND 5
     GROUP BY b.id, b.nome
     HAVING COUNT(*) FILTER (
       WHERE a.tipo_situacao_id = 4
         AND a.data_fim BETWEEN $<inicioMes>::timestamptz AND $<fimMes>::timestamptz
     ) > 0
     ORDER BY b.nome`,
    { inicioMes: `${inicioMes} 00:00:00`, fimMes: `${fimMes} 23:59:59` }
  )
}

// Número de produtos por bloco (chave = bloco.id). Produtos distintos ligados às
// UT de cada bloco.
const getNumProdutosPorBloco = async () => {
  return db.sapConn.any(
    `SELECT b.id, COUNT(DISTINCT rp.p_id)::int AS num_produtos
     FROM macrocontrole.bloco AS b
     INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id
     INNER JOIN macrocontrole.relacionamento_produto AS rp ON rp.ut_id = ut.id
     GROUP BY b.id`
  )
}

// Estado das metas de não-produção (lote_id nulo) com recorte por mês:
// realizado acumulado até o mês e realizado do próprio mês.
const getEstadoNaoProducao = async (ano, mes) => {
  return db.sapConn.any(
    `SELECT p.id, p.numero_meta, p.item, p.descricao, p.unidade, p.meta, p.prazo,
            COALESCE(SUM(e.quantidade) FILTER (WHERE e.mes <= $<mes>), 0)::int AS realizado_ano,
            COALESCE(SUM(e.quantidade) FILTER (WHERE e.mes = $<mes>), 0)::int AS realizado_mes
     FROM macrocontrole.pit AS p
     LEFT JOIN macrocontrole.pit_execucao_manual AS e ON e.pit_id = p.id
     WHERE p.ano = $<ano> AND p.lote_id IS NULL
     GROUP BY p.id
     ORDER BY p.numero_meta, p.item`,
    { ano, mes }
  )
}

// --------------------------------------------------------------------------
// Montagem das seções (composição em JS sobre os dados já buscados)
// --------------------------------------------------------------------------

// Estado Atual do PIT - produção: uma linha por lote (previsto = meta;
// realizado a partir das folhas finalizadas por mês, de acompanhamento.getInfoPIT).
const montaEstadoProducao = (infoPIT, mes) => {
  const porLote = {}
  for (const r of infoPIT) {
    const chave = r.lote
    if (!porLote[chave]) {
      porLote[chave] = { lote: r.lote, previsto: Number(r.meta) || 0, prontos_ano: 0, prontos_mes: 0 }
    }
    const m = Number(r.month)
    const fin = Number(r.finalizadas) || 0
    if (m <= mes) porLote[chave].prontos_ano += fin
    if (m === mes) porLote[chave].prontos_mes += fin
  }
  return Object.values(porLote).map(l => ({
    ...l,
    percentual: l.previsto > 0 ? Math.round((l.prontos_ano / l.previsto) * 1000) / 10 : null
  }))
}

const montaEstadoNaoProducao = (linhas) =>
  linhas.map(l => ({
    numero_meta: l.numero_meta,
    item: l.item,
    descricao: l.descricao,
    previsto: Number(l.meta) || 0,
    realizado_ano: l.realizado_ano,
    realizado_mes: l.realizado_mes,
    percentual: Number(l.meta) > 0 ? Math.round((l.realizado_ano / Number(l.meta)) * 1000) / 10 : null
  }))

// 2.1 Execução por Lote/Bloco: junta as stats por bloco (getExecucaoBlocos) com
// o número de produtos por bloco, ambos chaveados por bloco.id.
const montaExecucaoLote = (blocos, numProdutos) => {
  const produtosPorBloco = {}
  for (const n of numProdutos) produtosPorBloco[n.id] = n.num_produtos

  return blocos.map(b => ({
    bloco: b.nome,
    num_produtos: produtosPorBloco[b.id] || 0,
    num_operadores: Number(b.num_operadores) || 0,
    percentual: b.percentual == null ? null : Math.round(Number(b.percentual) * 1000) / 10
  }))
}

// 2.2 Entregas: detalhe (produto a produto) dos finalizados no mês. O UUID é o
// uuid do produto no SAP (é o mesmo identificador usado no BDGEx).
const montaEntregas = (produtosMes) =>
  produtosMes.map(p => ({
    tipo: p.tipo,
    escala: escalaDisplay(p.denominador_escala),
    uuid: p.uuid,
    identificador: p.identificador,
    lote: p.lote
  }))

// 2.3 Campo: filtra por sobreposição com o mês (sem filtro de data no controller).
// Não há categoria "Capacitação" no enum de campo do SAP, então não há exclusão.
const montaCampo = (campos, inicioMesDate, fimMesDate) =>
  campos
    .filter(c => {
      if (!c.inicio || !c.fim) return false
      const ini = new Date(c.inicio)
      const fim = new Date(c.fim)
      return ini <= fimMesDate && fim >= inicioMesDate
    })
    .map(c => ({
      local: c.nome,
      data: `${formatData(c.inicio)} a ${formatData(c.fim)}`,
      finalidade: Array.isArray(c.categorias) ? c.categorias.join(', ') : texto(c.categorias),
      efetivo: c.militares
    }))

// 2.5 Capacitações externas (ministrada)
const montaCapacitacaoMinistrada = (ministrada) =>
  ministrada.map(c => ({
    capacitacao: c.nome,
    periodo: `${formatData(c.inicio)}${c.fim ? ' a ' + formatData(c.fim) : ''}`,
    instituicoes: c.instituicoes,
    efetivo_capacitado: c.efetivo_capacitado
  }))

// 5.2 Capacitação do efetivo (recebida)
const montaCapacitacaoRecebida = (recebida) =>
  recebida.map(c => ({
    plano_codigo: c.plano_codigo,
    capacitacao: c.nome,
    instituicao: c.instituicoes,
    militar: c.militares
  }))

// 'YYYY-MM' de uma data (string 'YYYY-MM-DD' ou Date), sem deslocar fuso.
const anoMesDe = v => {
  if (!v) return null
  if (typeof v === 'string') return v.slice(0, 7)
  return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}`
}

// 2.6 Extra-PIT: só as demandas ENTREGUES no mês (data_entrega no mês). As sem
// data_entrega (ainda não entregues) não entram na 2.6 do mês.
const montaExtraPit = (extraPit, ano, mes) => {
  const alvo = `${ano}-${String(mes).padStart(2, '0')}`
  return extraPit
    .filter(e => anoMesDe(e.data_entrega) === alvo)
    .map(e => ({
      demandante: e.demandante,
      tipo_produto: e.tipo_produto,
      quantidade: e.quantidade,
      situacao: e.situacao,
      documento_autorizacao: e.documento_autorizacao,
      descricao: e.descricao,
      data_entrega: formatData(e.data_entrega)
    }))
}

// 5.1 Aproveitamento do efetivo (retrato do mês)
const montaAproveitamento = (linhas) =>
  linhas.map(l => ({
    militar: `${l.posto} ${l.nome_guerra}`,
    atividades: l.atividades
  }))

// --------------------------------------------------------------------------
// Orquestrador
// --------------------------------------------------------------------------

controller.gerarRelatorioSap = async ({ ano, mes }) => {
  // Os params chegam como string da URL (o schema_validation valida mas não
  // reescreve req.params); coagir para número evita concatenação ('7'+1='71')
  // e comparações estritas quebradas (mês).
  ano = Number(ano)
  mes = Number(mes)

  const inicioMes = isoDate(ano, mes, 1)
  const ultimoDia = ultimoDiaDoMes(ano, mes)
  const fimMes = isoDate(ano, mes, ultimoDia)
  const inicioAno = isoDate(ano, 1, 1)
  const inicioProxMes = mes === 12 ? isoDate(ano + 1, 1, 1) : isoDate(ano, mes + 1, 1)

  const [
    blocos,
    numProdutos,
    produtosAteMes,
    campos,
    capMes,
    capAno,
    extraPit,
    aproveitamento,
    infoPIT,
    naoProducao
  ] = await Promise.all([
    getExecucaoBlocos(inicioMes, fimMes),
    getNumProdutosPorBloco(),
    getProdutosFinalizados(inicioAno, inicioProxMes),
    campoCtrl.getCampos(),
    capacitacaoCtrl.getRPCMTec(inicioMes, fimMes),
    capacitacaoCtrl.getRPCMTec(inicioAno, fimMes),
    extraPitCtrl.getByAno(ano),
    rhCtrl.getAproveitamento(ano, mes),
    acompanhamentoCtrl.getInfoPIT(ano),
    getEstadoNaoProducao(ano, mes)
  ])

  // Produtos finalizados: mês (detalhe da 2.2) e recortes para os totais.
  const produtosMes = produtosAteMes.filter(p => {
    const d = new Date(p.data_fim)
    return d >= new Date(`${inicioMes}T00:00:00`) && d < new Date(`${inicioProxMes}T00:00:00`)
  })

  const inicioMesDate = new Date(`${inicioMes}T00:00:00`)
  const fimMesDate = new Date(`${fimMes}T23:59:59`)
  const camposDoMes = montaCampo(campos, inicioMesDate, fimMesDate)
  const camposDoAno = montaCampo(campos, new Date(`${inicioAno}T00:00:00`), fimMesDate)

  const estadoPitProducao = montaEstadoProducao(infoPIT, mes)
  const estadoPitNaoProducao = montaEstadoNaoProducao(naoProducao)
  const execucaoLote = montaExecucaoLote(blocos, numProdutos)
  const entregas = montaEntregas(produtosMes)
  const campo = camposDoMes
  const capacitacaoMinistrada = montaCapacitacaoMinistrada(capMes.ministrada)
  const capacitacaoRecebida = montaCapacitacaoRecebida(capMes.recebida)
  const extra = montaExtraPit(extraPit, ano, mes)
  const aprov = montaAproveitamento(aproveitamento)

  // Total de Capacitação (mês x ano)
  const somaEfetivo = lista => lista.reduce((s, c) => s + (Number(c.efetivo_capacitado) || 0), 0)
  const totalCapacitacao = [
    { indicador: 'Capacitações ministradas (nº)', mes: capMes.ministrada.length, ano: capAno.ministrada.length },
    { indicador: 'Efetivo capacitado (ministradas)', mes: somaEfetivo(capMes.ministrada), ano: somaEfetivo(capAno.ministrada) },
    { indicador: 'Capacitações recebidas (nº)', mes: capMes.recebida.length, ano: capAno.recebida.length }
  ]

  // Totais do Mês e do Ano (consolidado)
  const totais = [
    { indicador: 'Produtos finalizados', mes: produtosMes.length, ano: produtosAteMes.length },
    { indicador: 'Atividades de campo', mes: camposDoMes.length, ano: camposDoAno.length },
    { indicador: 'Capacitações ministradas', mes: capMes.ministrada.length, ano: capAno.ministrada.length },
    { indicador: 'Capacitações recebidas', mes: capMes.recebida.length, ano: capAno.recebida.length },
    { indicador: 'Extra-PIT entregues', mes: extra.length, ano: extraPit.filter(e => anoMesDe(e.data_entrega) && anoMesDe(e.data_entrega).slice(0, 4) === String(ano)).length }
  ]

  return {
    ano,
    mes,
    estadoPitProducao,
    estadoPitNaoProducao,
    execucaoLote,
    entregas,
    campo,
    capacitacaoMinistrada,
    extraPit: extra,
    aproveitamento: aprov,
    capacitacaoRecebida,
    totalCapacitacao,
    totais
  }
}

// --------------------------------------------------------------------------
// Export DOCX (mesmo padrão do SCO/SCA: lib docx, tabela com cabeçalho em
// negrito, uma linha de '-' quando vazia).
// --------------------------------------------------------------------------

const docxCelula = (valor, bold = false) => new TableCell({
  children: [new Paragraph({ children: [new TextRun({ text: texto(valor), bold })] })]
})

const docxTabela = (headers, linhas) => {
  const corpo = linhas.length > 0 ? linhas : [headers.map(() => '-')]
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(h => docxCelula(h, true)) }),
      ...corpo.map(celulas => new TableRow({ children: celulas.map(c => docxCelula(c)) }))
    ]
  })
}

controller.gerarRelatorioSapDocx = async ({ ano, mes }) => {
  const d = await controller.gerarRelatorioSap({ ano, mes })

  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `RPCMTec - Seção Produção e Pessoal (SAP) - ${String(mes).padStart(2, '0')}/${ano}` })]
    })
  ]

  const bloco = (titulo, headers, linhas) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: titulo })] }))
    children.push(docxTabela(headers, linhas))
    children.push(new Paragraph({ text: '' }))
  }

  bloco('Estado Atual do PIT — Produção (metas 1-3)',
    ['Lote', 'Previsto', 'Prontos (ano)', 'Prontos (mês)', '%'],
    d.estadoPitProducao.map(l => [texto(l.lote), texto(l.previsto), texto(l.prontos_ano), texto(l.prontos_mes), pct(l.percentual)]))

  bloco('Estado Atual do PIT — Não-produção (metas 4-7)',
    ['Meta', 'Item', 'Descrição', 'Previsto', 'Realizado (ano)', 'Realizado (mês)', '%'],
    d.estadoPitNaoProducao.map(l => [texto(l.numero_meta), texto(l.item), texto(l.descricao), texto(l.previsto), texto(l.realizado_ano), texto(l.realizado_mes), pct(l.percentual)]))

  bloco('2.1 Execução por Lote de Produção',
    ['Lote SAP', 'Nº de produtos', 'Nº de operadores', '% concluído'],
    d.execucaoLote.map(l => [texto(l.bloco), texto(l.num_produtos), texto(l.num_operadores), pct(l.percentual)]))

  bloco('2.2 Entregas de Produtos Finais',
    ['Tipo produto', 'Escala', 'UUID', 'Identificador', 'Lote SAP'],
    d.entregas.map(l => [texto(l.tipo), texto(l.escala), texto(l.uuid), texto(l.identificador), texto(l.lote)]))

  bloco('2.3 Atividades de Campo',
    ['Local', 'Data', 'Finalidade', 'Efetivo'],
    d.campo.map(l => [texto(l.local), texto(l.data), texto(l.finalidade), texto(l.efetivo)]))

  bloco('2.5 Capacitações Externas',
    ['Capacitação', 'Período', 'Instituições', 'Efetivo capacitado'],
    d.capacitacaoMinistrada.map(l => [texto(l.capacitacao), texto(l.periodo), texto(l.instituicoes), texto(l.efetivo_capacitado)]))

  bloco('2.6 Extra-PIT',
    ['Demandante', 'Tipo de produto', 'Qtd', 'Situação', 'Data de entrega', 'Documento autorização', 'Descrição'],
    d.extraPit.map(l => [texto(l.demandante), texto(l.tipo_produto), texto(l.quantidade), texto(l.situacao), texto(l.data_entrega), texto(l.documento_autorizacao), texto(l.descricao)]))

  bloco('5.1 Aproveitamento do Efetivo',
    ['Militar', 'Atividades'],
    d.aproveitamento.map(l => [texto(l.militar), texto(l.atividades)]))

  bloco('5.2 Capacitação do Efetivo',
    ['Plano / Código', 'Capacitação', 'Instituição', 'Militar'],
    d.capacitacaoRecebida.map(l => [texto(l.plano_codigo), texto(l.capacitacao), texto(l.instituicao), texto(l.militar)]))

  bloco('Total de Capacitação',
    ['Indicador', 'Total no mês', 'Total no ano'],
    d.totalCapacitacao.map(l => [texto(l.indicador), texto(l.mes), texto(l.ano)]))

  bloco('Totais do Mês e do Ano',
    ['Indicador', 'Total no mês', 'Total no ano'],
    d.totais.map(l => [texto(l.indicador), texto(l.mes), texto(l.ano)]))

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBuffer(doc)
}

module.exports = controller
