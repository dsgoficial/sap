"use strict";

const { db } = require("../database");

const controller = {};

const calculaFila = async usuario => {
  return db
    .task(async t => {
      let fila_prioritaria = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria as f
        INNER JOIN macrocontrole.execucao_etapa as ee ON ee.id = f.execucao_etapa_id
        WHERE f.usuario_id = $1 ORDER BY f.prioridade LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria != null) {
        return fila_prioritaria;
      }

      let fila_prioritaria_grupo = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria_grupo as f
        INNER JOIN macrocontrole.execucao_etapa as ee ON ee.id = f.execucao_etapa_id
        WHERE f.perfil_producao_id = $1 ORDER BY f.prioridade LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria_grupo != null) {
        return fila_prioritaria_grupo;
      }

      let cartas_pausadas = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee
        INNER JOIN macrocontrole.perfil_producao_etapa as pse ON pse.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        WHERE ee.operador_atual = $1 and ee.tipo_situacao_id = 3
        ORDER BY lo.prioridade, pse.prioridade, ut.prioridade LIMIT 1`,
        [usuario]
      );

      if (cartas_pausadas != null) {
        return cartas_pausadas;
      }

      let prioridade_operador = await t.oneOrNone(
        `SELECT etapa_id, unidade_trabalho_id
        FROM (
        SELECT ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, lo.prioridade AS lo_prioridade, pse.prioridade AS pse_prioridade, ut.prioridade AS ut_prioridade
        FROM macrocontrole.execucao_etapa AS ee
        INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
        INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
        INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.execucao_etapa AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id 
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel = TRUE AND ppo.usuario_id = $1 AND ee.tipo_situacao_id = 1
        AND ee.id NOT IN        
        (
          SELECT ee.id FROM macrocontrole.execucao_etapa AS ee
          INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
          INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
          LEFT JOIN macrocontrole.restricao_etapa AS re ON re.etapa_2_id = ee.etapa_id
          LEFT JOIN macrocontrole.execucao_etapa AS ee_re ON ee_re.etapa_id = re.etapa_1_id
            AND ee_re.unidade_trabalho_id = ee.unidade_trabalho_id
          LEFT JOIN dgeo.usuario AS u_re ON u_re.id = ee_re.operador_atual
          WHERE ppo.usuario_id = $1 AND (
            (re.tipo_restricao_id = 1 AND ee_re.operador_atual = $1) OR
            (re.tipo_restricao_id = 2 AND ee_re.operador_atual != $1) OR 
            (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
          )
        )
        AND ee.id NOT IN
        (
          SELECT execucao_etapa_id FROM macrocontrole.fila_prioritaria
        )
        ) AS sit
        GROUP BY etapa_id, unidade_trabalho_id, lo_prioridade, pse_prioridade, ut_prioridade
        HAVING MIN(situacao_ant) IS NULL or MIN(situacao_ant) = 4
        ORDER BY lo_prioridade, pse_prioridade, ut_prioridade
        LIMIT 1`,
        [usuario]
      );

      if (prioridade_operador) {
        return prioridade_operador;
      }

      return null;
    })
    .then(prioridade => {
      return { erro: null, prioridade: prioridade };
    })
    .catch(error => {
      const err = new Error("Falha durante calculo da fila.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.usuario_id = usuario;
      err.information.trace = error;
      return { erro: err, prioridade: null };
    });
};

const dadosProducao = async (etapa, unidade_trabalho) => {
  return db
    .task(async t => {
      let dadosut = await t.one(
        `SELECT u.id as usuario_id, u.nome_guerra, up.tipo_perfil_sistema_id, s.nome as subfase_nome, 
        ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom,
        ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, e.nome as etapa_nome
        FROM macrocontrole.execucao_etapa as ee
        INNER JOIN macrocontrole.etapa as se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.tipo_etapa as e ON e.id = se.tipo_etapa_id
        INNER JOIN macrocontrole.subfase as s ON s.id = se.subfase_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        LEFT JOIN dgeo.usuario AS u ON u.id = ee.operador_atual
        LEFT JOIN macrocontrole.usuario_perfil_sistema AS up ON up.usuario_id = u.id
        WHERE ee.etapa_id = $1 and ee.unidade_trabalho_id = $2`,
        [etapa, unidade_trabalho]
      );

      const info = {};
      info.usuario_id = dadosut.usuario_id;
      info.usuario = dadosut.nome_guerra;
      info.perfil = dadosut.tipo_perfil_sistema_id;
      info.atividade = {};

      let camadas = await t.any(
        `SELECT c.nome
        FROM macrocontrole.perfil_propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.etapa_id = $1`,
        [etapa]
      );

      let estilos = await t.any(
        "SELECT nome FROM macrocontrole.perfil_estilo WHERE etapa_id = $1",
        [etapa]
      );

      let regras = await t.any(
        "SELECT nome FROM macrocontrole.perfil_regras WHERE etapa_id = $1",
        [etapa]
      );

      let menus = await t.any(
        "SELECT nome FROM macrocontrole.perfil_menu WHERE etapa_id = $1",
        [etapa]
      );

      let fme = await t.any(
        "SELECT servidor_fme, categoria_fme FROM macrocontrole.perfil_fme WHERE etapa_id = $1",
        [etapa]
      );

      let monitoramento = await t.any(
        `SELECT tm.nome as tipo_monitoramento, c.nome as camada
        FROM macrocontrole.perfil_monitoramento AS pm
        INNER JOIN macrocontrole.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento 
        LEFT JOIN macrocontrole.camada AS c ON c.id = pm.camada_id
        WHERE etapa_id = $1`,
        [etapa]
      );

      let rotinas = await t.any(
        `SELECT r.nome, c1.nome as camada, c2.nome as camada_apontamento, pr.parametros
        FROM macrocontrole.perfil_rotina AS pr
        INNER JOIN macrocontrole.tipo_rotina AS r ON r.code = pr.tipo_rotina
        INNER JOIN macrocontrole.camada AS c1 ON c1.id = pr.camada_id
        INNER JOIN macrocontrole.camada AS c2 ON c2.id = pr.camada_apontamento_id
        WHERE pr.etapa_id = $1`,
        [etapa]
      );

      let insumos = await t.any(
        `SELECT i.nome, i.caminho
        FROM macrocontrole.insumo AS i
        INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id
        WHERE iut.unidade_trabalho_id = $1`,
        [unidade_trabalho]
      );

      info.atividade.unidade_trabalho = dadosut.unidade_trabalho_nome;
      info.atividade.geom = dadosut.unidade_trabalho_geom;
      info.atividade.unidade_trabalho_id = unidade_trabalho;
      info.atividade.subfase_etapa_id = etapa;
      info.atividade.nome =
        dadosut.subfase_nome +
        " - " +
        dadosut.etapa_nome +
        " - " +
        dadosut.unidade_trabalho_nome;
      info.atividade.banco_dados = {
        nome: dadosut.nome_bd,
        servidor: dadosut.servidor,
        porta: dadosut.porta
      };
      info.atividade.fme = {
        categoria: fme.categoria_fme,
        servidor: fme.servidor_fme
      };

      info.atividade.estilos = [];
      info.atividade.regras = [];
      info.atividade.menus = [];
      info.atividade.camadas = [];

      estilos.forEach(r => info.atividade.estilos.push(r.nome));
      regras.forEach(r => info.atividade.regras.push(r.nome));
      menus.forEach(r => info.atividade.menus.push(r.nome));
      camadas.forEach(r => info.atividade.camadas.push({ nome: r.nome }));

      info.atividade.monitoramento = [];
      monitoramento.forEach(m => {
        info.atividade.monitoramento.push({
          tipo: m.tipo_monitoramento,
          camada: m.camada
        });
      });

      info.atividade.rotinas = {};
      rotinas.forEach(r => {
        if (!(r.nome in info.atividade.rotinas)) {
          info.atividade.rotinas[r.nome] = [];
        }
        let aux = {
          camada: r.camada,
          camada_apontamento: r.camada_apontamento
        };

        if (r.parametros) {
          let param = JSON.parse(r.parametros);
          aux = { ...aux, ...param };
        }

        info.atividade.rotinas[r.nome].push(aux);
      });

      info.atividade.insumos = [];
      insumos.forEach(i => {
        info.atividade.insumos.push({
          nome: i.nome,
          caminho: i.caminho
        });
      });

      info.atividade.linhagem = await t.any(
        `SELECT u.nome_guerra, ee.data_inicio, ee.data_fim, sit.nome as situacao,
        sub.nome as subfase, et.nome as etapa
        FROM macrocontrole.execucao_etapa AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.subfase as sub ON sub.id = se.subfase_id
        INNER JOIN macrocontrole.tipo_etapa as et ON et.id = se.tipo_etapa_id
        INNER JOIN dgeo.usuario AS u ON u.id = ee.operador_atual
        INNER JOIN macrocontrole.tipo_situacao AS sit ON sit.code = ee.tipo_situacao_id
        WHERE ee.unidade_trabalho_id = $1 and ee.etapa_id != $2
        ORDER BY se.ordem`,
        [unidade_trabalho, etapa]
      );

      let requisitos = await t.any(
        `SELECT r.descricao
        FROM macrocontrole.requisito_finalizacao AS r
        INNER JOIN macrocontrole.etapa AS se ON se.id = r.etapa_id
        WHERE r.etapa_id = $1`,
        [etapa]
      );
      info.atividade.requisitos = [];
      requisitos.forEach(r => info.atividade.requisitos.push(r.descricao));
      info.atividade.requisitos.sort();

      return info;
    })
    .then(info => {
      return { erro: null, dados: info };
    })
    .catch(error => {
      const err = new Error("Falha durante calculo dos dados de Producao.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.etapa_id = etapa;
      err.information.unidade_trabalho_id = unidade_trabalho;
      err.information.trace = error;
      return { erro: err, dados: null };
    });
};

controller.verifica = async usuario_id => {
  try {
    let em_andamento = await db.oneOrNone(
      `SELECT etapa_id, unidade_trabalho_id
      FROM macrocontrole.execucao_etapa
      WHERE operador_atual = $1 and tipo_situacao_id = 2 LIMIT 1`,
      [usuario_id]
    );

    if (em_andamento) {
      const { erro, dados } = await dadosProducao(
        em_andamento.etapa_id,
        em_andamento.unidade_trabalho_id
      );
      if (erro) {
        return { verificaError: erro, dados: null };
      }
      return { verificaError: null, dados: dados };
    } else {
      return { verificaError: null, dados: null };
    }
  } catch (error) {
    const err = new Error("Falha durante tentativa de verificação.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.trace = error;
    return { verificaError: err, dados: null };
  }
};

controller.finaliza = async (usuario_id, etapa_id, unidade_trabalho_id) => {
  const data_fim = new Date();
  try {
    let result = await db.result(
      `UPDATE macrocontrole.execucao_etapa SET
      data_fim = $1, tipo_situacao_id = 4
      WHERE etapa_id = $2 and unidade_trabalho_id = $3 and operador_atual = $4`,
      [data_fim, etapa_id, unidade_trabalho_id, usuario_id]
    );

    if (!result.rowCount || result.rowCount != 1) {
      throw new Error("Erro ao finalizar atividade. Atividade não encontrada.");
    }

    return { finalizaError: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de finalização.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.etapa_id = etapa_id;
    err.information.unidade_trabalho_id = unidade_trabalho_id;
    err.information.trace = error;
    return { finalizaError: err };
  }
};

controller.inicia = async usuario_id => {
  const data_inicio = new Date();
  const { erro, prioridade } = await calculaFila(usuario_id);
  if (erro) {
    return { iniciaError: erro, dados: null };
  }
  if (!prioridade) {
    return { iniciaError: null, dados: null };
  }
  return db
    .tx(async t => {
      await t.none(
        `UPDATE macrocontrole.execucao_etapa SET
          tipo_situacao_id = 3 
          WHERE tipo_situacao_id = 2 and operador_atual = $1`,
        [usuario_id]
      );
      await t.none(
        `DELETE FROM macrocontrole.fila_prioritaria
          WHERE execucao_etapa_id IN (
          SELECT id from macrocontrole.execucao_etapa WHERE etapa_id = $1 and unidade_trabalho_id = $2)`,
        [prioridade.etapa_id, prioridade.unidade_trabalho_id]
      );
      let result = await t.result(
        `UPDATE macrocontrole.execucao_etapa SET
          data_inicio = $1, tipo_situacao_id = 2, operador_atual = $4
          WHERE etapa_id = $2 and unidade_trabalho_id = $3 and (tipo_situacao_id = 1 or tipo_situacao_id = 3)`,
        [
          data_inicio,
          prioridade.etapa_id,
          prioridade.unidade_trabalho_id,
          usuario_id
        ]
      );

      if (!result.rowCount) {
        throw new Error("Não pode iniciar a tarefa selecionada para a fila.");
      }

      return result;
    })
    .then(async data => {
      const { erro, dados } = await dadosProducao(
        prioridade.etapa_id,
        prioridade.unidade_trabalho_id
      );
      if (erro) {
        return { iniciaError: erro, dados: null };
      }
      return { iniciaError: null, dados };
    })
    .catch(error => {
      const err = new Error("Falha durante tentativa de inicialização.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.usuario_id = usuario_id;
      err.information.trace = error;
      return { iniciaError, dados: null };
    });
};

module.exports = controller;
