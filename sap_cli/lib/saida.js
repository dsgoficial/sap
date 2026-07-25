// Path: lib\saida.js
'use strict'

// Formatacao da saida. O padrao e COMPACTO, porque o consumidor e um agente com
// janela de contexto finita: o snapshot que a skill do vault produz hoje puxa 19
// rotas e devolve JSON completo, quando a pergunta era "quanto ja foi produzido".
//
// Regra de ouro: o --json continua existindo e devolve tudo, sem recorte. Quem
// vai encadear (ler um id e usar na proxima chamada) usa --json; quem vai LER
// usa o padrao.

/** Formata numero com separador pt-BR; devolve o resto intacto. */
function numero (v) {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  const inteiro = Math.trunc(Math.abs(n))
  const dec = Math.abs(n) - inteiro
  const grupos = String(inteiro).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const sinal = n < 0 ? '-' : ''
  if (!dec) return sinal + grupos
  return sinal + grupos + ',' + dec.toFixed(1).slice(2)
}

// Geometria WKT numa celula estoura qualquer largura util e nao se le a olho.
const LIMITE_CELULA = 120

function celula (chave, valor) {
  if (valor === null || valor === undefined || valor === '') return '-'
  if (typeof valor === 'boolean') return valor ? 'sim' : 'nao'
  if (typeof valor === 'object') {
    const texto = Array.isArray(valor) ? valor.join('|') : JSON.stringify(valor)
    return texto.length > LIMITE_CELULA ? texto.slice(0, LIMITE_CELULA) + '...' : texto
  }
  const texto = String(valor)
  // Datas ISO com hora viram so a data: hora nao ajuda a ler producao.
  const iso = texto.match(/^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}/)
  if (iso) return iso[1]
  if (texto.length > LIMITE_CELULA) return texto.slice(0, LIMITE_CELULA) + '...'
  // TSV com tabulacao dentro da celula quebraria a coluna seguinte.
  return texto.replace(/[\t\n\r]+/g, ' ')
}

/**
 * Decide quais colunas mostrar.
 * Prioridade: --campos explicito > colunas padrao do recurso > todas as chaves.
 * Coluna pedida que nao existe no dado vira aviso, nunca coluna vazia silenciosa.
 */
function escolherColunas (linhas, pedidas, padrao) {
  const presentes = new Set()
  for (const l of linhas) {
    if (l && typeof l === 'object') Object.keys(l).forEach(k => presentes.add(k))
  }

  if (pedidas && pedidas.length) {
    const existem = pedidas.filter(c => presentes.has(c))
    const faltam = pedidas.filter(c => !presentes.has(c))
    return { colunas: existem.length ? existem : [...presentes], faltam }
  }

  if (padrao && padrao.length) {
    const existem = padrao.filter(c => presentes.has(c))
    if (existem.length) return { colunas: existem, faltam: [] }
  }

  return { colunas: [...presentes], faltam: [] }
}

/** TSV: uma linha de cabecalho e uma por registro. O formato mais barato legivel. */
function tsv (linhas, colunas) {
  const saida = [colunas.join('\t')]
  for (const l of linhas) saida.push(colunas.map(c => celula(c, l[c])).join('\t'))
  return saida.join('\n')
}

/** Tabela alinhada por espacos: mais legivel para humano, um pouco mais cara. */
function tabela (linhas, colunas) {
  const larguras = colunas.map(c =>
    Math.max(c.length, ...linhas.map(l => celula(c, l[c]).length))
  )
  const cabecalho = colunas.map((c, i) => c.padEnd(larguras[i])).join('  ')
  const regua = larguras.map(w => '-'.repeat(w)).join('  ')
  const corpo = linhas.map(l =>
    colunas.map((c, i) => celula(c, l[c]).padEnd(larguras[i])).join('  ')
  )
  return [cabecalho, regua, ...corpo].join('\n')
}

/**
 * Renderiza uma lista de registros.
 * @returns {{texto: string, avisos: string[]}}
 */
function lista (dados, opcoes = {}) {
  const avisos = []

  if (!Array.isArray(dados)) {
    return { texto: JSON.stringify(dados, null, 2), avisos }
  }
  if (!dados.length) return { texto: '(nenhum registro)', avisos }

  const formato = opcoes.formato || 'tsv'
  if (formato === 'json') return { texto: JSON.stringify(dados, null, 2), avisos }

  const { colunas, faltam } = escolherColunas(dados, opcoes.campos, opcoes.padrao)
  if (faltam.length) {
    avisos.push(
      `Colunas inexistentes neste recurso, ignoradas: ${faltam.join(', ')}. ` +
      'Veja as colunas disponiveis com --json.'
    )
  }

  const texto = formato === 'tabela' ? tabela(dados, colunas) : tsv(dados, colunas)
  const total = new Set(dados.flatMap(d => (d && typeof d === 'object' ? Object.keys(d) : []))).size
  const rodape = `\n(${dados.length} registro${dados.length === 1 ? '' : 's'}` +
    `, ${colunas.length} de ${total} colunas)`
  return { texto: texto + rodape, avisos }
}

/** Renderiza um registro unico como pares chave: valor. */
function registro (dado, opcoes = {}) {
  if (dado === null || dado === undefined) return '(vazio)'
  if (typeof dado !== 'object') return String(dado)
  if (Array.isArray(dado)) return lista(dado, opcoes).texto
  if ((opcoes.formato || 'tsv') === 'json') return JSON.stringify(dado, null, 2)

  const chaves = opcoes.campos && opcoes.campos.length
    ? opcoes.campos.filter(c => c in dado)
    : Object.keys(dado)
  if (!chaves.length) return '(vazio)'
  const largura = Math.max(...chaves.map(c => c.length))
  return chaves.map(c => `${c.padEnd(largura)}  ${celula(c, dado[c])}`).join('\n')
}

module.exports = { lista, registro, numero, celula, escolherColunas, tsv, tabela }
