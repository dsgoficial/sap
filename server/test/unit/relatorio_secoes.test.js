import { describe, it, expect } from 'vitest'
import relatorioCtrl from '../../src/relatorio/relatorio_ctrl.js'

// A LISTA de subseções que o SAP gera e o modo como elas viram seções do
// documento. Não toca o banco: `agruparEmSecoes` é função pura sobre o objeto
// que `gerarRelatorioSap` devolve.
//
// O que se protege aqui é a DIVISÃO DE TRABALHO com o SCA. O RPCMTec é um
// relatório só, gerado em dois lugares: se o SAP passar a emitir uma subseção
// que o SCA já emite, a edição sai com a mesma tabela duas vezes, preenchida de
// dois jeitos, e nada acusa.

const { SUBSECOES, agruparEmSecoes } = relatorioCtrl

// As subseções do RPCMTec que o SCA gera (rpcmtec/rpcmtec_ctrl.js, medido em
// 2026-08-02). Escritas aqui de propósito: importar do outro repositório não é
// possível, e um teste que lesse a mesma fonte que o código concordaria com
// qualquer coisa.
const DO_SCA = ['2.7', '3.1', '3.2', '3.4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '7.2', '7.3']

const vazio = {
  estadoPit: [],
  totais: [],
  execucaoLote: [],
  entregas: [],
  campo: [],
  capacitacaoMinistrada: [],
  capacitacaoMinistradaTotais: [],
  extraPit: [],
  aproveitamento: [],
  capacitacaoRecebida: []
}

describe('relatorio_ctrl: as subseções do SAP', () => {
  it('gera as nove subseções, na numeração do documento', () => {
    expect(SUBSECOES.map(s => s.numero)).toEqual([
      '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.3', '6.1', '6.2'
    ])
  })

  it('não invade nenhuma subseção do SCA', () => {
    for (const sub of SUBSECOES) {
      expect(DO_SCA).not.toContain(sub.numero)
    }
  })

  it('os cabeçalhos são os do modelo, palavra por palavra', () => {
    // Colável na subseção de mesmo número quer dizer com o MESMO cabeçalho:
    // "Lote SAP" e não "Lote", "Prontos" e não "Prontos (ano)".
    const porNumero = Object.fromEntries(SUBSECOES.map(s => [s.numero, s.cabecalhos]))
    expect(porNumero['2.1']).toEqual([
      'Meta', 'Item', 'Produto ou serviço', 'Quantidade', 'Prontos no mês', 'Prontos', 'Previsão de término'
    ])
    expect(porNumero['2.2']).toEqual(['Tipo de produto', 'Quantidade no mês', 'Quantidade no ano'])
    expect(porNumero['2.3']).toEqual(['Lote SAP', 'Número de Produtos', 'Número de operadores', 'Percentual concluído'])
    expect(porNumero['2.4']).toEqual(['Tipo produto', 'Escala', 'UUID BDGEx', 'Identificador', 'Meta PIT', 'Lote SAP'])
    expect(porNumero['2.5']).toEqual(['Local', 'Data', 'Finalidade Campo', 'Efetivo'])
    expect(porNumero['2.6']).toEqual(['Capacitação', 'Período', 'Instituições participantes', 'Efetivo capacitado'])
    // O modelo NÃO tem coluna de data de entrega na 3.3: a data é o critério do
    // recorte mensal, e não uma célula.
    expect(porNumero['3.3']).toEqual(['Demandante', 'Tipo de produto', 'Qtd', 'Situação', 'Documento autorização', 'Descrição'])
    expect(porNumero['6.1']).toEqual(['Militar', 'Atividades'])
    expect(porNumero['6.2']).toEqual(['Plano / Código', 'Capacitação', 'Instituição', 'Militar'])
  })

  it('agrupa nas três seções do documento, na ordem do documento', () => {
    const secoes = agruparEmSecoes(vazio)
    expect(secoes.map(s => s.titulo)).toEqual([
      '2. EXECUÇÃO DO PIT', '3. MAPOTECA', '6. RECURSOS HUMANOS'
    ])
    expect(secoes[0].subsecoes.map(s => s.numero)).toEqual(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'])
    expect(secoes[1].subsecoes.map(s => s.numero)).toEqual(['3.3'])
    expect(secoes[2].subsecoes.map(s => s.numero)).toEqual(['6.1', '6.2'])
  })

  it('a 2.6 sem capacitação nenhuma NÃO ganha as linhas de total', () => {
    // Tabela vazia sai com a linha de '-' do modelo; um "Total no ano" pendurado
    // nela diria que houve algo a totalizar.
    const secoes = agruparEmSecoes({
      ...vazio,
      capacitacaoMinistradaTotais: [{ rotulo: 'Total no ano', valor: '30' }]
    })
    const sub26 = secoes[0].subsecoes.find(s => s.numero === '2.6')
    expect(sub26.linhas).toEqual([])
  })

  it('a 2.6 com capacitação ganha os totais, mesclados em três colunas', () => {
    const secoes = agruparEmSecoes({
      ...vazio,
      capacitacaoMinistrada: [{
        capacitacao: 'Curso', periodo: '01/07/2026', instituicoes: 'EsAO', efetivo_capacitado: '30'
      }],
      capacitacaoMinistradaTotais: [
        { rotulo: 'Total militares no ano', valor: '-' },
        { rotulo: 'Total civis no ano', valor: '-' },
        { rotulo: 'Total no ano', valor: '30' }
      ]
    })
    const sub26 = secoes[0].subsecoes.find(s => s.numero === '2.6')
    expect(sub26.linhas).toHaveLength(4)
    expect(sub26.linhas[3]).toEqual([{ texto: 'Total no ano', span: 3 }, '30'])
  })

  it('cada linha montada tem uma célula por cabeçalho', () => {
    // Linha mais curta que o cabeçalho deixa a coluna final sem célula, e num
    // layout fixo a tabela sai torta sem erro nenhum.
    const dados = {
      ...vazio,
      estadoPit: [{
        meta: 'Meta 1', meta_texto: 'Meta 1', item: '1.1', produto_servico: 'Carta',
        quantidade: '24', prontos_mes: '0', prontos_ano: '16', previsao_termino: 'AGO 26'
      }],
      totais: [{ tipo_produto: 'Total geral', mes: '0', ano: '35' }],
      execucaoLote: [{ lote: 'Bloco', num_produtos: '18', num_operadores: '8', percentual: '22.5%' }],
      entregas: [{ tipo: 'CT', escala: '1:25.000', uuid: 'x', identificador: 'y', meta_pit: '1.1', lote: 'L' }],
      campo: [{ local: 'Cascavel', data: '26/07/2026', finalidade: 'Reambulação', efetivo: '1º Ten' }],
      extraPit: [{
        demandante: 'DSG', tipo_produto: 'CT', quantidade: '1', situacao: 'Concluído',
        documento_autorizacao: 'DIEx', descricao: '-'
      }],
      aproveitamento: [{ militar: 'Maj Diniz', atividades: '-' }],
      capacitacaoRecebida: [{ plano_codigo: '-', capacitacao: 'X', instituicao: '-', militar: '-' }]
    }
    for (const secao of agruparEmSecoes(dados)) {
      for (const sub of secao.subsecoes) {
        for (const linha of sub.linhas) {
          expect(linha).toHaveLength(sub.cabecalhos.length)
        }
      }
    }
  })
})

describe('relatorio_ctrl: as linhas da 2.2', () => {
  it('traz os rótulos do modelo, na ordem do modelo', () => {
    expect(relatorioCtrl.LINHAS_TOTAIS.map(l => l.rotulo)).toEqual([
      'Carta Topográfica',
      'Carta Ortoimagem',
      'CDGV EDGV 3.0',
      'Carta Militar (BDGEx Op)',
      'MGCP (blocos)',
      'Modelo 3D',
      'Imagens panorâmicas 360°'
    ])
  })

  it('casa por CÓDIGO do domínio, nunca por nome', () => {
    // Derivar do nome ("começa com Carta Topográfica") acerta o catálogo de hoje
    // e cai calado no primeiro tipo novo, num relatório que o chefe assina.
    const porRotulo = Object.fromEntries(
      relatorioCtrl.LINHAS_TOTAIS.map(l => [l.rotulo, l.codigos])
    )
    // 2 = 'Carta Topográfica - T34-700', 12 = 'Carta Topográfica - ET-RDG'
    expect(porRotulo['Carta Topográfica']).toEqual([2, 12])
    expect(porRotulo['Carta Ortoimagem']).toEqual([3])
    expect(porRotulo['CDGV EDGV 3.0']).toEqual([7])
  })

  it('a linha que o SAP não sabe contar declara isso, em vez de sair zero', () => {
    // '-' quer dizer "o SAP não conta isto"; 0 quer dizer "contei e deu zero".
    // Trocar um pelo outro é o modo de falhar mais perigoso desta tabela.
    const semFonte = relatorioCtrl.LINHAS_TOTAIS
      .filter(l => l.codigos === null)
      .map(l => l.rotulo)
    expect(semFonte).toEqual([
      'Carta Militar (BDGEx Op)',
      'MGCP (blocos)',
      'Modelo 3D',
      'Imagens panorâmicas 360°'
    ])
  })
})
