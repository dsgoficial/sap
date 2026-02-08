'use strict'

const { db } = require('../database')
const { AppError, httpCode } = require('../utils')

const controller = {}

const FILTROS = {
  HORAS_UTEIS_MINIMAS: 1,        // Mínimo de horas úteis (elimina testes/erros)
  AREA_MINIMA_KM2: 25,           // Mínimo de área em km² (elimina UTs muito pequenas)
  HORAS_UTEIS_MAXIMAS: 500       // Máximo de horas úteis (elimina outliers absurdos)
}


controller.getPrevisao = async (atividadeId) => {
  const atividade = await buscarAtividade(atividadeId)
  const taxaSistema = await buscarTaxaSistema(
    atividade.subfase_id,
    atividade.etapa_id,
    atividade.tipo_etapa_id,
    atividade.denominador_escala
  )
  let taxaOperador = null
  if (atividade.usuario_id) {
    taxaOperador = await buscarTaxaOperador(
      atividade.usuario_id,
      atividade.subfase_id,
      atividade.etapa_id,
      atividade.denominador_escala
    )
  }
  return calcularPrevisoes(atividade, taxaSistema, taxaOperador)
}

async function buscarAtividade(atividadeId) {
  const atividade = await db.sapConn.oneOrNone(`
    SELECT 
        a.id AS atividade_id,
        a.data_inicio,
        a.data_fim,
        a.usuario_id,
        tpg.nome_abrev || ' ' || u.nome_guerra AS operador_nome,
        e.subfase_id,
        s.nome AS subfase_nome,
        e.id AS etapa_id,
        te.nome AS etapa_nome,
        e.tipo_etapa_id,
        ut.id AS unidade_trabalho_id,
        ut.nome AS unidade_trabalho_nome,
        ST_Area(ut.geom::geography) / 1000000 AS area_km2,
        l.id AS lote_id,
        l.nome AS lote_nome,
        l.denominador_escala,
        b.nome AS bloco_nome,
        p.nome AS projeto_nome
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    LEFT JOIN dgeo.usuario AS u ON u.id = a.usuario_id
    LEFT JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE a.id = $1
  `, [atividadeId])
  
  if (!atividade) {
    throw new AppError('Atividade não encontrada', httpCode.NotFound)
  }
  
  return atividade
}

async function buscarTaxaSistema(subfaseId, etapaId, tipoEtapaId, escala) {
  let taxa = await db.sapConn.oneOrNone(`
    SELECT 
        'exato' AS nivel,
        COUNT(*) AS total_atividades,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS taxa_mediana_h_por_km2,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_75
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    WHERE 
        EXTRACT(YEAR FROM a.data_inicio) = 2025
        AND e.subfase_id = $1
        AND l.denominador_escala = $2
        AND a.data_fim IS NOT NULL
        AND a.data_fim > a.data_inicio
        AND a.usuario_id IS NOT NULL
        AND calcular_horas_uteis(a.data_inicio, a.data_fim) BETWEEN $3 AND $4
        AND ST_Area(ut.geom::geography) / 1000000 >= $5
    HAVING COUNT(*) >= 3
  `, [subfaseId, escala, FILTROS.HORAS_UTEIS_MINIMAS, FILTROS.HORAS_UTEIS_MAXIMAS, FILTROS.AREA_MINIMA_KM2])
  
  if (taxa) return taxa
  
  taxa = await db.sapConn.oneOrNone(`
    SELECT 
        'parcial' AS nivel,
        COUNT(*) AS total_atividades,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS taxa_mediana_h_por_km2,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_75
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE 
        EXTRACT(YEAR FROM a.data_inicio) = 2025
        AND e.subfase_id = $1
        AND a.data_fim IS NOT NULL
        AND a.data_fim > a.data_inicio
        AND a.usuario_id IS NOT NULL
        AND calcular_horas_uteis(a.data_inicio, a.data_fim) BETWEEN $2 AND $3
        AND ST_Area(ut.geom::geography) / 1000000 >= $4
    HAVING COUNT(*) >= 3
  `, [subfaseId, FILTROS.HORAS_UTEIS_MINIMAS, FILTROS.HORAS_UTEIS_MAXIMAS, FILTROS.AREA_MINIMA_KM2])
  
  if (taxa) return taxa
  
  taxa = await db.sapConn.oneOrNone(`
    SELECT 
        'generico' AS nivel,
        COUNT(*) AS total_atividades,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS taxa_mediana_h_por_km2,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS percentil_75
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE 
        EXTRACT(YEAR FROM a.data_inicio) = 2025
        AND e.tipo_etapa_id = $1
        AND a.data_fim IS NOT NULL
        AND a.data_fim > a.data_inicio
        AND a.usuario_id IS NOT NULL
        AND calcular_horas_uteis(a.data_inicio, a.data_fim) BETWEEN $2 AND $3
        AND ST_Area(ut.geom::geography) / 1000000 >= $4
    HAVING COUNT(*) >= 3
  `, [tipoEtapaId, FILTROS.HORAS_UTEIS_MINIMAS, FILTROS.HORAS_UTEIS_MAXIMAS, FILTROS.AREA_MINIMA_KM2])
  
  return taxa
}


async function buscarTaxaOperador(usuarioId, subfaseId, etapaId, escala) {
  let taxa = await db.sapConn.oneOrNone(`
    SELECT 
        'exato' AS nivel,
        COUNT(*) AS total_atividades,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS taxa_mediana_h_por_km2
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    WHERE 
        EXTRACT(YEAR FROM a.data_inicio) = 2025
        AND a.usuario_id = $1
        AND e.subfase_id = $2
        AND l.denominador_escala = $3
        AND a.data_fim IS NOT NULL
        AND a.data_fim > a.data_inicio
        AND calcular_horas_uteis(a.data_inicio, a.data_fim) BETWEEN $4 AND $5
        AND ST_Area(ut.geom::geography) / 1000000 >= $6
    HAVING COUNT(*) >= 2
  `, [usuarioId, subfaseId, escala, FILTROS.HORAS_UTEIS_MINIMAS, FILTROS.HORAS_UTEIS_MAXIMAS, FILTROS.AREA_MINIMA_KM2])
  
  if (taxa) return taxa
  
  taxa = await db.sapConn.oneOrNone(`
    SELECT 
        'parcial' AS nivel,
        COUNT(*) AS total_atividades,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY calcular_horas_uteis(a.data_inicio, a.data_fim) / (ST_Area(ut.geom::geography) / 1000000)) AS taxa_mediana_h_por_km2
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE 
        EXTRACT(YEAR FROM a.data_inicio) = 2025
        AND a.usuario_id = $1
        AND e.subfase_id = $2
        AND a.data_fim IS NOT NULL
        AND a.data_fim > a.data_inicio
        AND calcular_horas_uteis(a.data_inicio, a.data_fim) BETWEEN $3 AND $4
        AND ST_Area(ut.geom::geography) / 1000000 >= $5
    HAVING COUNT(*) >= 2
  `, [usuarioId, subfaseId, FILTROS.HORAS_UTEIS_MINIMAS, FILTROS.HORAS_UTEIS_MAXIMAS, FILTROS.AREA_MINIMA_KM2])
  
  return taxa
}

function calcularPrevisoes(atividade, taxaSistema, taxaOperador) {
  const response = {
    atividade: {
      id: atividade.atividade_id,
      projeto: atividade.projeto_nome,
      lote: atividade.lote_nome,
      bloco: atividade.bloco_nome,
      subfase: atividade.subfase_nome,
      etapa: atividade.etapa_nome,
      unidade_trabalho: atividade.unidade_trabalho_nome,
      area_km2: parseFloat(atividade.area_km2.toFixed(2)),
      escala: `1:${atividade.denominador_escala}`,
      operador: atividade.operador_nome,
      data_inicio: atividade.data_inicio,
      data_fim: atividade.data_fim
    },
    status: atividade.data_fim ? 'finalizada' : (atividade.data_inicio ? 'em_execucao' : 'nao_iniciada')
  }
  
  if (taxaSistema) {
    const horasSistema = atividade.area_km2 * taxaSistema.taxa_mediana_h_por_km2
    const dataBase = atividade.data_inicio || new Date()
    const prazoSistema = calcularPrazoComDiasUteis(dataBase, horasSistema)
    
    response.previsao_sistema = {
      horas_estimadas: parseFloat(horasSistema.toFixed(2)),
      prazo_estimado: prazoSistema,
      taxa_h_por_km2: parseFloat(taxaSistema.taxa_mediana_h_por_km2.toFixed(6)),
      base_calculo: {
        nivel: taxaSistema.nivel,
        amostras: taxaSistema.total_atividades,
        metrica: 'mediana (horas úteis)',
        filtros_aplicados: {
          horas_minimas: FILTROS.HORAS_UTEIS_MINIMAS,
          area_minima_km2: FILTROS.AREA_MINIMA_KM2
        }
      }
    }
  } else {
    response.previsao_sistema = {
      disponivel: false,
      mensagem: 'Não há dados históricos suficientes'
    }
  }
  
  if (taxaOperador && atividade.data_inicio) {
    const horasOperador = atividade.area_km2 * taxaOperador.taxa_mediana_h_por_km2
    const prazoOperador = calcularPrazoComDiasUteis(atividade.data_inicio, horasOperador)
    
    let diferencaPercentual = null
    if (taxaSistema) {
      diferencaPercentual = parseFloat(
        (((taxaOperador.taxa_mediana_h_por_km2 - taxaSistema.taxa_mediana_h_por_km2) / taxaSistema.taxa_mediana_h_por_km2) * 100).toFixed(2)
      )
    }
    
    response.previsao_operador = {
      horas_estimadas: parseFloat(horasOperador.toFixed(2)),
      prazo_estimado: prazoOperador,
      taxa_h_por_km2: parseFloat(taxaOperador.taxa_mediana_h_por_km2.toFixed(6)),
      base_calculo: {
        nivel: taxaOperador.nivel,
        amostras: taxaOperador.total_atividades,
        metrica: 'mediana (horas úteis)',
        filtros_aplicados: {
          horas_minimas: FILTROS.HORAS_UTEIS_MINIMAS,
          area_minima_km2: FILTROS.AREA_MINIMA_KM2
        }
      },
      diferenca_vs_sistema: {
        percentual: diferencaPercentual,
        performance: diferencaPercentual === null ? 'sem_referencia' :
                    diferencaPercentual < -10 ? 'mais_rapido' :
                    diferencaPercentual > 10 ? 'mais_lento' : 'similar'
      }
    }
  }
  
  return response
}

function calcularPrazoComDiasUteis(dataInicio, horasEstimadas) {
  const resultado = new Date(dataInicio)
  let horasRestantes = horasEstimadas
  
  while (horasRestantes > 0) {
    const diaSemana = resultado.getDay()
    
    if (diaSemana === 0) {
      resultado.setDate(resultado.getDate() + 1)
      continue
    }
    if (diaSemana === 6) {
      resultado.setDate(resultado.getDate() + 2)
      continue
    }
    
    const horasDoDia = (diaSemana === 5) ? 4 : 6 // Sexta = 4h, resto = 6h
    
    if (horasRestantes >= horasDoDia) {
      resultado.setDate(resultado.getDate() + 1)
      horasRestantes -= horasDoDia
    } else {
      resultado.setHours(resultado.getHours() + horasRestantes)
      horasRestantes = 0
    }
  }
  
  return resultado
}

/**
 * Obtém previsão de prazo para todas as subfases de um lote
 * Retorna o pior caso (atividade mais lenta) de cada subfase
 */
controller.getPrevisaoLote = async (loteId) => {
  // 1. Buscar informações do lote
  const lote = await db.sapConn.oneOrNone(`
    SELECT 
      l.id,
      l.nome,
      l.denominador_escala,
      p.nome AS projeto_nome
    FROM macrocontrole.lote AS l
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    WHERE l.id = $1
  `, [loteId])
  
  if (!lote) {
    throw new AppError('Lote não encontrado', httpCode.NotFound)
  }
  
  // 2. Buscar todas as atividades disponíveis do lote agrupadas por subfase
  const atividades = await db.sapConn.any(`
    SELECT 
      a.id AS atividade_id,
      s.id AS subfase_id,
      s.nome AS subfase_nome,
      ut.id AS unidade_trabalho_id,
      ut.nome AS unidade_trabalho_nome,
      ST_Area(ut.geom::geography) / 1000000 AS area_km2,
      a.usuario_id,
      tpg.nome_abrev || ' ' || u.nome_guerra AS operador_nome,
      a.data_inicio,
      e.tipo_etapa_id
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    LEFT JOIN dgeo.usuario AS u ON u.id = a.usuario_id
    LEFT JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE 
      ut.lote_id = $1
      AND ut.disponivel = true
      AND a.data_fim IS NULL
    ORDER BY s.id, a.id
  `, [loteId])
  
  if (atividades.length === 0) {
    return {
      lote: {
        id: lote.id,
        nome: lote.nome,
        projeto: lote.projeto_nome,
        escala: `1:${lote.denominador_escala}`
      },
      subfases: [],
      resumo: {
        total_subfases: 0,
        total_atividades: 0,
        mensagem: 'Nenhuma atividade disponível neste lote'
      }
    }
  }
  
  // 3. Agrupar por subfase
  const subfasesMap = {}
  
  for (const ativ of atividades) {
    if (!subfasesMap[ativ.subfase_id]) {
      subfasesMap[ativ.subfase_id] = {
        subfase_id: ativ.subfase_id,
        subfase_nome: ativ.subfase_nome,
        atividades: []
      }
    }
    subfasesMap[ativ.subfase_id].atividades.push(ativ)
  }
  
  // 4. Calcular previsão de cada subfase (pior caso)
  const subfasesResultado = []
  
  for (const subfaseId in subfasesMap) {
    const subfase = subfasesMap[subfaseId]
    const previsoes = []
    
    // Calcular previsão para cada atividade
    for (const ativ of subfase.atividades) {
      try {
        // Buscar taxa do sistema
        const taxaSistema = await buscarTaxaSistema(
          ativ.subfase_id,
          null, // etapa_id não importa aqui
          ativ.tipo_etapa_id,
          lote.denominador_escala
        )
        
        if (!taxaSistema) continue
        
        const horasEstimadas = ativ.area_km2 * taxaSistema.taxa_mediana_h_por_km2
        const dataBase = ativ.data_inicio || new Date()
        const prazoEstimado = calcularPrazoComDiasUteis(dataBase, horasEstimadas)
        
        previsoes.push({
          atividade_id: ativ.atividade_id,
          unidade_trabalho: ativ.unidade_trabalho_nome,
          area_km2: parseFloat(ativ.area_km2.toFixed(2)),
          operador: ativ.operador_nome,
          data_inicio: ativ.data_inicio,
          horas_estimadas: parseFloat(horasEstimadas.toFixed(2)),
          prazo_estimado: prazoEstimado,
          taxa_h_por_km2: parseFloat(taxaSistema.taxa_mediana_h_por_km2.toFixed(6))
        })
      } catch (error) {
        // Se der erro em uma atividade, continua para as outras
        console.error(`Erro ao calcular previsão para atividade ${ativ.atividade_id}:`, error)
      }
    }
    
    if (previsoes.length === 0) continue
    
    // Encontrar o pior caso (maior horas estimadas)
    const piorCaso = previsoes.reduce((max, prev) => 
      prev.horas_estimadas > max.horas_estimadas ? prev : max
    )
    
    subfasesResultado.push({
      subfase_id: subfase.subfase_id,
      subfase_nome: subfase.subfase_nome,
      total_atividades: previsoes.length,
      pior_caso: piorCaso
    })
  }
  
  // 5. Montar resposta
  return {
    lote: {
      id: lote.id,
      nome: lote.nome,
      projeto: lote.projeto_nome,
      escala: `1:${lote.denominador_escala}`
    },
    subfases: subfasesResultado,
    resumo: {
      total_subfases: subfasesResultado.length,
      total_atividades: atividades.length
    }
  }
}

module.exports = controller