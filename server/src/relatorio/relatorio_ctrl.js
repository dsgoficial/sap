'use strict'

// As subseções do RPCMTec que saem do SAP, na numeração do documento da Divisão.
//
// A NUMERAÇÃO É A DO MODELO, e não uma nossa. Até 2026-08-02 este gerador tinha
// numeração própria (a execução por lote saía como "2.1", o Extra-PIT como
// "2.6", o efetivo como "5.1") e formatação default da biblioteca `docx`. O
// RPCMTec é UM relatório: o SCA gera parte das tabelas, o SAP gera outra parte,
// e o chefe assina uma edição só. Com duas numerações, quem montava a edição
// tinha de descobrir a cada mês qual "2.1" era qual, e reformatar tabela a
// tabela no Word. Hoje cada tabela sai com o NÚMERO e a FORMATAÇÃO da subseção
// de mesmo nome no documento mestre (ver relatorio_docx.js), e colar é colar.
//
// O QUE O SAP GERA. Só as subseções que o SAP sabe preencher INTEIRAS e que o
// SCA não gera -- a divisão de trabalho entre os dois é por DONO DO DADO:
//
//   2.1  Estado Atual do PIT          macrocontrole.pit (produção e não-produção)
//   2.2  Totais do Mês e do Ano       produtos finalizados por tipo
//   2.3  Execução por Lote            bloco x atividade finalizada
//   2.4  Entregas detalhada           produto finalizado no mês, um por linha
//   2.5  Atividades de campo          controle_campo.campo
//   2.6  Capacitações externas        controle_capacitacao, tipo Ministrada
//   3.3  Extra-PIT                    macrocontrole.extra_pit
//   6.1  Aproveitamento do efetivo    recurso_humano.aproveitamento_mes
//   6.2  Capacitação do efetivo       controle_capacitacao, tipo Recebida
//
// FICA DE FORA o que é do SCA (2.7 Estado do Acervo, 3.1/3.2/3.4 mapoteca,
// 4.1 a 4.7 PDR, 7.2/7.3 insumos de impressão) e o que não tem dono em sistema
// nenhum, para ninguém procurar o que não existe:
//
//   5.1  Repositórios trabalhados  vem do painel do GitHub.
//   5.2  Backup                    não há cadastro de backup.
//   7.1  Equipamento indisponível  não há cadastro de equipamento técnico.
//   8.   Divulgação                não há cadastro de publicação em BI.
//   9.   Boas práticas             é texto do chefe, não dado.
//
// A 3.3 é do SAP e não do SCA de propósito: o RPCMTec chama de Extra-PIT a
// exceção AUTORIZADA (o modelo tem coluna "Documento autorização"), e quem
// guarda o que a distingue de um pedido comum fora do PIT é
// `macrocontrole.extra_pit`, onde o documento é obrigatório. Derivá-la no SCA
// de `previsto_pit` dava 23 linhas onde a edição real de julho/2026 traz 1.
//
// O MESMO OBJETO alimenta a tela e o arquivo. `gerarRelatorioSap()` devolve as
// subseções já com as células em TEXTO, e o DOCX só as desenha. Foi assim de
// propósito: com a tela lendo números crus e o arquivo formatando por conta, as
// duas divergiam no arredondamento e no separador de milhar, e quem conferia o
// DOCX contra a tela via diferença onde não havia.

const { db } = require('../database')
const rhCtrl = require('../rh/rh_ctrl')
const campoCtrl = require('../campo/campo_ctrl')
const capacitacaoCtrl = require('../capacitacao/capacitacao_ctrl')
const extraPitCtrl = require('../extra_pit/extra_pit_ctrl')
const acompanhamentoCtrl = require('../acompanhamento/acompanhamento_ctrl')
const { montarDocumento } = require('./relatorio_docx')

const controller = {}

// --------------------------------------------------------------------------
// Helpers de data e formatação
// --------------------------------------------------------------------------

const isoDate = (ano, mes, dia) =>
  `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

// Último dia do mês (mes 1..12): new Date(ano, mes, 0) = dia 0 do mês seguinte.
const ultimoDiaDoMes = (ano, mes) => new Date(ano, mes, 0).getDate()

// '-' é como o modelo escreve "não houve" e "não se aplica". Célula em branco
// seria "ainda não preenchi", que é outra coisa.
const texto = valor => (valor == null || valor === '' ? '-' : String(valor))

// Data como Date local, sem deslocar fuso. String só-data ('YYYY-MM-DD') parseada
// por `new Date()` vira meia-noite UTC, e `getDate()` local devolve o dia anterior
// em UTC-3.
const paraData = valor => {
  if (!valor) return null
  const d = valor instanceof Date
    ? valor
    : typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}/.test(valor)
      ? new Date(valor.slice(0, 10) + 'T00:00:00')
      : new Date(valor)
  return isNaN(d.getTime()) ? null : d
}

// dd/mm/aaaa; '-' quando vazio/inválido.
const formatData = valor => {
  const d = paraData(valor)
  if (!d) return '-'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const MESES_ABREV = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
]

// "Previsão de término" no formato do modelo: "AGO 26". O modelo também traz
// "1º trim 2026" e "Mensal" em algumas linhas, que são texto escrito à mão no
// documento; o SAP guarda uma DATA, e é ela que sai.
const formatPrazo = valor => {
  const d = paraData(valor)
  if (!d) return '-'
  return `${MESES_ABREV[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
}

// Separador de milhar do modelo ("4.200"). Vale para as duas saídas, tela e DOCX.
const numero = v => (v == null ? '-' : Number(v).toLocaleString('pt-BR'))

const escalaDisplay = den => (den ? `1:${Number(den).toLocaleString('pt-BR')}` : '-')

const pct = v => (v == null ? '-' : `${v}%`)

// 'YYYY-MM' de uma data (string 'YYYY-MM-DD' ou Date), sem deslocar fuso.
const anoMesDe = v => {
  if (!v) return null
  if (typeof v === 'string') return v.slice(0, 7)
  return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}`
}

// --------------------------------------------------------------------------
// 2.2: as linhas do modelo, e de onde cada uma sai
// --------------------------------------------------------------------------

// A 2.2 do documento tem linhas de RÓTULO FIXO ("CDGV EDGV 3.0", "Modelo 3D"),
// que não são os nomes de `dominio.tipo_produto` (23 entradas, com nomes como
// "Conjunto de dados geoespaciais vetoriais - ET-EDGV 3.0"). O casamento é por
// CÓDIGO do domínio, nunca por prefixo do nome: derivar do nome acerta o
// catálogo de hoje e cai calado no primeiro tipo novo, num relatório que o chefe
// assina.
//
// `codigos: null` é a resposta honesta de "o SAP não conta isto", e sai '-' nas
// duas colunas -- que é diferente de 0, que quer dizer "contei e deu zero":
//
//   Carta Militar (BDGEx Op)   é CARGA no BDGEx Op, e não produção; o SAP não a
//                              registra.
//   MGCP (blocos)              a linha pede BLOCO e o SAP conta FOLHA. O bloco
//                              W058N06 tem 30 folhas: escrever 30 onde o
//                              documento espera 1 erra por um fator de 30.
//   Modelo 3D                  produto de campo; controle_campo guarda a
//                              CATEGORIA da atividade, não a quantidade gerada.
//   Imagens panorâmicas 360°   idem.
//
// O que não cai em nenhuma linha entra em "Outros produtos", que só aparece
// quando tem contagem. Sem essa linha, um tipo novo sumiria da tabela e o
// "Total geral" ficaria maior que a soma do que se vê -- que é o modo de falhar
// mais perigoso desta tabela. É por ali que aparecem as FOLHAS de MGCP, os
// modelos de elevação e a fototriangulação: a linha "MGCP (blocos)" continua
// '-' porque a unidade dela é outra, e a folha não some.
const LINHAS_TOTAIS = [
  { rotulo: 'Carta Topográfica', codigos: [2, 12] },
  { rotulo: 'Carta Ortoimagem', codigos: [3] },
  { rotulo: 'CDGV EDGV 3.0', codigos: [7] },
  { rotulo: 'Carta Militar (BDGEx Op)', codigos: null },
  { rotulo: 'MGCP (blocos)', codigos: null },
  { rotulo: 'Modelo 3D', codigos: null },
  { rotulo: 'Imagens panorâmicas 360°', codigos: null }
]

const ROTULO_OUTROS = 'Outros produtos'

// --------------------------------------------------------------------------
// SQL (o que os controllers existentes não cobrem)
// --------------------------------------------------------------------------

// Produtos finalizados (TODAS as UT do produto finalizadas) entre [inicio, fim).
// Nível de produto, com tipo/escala/identificador/lote e a meta do PIT do lote
// (a coluna "Meta PIT" da 2.4). O `uuid` do produto no SAP é o mesmo
// identificador usado no BDGEx. Adaptação da CTE de acompanhamento.getFinalizadasAno.
const getProdutosFinalizados = async (inicio, fimExclusivo, ano) => {
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
           p.tipo_produto_id,
           p.denominador_escala,
           COALESCE(p.mi, p.inom, p.nome) AS identificador,
           p.uuid,
           l.nome AS lote,
           pit.numero_meta,
           pit.item AS meta_item,
           pf.data_fim
    FROM prod_fin AS pf
    INNER JOIN macrocontrole.produto AS p ON p.id = pf.id
    INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
    LEFT JOIN macrocontrole.pit AS pit ON pit.lote_id = l.id AND pit.ano = $<ano>
    WHERE pf.finalizada IS TRUE
      AND pf.data_fim >= $<inicio>::timestamptz
      AND pf.data_fim < $<fimExclusivo>::timestamptz
    ORDER BY pf.data_fim, l.nome, identificador
    `,
    { inicio: `${inicio} 00:00:00`, fimExclusivo: `${fimExclusivo} 00:00:00`, ano }
  )
}

// 2.3 Execução por bloco. Chaveado por bloco.id (há blocos com nome repetido, ex.
// linha CT e CDGV do mesmo lote). Só blocos ativos (status_id = 1) com alguma
// atividade finalizada no mês. Percentual concluído ACUMULADO até o fim do mês
// (data_fim <= fimMes), não até "agora" -- assim um relatório de mês passado não
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

// 2.1 Estado Atual do PIT: TODAS as metas do ano, produção e não-produção na
// MESMA consulta, porque no documento elas são uma tabela só, ordenada por meta
// e item. O realizado de cada uma vem de fonte diferente e é somado depois: a de
// produção, das folhas finalizadas (acompanhamento.getInfoPIT); a de
// não-produção, do lançamento mensal manual, que já sai agregado aqui.
const getEstadoPit = async (ano, mes) => {
  return db.sapConn.any(
    `SELECT p.id, p.lote_id, p.numero_meta, p.nome_meta, p.item, p.descricao,
            p.unidade, p.meta, p.prazo::text AS prazo, l.nome AS lote,
            COALESCE(SUM(e.quantidade) FILTER (WHERE e.mes <= $<mes>), 0)::int AS manual_ano,
            COALESCE(SUM(e.quantidade) FILTER (WHERE e.mes = $<mes>), 0)::int AS manual_mes
     FROM macrocontrole.pit AS p
     LEFT JOIN macrocontrole.lote AS l ON l.id = p.lote_id
     LEFT JOIN macrocontrole.pit_execucao_manual AS e ON e.pit_id = p.id
     WHERE p.ano = $<ano>
     GROUP BY p.id, l.nome
     ORDER BY p.numero_meta NULLS LAST, p.item NULLS LAST, l.nome`,
    { ano, mes }
  )
}

// --------------------------------------------------------------------------
// Montagem das subseções (cada uma devolve as LINHAS já em texto)
// --------------------------------------------------------------------------

// 2.1: uma linha por meta do PIT. A coluna "Meta" é MESCLADA verticalmente entre
// as linhas da mesma meta, como no documento (ver relatorio_docx.js): a primeira
// linha do grupo traz o nome e as seguintes continuam a célula. Grupo de uma
// linha só sai sem mesclagem, que é o que o modelo faz na Meta 2 e na Meta 5.
//
// `nome_meta` nulo vira só "Meta N": o nome é dado desde 2.3.5, e as metas
// cadastradas antes não o têm. Chutar "Produção de Geoinformação" para toda
// meta 1 gravaria um palpite no relatório como se fosse registro.
const montaEstadoPit = (metas, infoPIT, mes) => {
  // Finalizadas por lote: mês e acumulado até o mês. `getInfoPIT` já ancora a
  // grade de meses no ano pedido, então um relatório de ano passado não trunca.
  const porLote = {}
  for (const r of infoPIT) {
    if (!porLote[r.lote]) porLote[r.lote] = { ano: 0, mes: 0 }
    const m = Number(r.month)
    const fin = Number(r.finalizadas) || 0
    if (m <= mes) porLote[r.lote].ano += fin
    if (m === mes) porLote[r.lote].mes += fin
  }

  const linhas = metas.map(m => {
    const producao = m.lote_id != null
    const fin = producao ? (porLote[m.lote] || { ano: 0, mes: 0 }) : null
    return {
      numero_meta: m.numero_meta,
      nome_meta: m.nome_meta,
      // Meta de produção sem descrição cadastrada cai no nome do lote, que é o
      // que o SAP sabe dizer sobre ela.
      produto_servico: m.descricao || m.lote || null,
      item: m.item,
      quantidade: m.meta,
      prontos_mes: producao ? fin.mes : m.manual_mes,
      prontos_ano: producao ? fin.ano : m.manual_ano,
      prazo: m.prazo
    }
  })

  // Quantas linhas tem cada meta, para decidir mesclagem.
  const tamanho = {}
  for (const l of linhas) {
    const chave = l.numero_meta == null ? '?' : String(l.numero_meta)
    tamanho[chave] = (tamanho[chave] || 0) + 1
  }

  let anterior = null
  return linhas.map(l => {
    const chave = l.numero_meta == null ? '?' : String(l.numero_meta)
    const primeira = chave !== anterior
    anterior = chave

    const rotulo = l.numero_meta == null
      ? '-'
      : `Meta ${l.numero_meta}${l.nome_meta ? ` - ${l.nome_meta}` : ''}`

    let celulaMeta
    if (tamanho[chave] === 1) celulaMeta = rotulo
    else if (primeira) celulaMeta = { texto: rotulo, merge: 'restart' }
    else celulaMeta = { texto: '', merge: 'continue' }

    return {
      meta: celulaMeta,
      meta_texto: rotulo,
      item: texto(l.item),
      produto_servico: texto(l.produto_servico),
      quantidade: numero(l.quantidade),
      prontos_mes: numero(l.prontos_mes),
      prontos_ano: numero(l.prontos_ano),
      previsao_termino: formatPrazo(l.prazo)
    }
  })
}

// 2.2: os rótulos do modelo, na ordem do modelo, mais "Outros produtos" quando
// houver, mais o "Total geral". A linha que o SAP não sabe contar sai '-' nas
// duas colunas; o total soma só o que é contável, e por isso ele fecha com a
// soma das linhas visíveis com número.
const montaTotais = (produtosMes, produtosAno) => {
  const contar = (produtos, codigos) =>
    produtos.filter(p => codigos.includes(Number(p.tipo_produto_id))).length

  const mapeados = new Set(
    LINHAS_TOTAIS.flatMap(l => l.codigos || [])
  )

  const linhas = LINHAS_TOTAIS.map(l => ({
    tipo_produto: l.rotulo,
    mes: l.codigos ? numero(contar(produtosMes, l.codigos)) : '-',
    ano: l.codigos ? numero(contar(produtosAno, l.codigos)) : '-'
  }))

  const outrosMes = produtosMes.filter(p => !mapeados.has(Number(p.tipo_produto_id)))
  const outrosAno = produtosAno.filter(p => !mapeados.has(Number(p.tipo_produto_id)))
  if (outrosAno.length > 0) {
    linhas.push({
      tipo_produto: ROTULO_OUTROS,
      mes: numero(outrosMes.length),
      ano: numero(outrosAno.length)
    })
  }

  linhas.push({
    tipo_produto: 'Total geral',
    mes: numero(produtosMes.length),
    ano: numero(produtosAno.length)
  })

  return linhas
}

// 2.3 Execução por Lote: junta as stats por bloco (getExecucaoBlocos) com o
// número de produtos por bloco, ambos chaveados por bloco.id.
const montaExecucaoLote = (blocos, numProdutos) => {
  const produtosPorBloco = {}
  for (const n of numProdutos) produtosPorBloco[n.id] = n.num_produtos

  return blocos.map(b => ({
    lote: b.nome,
    num_produtos: numero(produtosPorBloco[b.id] || 0),
    num_operadores: numero(Number(b.num_operadores) || 0),
    percentual: pct(b.percentual == null ? null : Math.round(Number(b.percentual) * 1000) / 10)
  }))
}

// 2.4 Entregas: detalhe (produto a produto) dos finalizados no mês. "Meta PIT" é
// o item da meta do lote ("1.1"); sem item cadastrado sobra o número da meta.
const montaEntregas = produtosMes =>
  produtosMes.map(p => ({
    tipo: texto(p.tipo),
    escala: escalaDisplay(p.denominador_escala),
    uuid: texto(p.uuid),
    identificador: texto(p.identificador),
    meta_pit: p.meta_item || (p.numero_meta != null ? `Meta ${p.numero_meta}` : '-'),
    lote: texto(p.lote)
  }))

// 2.5 Campo: filtra por sobreposição com o mês (o controller não filtra data).
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
      local: texto(c.nome),
      data: `${formatData(c.inicio)} a ${formatData(c.fim)}`,
      finalidade: Array.isArray(c.categorias) ? c.categorias.join(', ') : texto(c.categorias),
      efetivo: texto(c.militares)
    }))

// 2.6 Capacitações externas (Ministrada), com as três linhas de total do modelo.
//
// O modelo separa "Total militares no ano" de "Total civis no ano", e
// `controle_capacitacao.capacitacao` guarda um `efetivo_capacitado` só, sem a
// divisão. Os dois saem '-' e só o total fecha: faltar de uma linha é visível,
// ao contrário de dividir por chute e aparecer na errada.
const montaCapacitacaoMinistrada = (ministradaMes, ministradaAno) => {
  const linhas = ministradaMes.map(c => ({
    capacitacao: texto(c.nome),
    periodo: `${formatData(c.inicio)}${c.fim ? ' a ' + formatData(c.fim) : ''}`,
    instituicoes: texto(c.instituicoes),
    efetivo_capacitado: texto(c.efetivo_capacitado)
  }))

  const totalAno = ministradaAno.reduce(
    (s, c) => s + (Number(c.efetivo_capacitado) || 0), 0
  )

  return {
    linhas,
    totais: [
      { rotulo: 'Total militares no ano', valor: '-' },
      { rotulo: 'Total civis no ano', valor: '-' },
      { rotulo: 'Total no ano', valor: numero(totalAno) }
    ]
  }
}

// 6.2 Capacitação do efetivo (Recebida)
const montaCapacitacaoRecebida = recebida =>
  recebida.map(c => ({
    plano_codigo: texto(c.plano_codigo),
    capacitacao: texto(c.nome),
    instituicao: texto(c.instituicoes),
    militar: texto(c.militares)
  }))

// 3.3 Extra-PIT: só as demandas ENTREGUES no mês (data_entrega no mês). As sem
// data_entrega (ainda não entregues) não entram na 3.3 do mês. O modelo NÃO tem
// coluna de data de entrega: ela é o critério do recorte, não uma célula.
const montaExtraPit = (extraPit, ano, mes) => {
  const alvo = `${ano}-${String(mes).padStart(2, '0')}`
  return extraPit
    .filter(e => anoMesDe(e.data_entrega) === alvo)
    .map(e => ({
      demandante: texto(e.demandante),
      tipo_produto: texto(e.tipo_produto),
      quantidade: numero(e.quantidade),
      situacao: texto(e.situacao),
      documento_autorizacao: texto(e.documento_autorizacao),
      descricao: texto(e.descricao)
    }))
}

// 6.1 Aproveitamento do efetivo (retrato do mês)
const montaAproveitamento = linhas =>
  linhas.map(l => ({
    militar: `${l.posto} ${l.nome_guerra}`,
    atividades: texto(l.atividades)
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
    metasPit
  ] = await Promise.all([
    getExecucaoBlocos(inicioMes, fimMes),
    getNumProdutosPorBloco(),
    getProdutosFinalizados(inicioAno, inicioProxMes, ano),
    campoCtrl.getCampos(),
    capacitacaoCtrl.getRPCMTec(inicioMes, fimMes),
    capacitacaoCtrl.getRPCMTec(inicioAno, fimMes),
    extraPitCtrl.getByAno(ano),
    rhCtrl.getAproveitamento(ano, mes),
    acompanhamentoCtrl.getInfoPIT(ano),
    getEstadoPit(ano, mes)
  ])

  // Produtos finalizados: o recorte do mês sai do recorte do ano, sem segunda ida
  // ao banco.
  const inicioMesDate = new Date(`${inicioMes}T00:00:00`)
  const inicioProxMesDate = new Date(`${inicioProxMes}T00:00:00`)
  const produtosMes = produtosAteMes.filter(p => {
    const d = new Date(p.data_fim)
    return d >= inicioMesDate && d < inicioProxMesDate
  })

  const fimMesDate = new Date(`${fimMes}T23:59:59`)
  const capacitacaoMinistrada = montaCapacitacaoMinistrada(capMes.ministrada, capAno.ministrada)

  return {
    ano,
    mes,
    estadoPit: montaEstadoPit(metasPit, infoPIT, mes),
    totais: montaTotais(produtosMes, produtosAteMes),
    execucaoLote: montaExecucaoLote(blocos, numProdutos),
    entregas: montaEntregas(produtosMes),
    campo: montaCampo(campos, inicioMesDate, fimMesDate),
    capacitacaoMinistrada: capacitacaoMinistrada.linhas,
    capacitacaoMinistradaTotais: capacitacaoMinistrada.totais,
    extraPit: montaExtraPit(extraPit, ano, mes),
    aproveitamento: montaAproveitamento(aproveitamento),
    capacitacaoRecebida: montaCapacitacaoRecebida(capMes.recebida)
  }
}

// --------------------------------------------------------------------------
// As subseções, na numeração e com os cabeçalhos do documento da Divisão
// --------------------------------------------------------------------------

// Uma entrada por subseção: o número (que escolhe a grade de coluna em
// relatorio_docx.js), o título, os cabeçalhos COPIADOS do modelo e como virar
// linha. É esta lista que a tela e o DOCX percorrem -- ter duas era o que fazia
// a tela e o arquivo divergirem.
const SUBSECOES = [
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.1',
    titulo: 'Estado Atual do PIT',
    chave: 'estadoPit',
    vazio: 'Sem metas do PIT cadastradas no ano',
    cabecalhos: ['Meta', 'Item', 'Produto ou serviço', 'Quantidade', 'Prontos no mês', 'Prontos', 'Previsão de término'],
    // A célula "Meta" pode ser um objeto de mesclagem; as demais são texto.
    linha: l => [l.meta, l.item, l.produto_servico, l.quantidade, l.prontos_mes, l.prontos_ano, l.previsao_termino]
  },
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.2',
    titulo: 'Totais do Mês e do Ano',
    chave: 'totais',
    vazio: 'Sem totais',
    cabecalhos: ['Tipo de produto', 'Quantidade no mês', 'Quantidade no ano'],
    linha: l => [l.tipo_produto, l.mes, l.ano]
  },
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.3',
    titulo: 'Execução por Lote de Produção',
    chave: 'execucaoLote',
    vazio: 'Sem blocos com atividade finalizada no mês',
    cabecalhos: ['Lote SAP', 'Número de Produtos', 'Número de operadores', 'Percentual concluído'],
    linha: l => [l.lote, l.num_produtos, l.num_operadores, l.percentual]
  },
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.4',
    titulo: 'Entregas detalhada de produtos finais (BDGEx, IGW, EBGeo) no mês',
    chave: 'entregas',
    vazio: 'Sem produtos finalizados no mês',
    cabecalhos: ['Tipo produto', 'Escala', 'UUID BDGEx', 'Identificador', 'Meta PIT', 'Lote SAP'],
    linha: l => [l.tipo, l.escala, l.uuid, l.identificador, l.meta_pit, l.lote]
  },
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.5',
    titulo: 'Atividades de campo',
    chave: 'campo',
    vazio: 'Sem atividades de campo no mês',
    cabecalhos: ['Local', 'Data', 'Finalidade Campo', 'Efetivo'],
    linha: l => [l.local, l.data, l.finalidade, l.efetivo]
  },
  {
    secao: '2. EXECUÇÃO DO PIT',
    numero: '2.6',
    titulo: 'Capacitações externas',
    chave: 'capacitacaoMinistrada',
    vazio: 'Sem capacitações ministradas no mês',
    cabecalhos: ['Capacitação', 'Período', 'Instituições participantes', 'Efetivo capacitado'],
    linha: l => [l.capacitacao, l.periodo, l.instituicoes, l.efetivo_capacitado],
    // As três linhas de total do modelo: o rótulo ocupa as três primeiras
    // colunas (w:gridSpan) e o número fica na quarta.
    rodape: dados => dados.capacitacaoMinistradaTotais.map(t => [
      { texto: t.rotulo, span: 3 }, t.valor
    ])
  },
  {
    secao: '3. MAPOTECA',
    numero: '3.3',
    titulo: 'Extra-PIT',
    chave: 'extraPit',
    vazio: 'Sem demandas Extra-PIT entregues no mês',
    cabecalhos: ['Demandante', 'Tipo de produto', 'Qtd', 'Situação', 'Documento autorização', 'Descrição'],
    linha: l => [l.demandante, l.tipo_produto, l.quantidade, l.situacao, l.documento_autorizacao, l.descricao]
  },
  {
    secao: '6. RECURSOS HUMANOS',
    numero: '6.1',
    titulo: 'Aproveitamento do efetivo',
    chave: 'aproveitamento',
    vazio: 'Sem efetivo lançado no mês',
    cabecalhos: ['Militar', 'Atividades'],
    linha: l => [l.militar, l.atividades]
  },
  {
    secao: '6. RECURSOS HUMANOS',
    numero: '6.2',
    titulo: 'Capacitação do efetivo',
    chave: 'capacitacaoRecebida',
    vazio: 'Sem capacitações recebidas no mês',
    cabecalhos: ['Plano / Código', 'Capacitação', 'Instituição', 'Militar'],
    linha: l => [l.plano_codigo, l.capacitacao, l.instituicao, l.militar]
  }
]

// Agrupa as subseções pela seção do documento, preservando a ordem em que
// aparecem acima (que é a do modelo).
const agruparEmSecoes = dados => {
  const secoes = []
  for (const sub of SUBSECOES) {
    let secao = secoes.find(s => s.titulo === sub.secao)
    if (!secao) {
      secao = { titulo: sub.secao, subsecoes: [] }
      secoes.push(secao)
    }
    const linhas = (dados[sub.chave] || []).map(sub.linha)
    // O rodapé só entra quando a tabela tem corpo: numa tabela sem linha o
    // gerador escreve a linha de '-' do modelo, e um total pendurado nela diria
    // que houve algo a totalizar.
    if (sub.rodape && linhas.length > 0) linhas.push(...sub.rodape(dados))
    secao.subsecoes.push({
      numero: sub.numero,
      titulo: sub.titulo,
      cabecalhos: sub.cabecalhos,
      linhas
    })
  }
  return secoes
}

controller.gerarRelatorioSapDocx = async ({ ano, mes }) => {
  const dados = await controller.gerarRelatorioSap({ ano, mes })
  return montarDocumento({
    ano: dados.ano,
    mes: dados.mes,
    secoes: agruparEmSecoes(dados)
  })
}

// Exportados para o teste e para o client saberem quais subseções o SAP gera,
// sem repetir a lista (lista repetida é lista que diverge).
controller.SUBSECOES = SUBSECOES
controller.LINHAS_TOTAIS = LINHAS_TOTAIS
controller.agruparEmSecoes = agruparEmSecoes

module.exports = controller
