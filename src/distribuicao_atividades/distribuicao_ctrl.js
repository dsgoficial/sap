"use strict";

const { db } = require("../database");

const controller = {};

const calculaFila = async usuario => {
  return db
    .task(async t => {
      let fila_prioritaria = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria as f
        INNER JOIN macrocontrole.atividade as ee ON ee.id = f.atividade_id
        WHERE f.usuario_id = $1 ORDER BY f.prioridade LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria != null) {
        return fila_prioritaria;
      }

      let fila_prioritaria_grupo = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria_grupo as f
        INNER JOIN macrocontrole.atividade as ee ON ee.id = f.atividade_id
        WHERE f.perfil_producao_id = $1 ORDER BY f.prioridade LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria_grupo != null) {
        return fila_prioritaria_grupo;
      }

      let cartas_pausadas = await t.oneOrNone(
        `SELECT ee.etapa_id, ee.unidade_trabalho_id FROM macrocontrole.atividade as ee
        INNER JOIN macrocontrole.perfil_producao_etapa as pse ON pse.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        WHERE ee.usuario_id = $1 and ee.tipo_situacao_id = 3
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
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
        INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
        INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id 
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel = TRUE AND ppo.usuario_id = $1 AND ee.tipo_situacao_id = 1
        AND ee.id NOT IN        
        (
          SELECT ee.id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
          INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
          LEFT JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = ee.etapa_id
          LEFT JOIN macrocontrole.atividade AS ee_re ON ee_re.etapa_id = re.etapa_anterior_id
            AND ee_re.unidade_trabalho_id = ee.unidade_trabalho_id
          LEFT JOIN dgeo.usuario AS u_re ON u_re.id = ee_re.usuario_id
          WHERE ppo.usuario_id = $1 AND (
            (re.tipo_restricao_id = 1 AND ee_re.usuario_id = $1) OR
            (re.tipo_restricao_id = 2 AND ee_re.usuario_id != $1) OR 
            (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
          )
        )
        AND ee.id NOT IN
        (
          SELECT atividade_id FROM macrocontrole.fila_prioritaria
        )
        AND ee.id NOT IN
        (
          SELECT atividade_id FROM macrocontrole.fila_prioritaria_grupo
        )
        ) AS sit
        GROUP BY etapa_id, unidade_trabalho_id, lo_prioridade, pse_prioridade, ut_prioridade
        HAVING MIN(situacao_ant) IS NULL or every(situacao_ant IN (4,5)) 
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
        FROM macrocontrole.atividade as ee
        INNER JOIN macrocontrole.etapa as se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.tipo_etapa as e ON e.id = se.tipo_etapa_id
        INNER JOIN macrocontrole.subfase as s ON s.id = se.subfase_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        LEFT JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
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
        "SELECT servidor, porta, categoria FROM macrocontrole.perfil_fme WHERE etapa_id = $1",
        [etapa]
      );

      let monitoramento = await t.any(
        `SELECT tm.nome as tipo_monitoramento, c.nome as camada
        FROM macrocontrole.perfil_monitoramento AS pm
        INNER JOIN macrocontrole.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento_id
        LEFT JOIN macrocontrole.camada AS c ON c.id = pm.camada_id
        WHERE etapa_id = $1`,
        [etapa]
      );

      let workspace_dsgtools = await t.any(
        `SELECT w.nome
        FROM macrocontrole.perfil_workspace_dsgtools AS w
        WHERE w.etapa_id = $1`,
        [etapa]
      );

      let insumos = await t.any(
        `SELECT i.nome, i.caminho, i.epsg, i.tipo_insumo_id
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

      let categoria_fme = [];
      let servidor_fme = "";
      fme.forEach(f => {
        servidor_fme = f.servidor + ":" + f.porta;
        categoria_fme.push(f.categoria);
      });

      categoria_fme = categoria_fme.join();

      info.atividade.fme = {
        categoria: categoria_fme,
        servidor: servidor_fme
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

      info.atividade.workspace_dsgtools = [];
      workspace_dsgtools.forEach(r =>
        info.atividade.workspace_dsgtools.push(r.nome)
      );

      info.atividade.insumos = [];
      insumos.forEach(i => {
        info.atividade.insumos.push({
          nome: i.nome,
          caminho: i.caminho,
          epsg: i.epsg,
          tipo_insumo_id: i.tipo_insumo_id
        });
      });

      info.atividade.linhagem = await t.any(
        `SELECT u.nome_guerra, ee.data_inicio, ee.data_fim, sit.nome as situacao,
        sub.nome as subfase, et.nome as etapa
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.subfase as sub ON sub.id = se.subfase_id
        INNER JOIN macrocontrole.tipo_etapa as et ON et.id = se.tipo_etapa_id
        INNER JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
        INNER JOIN macrocontrole.tipo_situacao AS sit ON sit.code = ee.tipo_situacao_id
        WHERE ee.unidade_trabalho_id = $1 and ee.etapa_id != $2
        ORDER BY se.ordem`,
        [unidade_trabalho, etapa]
      );

      let requisitos = await t.any(
        `SELECT r.descricao
        FROM macrocontrole.requisito_finalizacao AS r
        INNER JOIN macrocontrole.etapa AS se ON se.id = r.etapa_id
        WHERE r.etapa_id = $1 ORDER BY r.ordem`,
        [etapa]
      );
      info.atividade.requisitos = [];
      requisitos.forEach(r => info.atividade.requisitos.push(r.descricao));

      let questionario = await t.any(
        `SELECT q.nome nome_questionario, p.id AS pergunta_id, p.texto AS pergunta,
        o.id AS opcao_id, o.texto AS opcao
        FROM avaliacao.questionario AS q
        INNER JOIN avaliacao.pergunta AS p ON p.questionario_id = q.id
        INNER JOIN avaliacao.opcao AS o ON o.pergunta_id = p.id
        WHERE q.etapa_id = $1 
        ORDER BY p.ordem, o.ordem`,
        [etapa]
      );
      info.atividade.questionario = {};
      info.atividade.questionario.perguntas = [];
      let perguntas = {};
      questionario.forEach(i => {
        info.atividade.questionario.nome = i.nome_questionario;

        if (!(i.pergunta_id in perguntas)) {
          perguntas[i.pergunta_id] = {
            pergunta_id: i.pergunta_id,
            pergunta: i.pergunta
          };
          perguntas[i.pergunta_id].opcoes = [];
        }

        perguntas[i.pergunta_id].opcoes.push({
          opcao_id: i.opcao_id,
          opcao: i.opcao
        });
      });

      for (var key in perguntas) {
        info.atividade.questionario.perguntas.push(perguntas[key]);
      }

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
      FROM macrocontrole.atividade
      WHERE usuario_id = $1 and tipo_situacao_id = 2 LIMIT 1`,
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
      `UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 4
      WHERE etapa_id = $2 and unidade_trabalho_id = $3 and usuario_id = $4`,
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
        `UPDATE macrocontrole.atividade SET
          tipo_situacao_id = 3 
          WHERE tipo_situacao_id = 2 and usuario_id = $1`,
        [usuario_id]
      );
      await t.none(
        `DELETE FROM macrocontrole.fila_prioritaria
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE etapa_id = $1 and unidade_trabalho_id = $2)`,
        [prioridade.etapa_id, prioridade.unidade_trabalho_id]
      );
      let result = await t.result(
        `UPDATE macrocontrole.atividade SET
          data_inicio = $1, tipo_situacao_id = 2, usuario_id = $4
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

controller.respondeQuestionario = async (
  usuario_id,
  atividade_id,
  respostas
) => {
  const data_questionario = new Date();
  try {
    await db.tx(async t => {
      let resposta_questionario = await t.one(
        `
      INSERT INTO avaliacao.resposta_questionario(data, atividade_id, usuario_id) VALUES($1,$2,$3) RETURNING id
      `,
        [data_questionario, atividade_id, usuario_id]
      );
      let queries = [];
      respostas.forEach(r => {
        queries.push(
          t.none(
            `
          INSERT INTO avaliacao.resposta(pergunta_id, opcao_id, resposta_questionario_id) VALUES($1,$2,$3)
          `,
            [r.pergunta_id, r.opcao_id, resposta_questionario.id]
          )
        );
      });
      return await t.batch(queries);
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante envio do questionário.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.atividade_id = atividade_id;
    err.information.respostas = respostas;
    err.information.trace = error;
    return { error: err };
  }
};

module.exports = controller;
