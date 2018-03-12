const db = require("./distribuicao_db");
const logger = require("../logger/logger");

const controller = {};

const calculaFila = async usuario => {
  try {
    let fila_prioritaria = await db.macro.oneOrNone(
      `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria as f
      WHERE f.usuario_id = $1 ORDER BY f.prioridade LIMIT 1
      INNER JOIN macrocontrole.execucao_etapa as ee ON ee.id = f.execucao_etapa_id`,
      [usuario]
    );

    if (fila_prioritaria != null) {
      return { erro: null, prioridade: fila_prioritaria };
    }

    let cartas_pausadas = await db.macro.oneOrNone(
      `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee
      INNER JOIN macrocontrole.subfase_etapa_operador as seo ON seo.subfase_etapa_id = ee.subfase_etapa_id
      INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
      WHERE ee.operador_atual = $1 and ee.situacao = 3 ORDER BY seo.prioridade, ut.prioridade LIMIT 1`,
      [usuario]
    );

    if (cartas_pausadas != null) {
      return { erro: null, prioridade: cartas_pausadas };
    }

    let prioridade_operador = await db.macro.any(
      `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee
      INNER JOIN macrocontrole.subfase_etapa_operador as seo ON seo.subfase_etapa_id = ee.subfase_etapa_id
      INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
      WHERE seo.usuario_id = $1 and ee.situacao = 1 ORDER BY seo.prioridade, ut.prioridade`,
      [usuario]
    );

    if (prioridade_operador.length > 0) {
      let restricao = await db.macro.any(
        `SELECT re.tipo_restricao_id, ee1.subfase_etapa_id as se1, ee1.unidade_trabalho_id as ut1, ee1.operador_atual as op1,
        ee2.subfase_etapa_id as se2, ee2.unidade_trabalho_id as ut2, ee2.operador_atual as op2 FROM macrocontrole.restricao_etapa as re
        INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.subfase_etapa_id = re.subfase_etapa_1_id
        INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.subfase_etapa_id = re.subfase_etapa_2_id`
      );

      const fila_operador = [];

      prioridade_operador.forEach(e => {
        restricao.forEach(r => {
          if (r.se1 === e.subfase_etapa_id && r.ut1 === e.unidade_trabalho_id) {
            if (r.tipo_restricao_id === 1 && r.op1 != usuario) {
              fila_operador.push(e);
            } else if (r.tipo_restricao_id === 2 && r.op1 === usuario) {
              fila_operador.push(e);
            }
          } else if (
            r.se2 === e.subfase_etapa_id &&
            r.ut2 === e.unidade_trabalho_id
          ) {
            if (r.tipo_restricao_id === 1 && r.op1 != usuario) {
              fila_operador.push(e);
            } else if (r.tipo_restricao_id === 2 && r.op1 === usuario) {
              fila_operador.push(e);
            }
          }
        });
      });

      if (fila_operador.length > 0) {
        return { erro: null, prioridade: fila_operador[1] };
      }
    }
    return { erro: null, prioridade: null };
  } catch (error) {
    logger.error("Error during queue calculation", {
      context: "distribuicao_ctrl",
      usuario_id: usuario,
      trace: error
    });
    let err = new Error("Falha durante calculo da fila.");
    err.status = 500;
    return { erro: err, prioridade: null };
  }
};

const dadosProducao = async (subfase_etapa, unidade_trabalho) => {
  const info = {};

  try {
    let dadosut = await db.macro.one(
      `SELECT u.nome_guerra, ee.operador_atual, up.tipo_perfil_id, ut.id as unidade_trabalho_id,
      ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, se.etapa_id, e.nome as etapa_nome
      FROM macrocontrole.execucao_etapa as ee
      INNER JOIN macrocontrole.subfase_etapa as se ON se.id = ee.subfase_etapa
      INNER JOIN macrocontrole.etapa as e ON e.id = se.etapa_id
      INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho
      LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
      INNER JOIN sdt.usuario AS u ON u.id = ee.operador_atual
      LEFT JOIN macrocontrole.usuario_perfil AS up ON up.usuario_id = u.id
      WHERE ee.subfase_etapa = $1 and ee.unidade_trabalho = $2`,
      [subfase_etapa, unidade_trabalho]
    );
    info.usuario = dadosut[0].nome_guerra;
    info.perfil = dadosut[0].tipo_perfil_id;
    info.unidade_trabalho = {};

    let camadas = await db.macro.any(
      `SELECT c.nome, pc.filtro, pc.geometria_editavel, pc.restricao_atributos
      FROM macrocontrole.propriedades_camada AS pc
      INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
      WHERE pc.etapa_id = $1`,
      [dadosut[0].etapa_id]
    );

    let estilos = await db.macro.any(
      "SELECT nome FROM macrocontrole.perfil_estilo WHERE etapa_id = $1",
      [dadosut[0].etapa_id]
    );

    let regras = await db.macro.any(
      "SELECT nome FROM macrocontrole.perfil_regras WHERE etapa_id = $1",
      [dadosut[0].etapa_id]
    );

    let menus = await db.macro.any(
      "SELECT nome FROM macrocontrole.perfil_menu WHERE etapa_id = $1",
      [dadosut[0].etapa_id]
    );

    let fme = await db.macro.any(
      "SELECT servidor_fme, categoria_fme FROM macrocontrole.perfil_fme WHERE etapa_id = $1",
      [dadosut[0].etapa_id]
    );

    let insumos = await db.macro.any(
      `SELECT i.nome, i.path
      FROM macrocontrole.insumo AS i
      INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id
      WHERE iut.unidade_trabalho_id = $1`,
      [dadosut[0].unidade_trabalho_id]
    );

    info.unidade_trabalho.nome =
      dadosut[0].etapa_nome + " - " + dadosut[0].unidade_trabalho_nome;
    info.unidade_trabalho.banco_dados = {
      nome: dadosut[0].nome_bd,
      servidor: dadosut[0].servidor,
      porta: dadosut[0].porta
    };
    info.unidade_trabalho.fme = {
      categoria: fme.categoria_fme,
      servidor: fme.servidor_fme
    };

    info.unidade_trabalho.estilos = [];
    info.unidade_trabalho.regras = [];
    info.unidade_trabalho.menus = [];

    estilos.forEach(r => info.unidade_trabalho.estilos.push(r.nome));
    regras.forEach(r => info.unidade_trabalho.regras.push(r.nome));
    menus.forEach(r => info.unidade_trabalho.menus.push(r.nome));

    info.unidade_trabalho.camadas = [];
    camadas.forEach(c => {
      info.unidade_trabalho.camadas.push({
        nome: c.nome,
        filtro: c.editavel,
        geometria_editavel: c.geometria_editavel,
        restricao_atributos: c.restricao_atributos
      });
    });

    info.unidade_trabalho.insumos = [];
    insumos.forEach(i => {
      info.unidade_trabalho.insumos.push({
        nome: i.nome,
        path: i.path
      });
    });
    return { erro: null, dados: info };
  } catch (error) {
    logger.error("Error during dadosProducao", {
      context: "distribuicao_ctrl",
      subfase_etapa_id: subfase_etapa_id,
      unidade_trabalho_id: unidade_trabalho_id,
      trace: error
    });
    let err = new Error("Falha durante dadosProducao.");
    err.status = 500;
    return { erro: err, dados: null };
  }
};

controller.verifica = async usuario_id => {
  try {
    let em_andamento = await db.macro.oneOrNone(
      `SELECT subfase_etapa_id, unidade_trabalho_id
      FROM macrocontrole.execucao_etapa
      WHERE operador_atual = $1 and situacao = 2 LIMIT 1`,
      [usuario_id]
    );

    if (em_andamento) {
      const { erro, dados } = dadosProducao(
        em_andamento.subfase_etapa_id,
        em_andamento.unidade_trabalho_id
      );
      if (erro) {
        return { verificaError: erro, dados: null };
      }
      return { verificaError: null, dados: dados };
    } else {
      return { verificaError: null, dados: null };
      return res.status(200).json({
        message: "Sem atividade em execução."
      });
    }
  } catch (error) {
    logger.error("Error during verification query", {
      context: "distribuicao_ctrl",
      usuario_id: usuario_id,
      trace: error
    });
    let err = new Error("Falha durante tentativa de verificação.");
    err.status = 500;
    return { verificaError: err, dados: null };
  }
};

controller.finaliza = async (
  usuario_id,
  subfase_etapa_id,
  unidade_trabalho_id
) => {
  const data_fim = new Date();
  try {
    let finaliza = await db.macro.none(
      `UPDATE macrocontrole.execucao_etapa SET
      data_fim = $1, situacao = 4
      WHERE subfase_etapa_id = $2 and unidade_trabalho_id = $3 and operador_atual = $4`,
      [data_fim, subfase_etapa_id, unidade_trabalho_id, usuario_id]
    );

    return { finalizaError: null };
  } catch (error) {
    logger.error("Error during finalizing query", {
      context: "distribuicao_ctrl",
      usuario_id: usuario_id,
      subfase_etapa_id: subfase_etapa_id,
      unidade_trabalho_id: unidade_trabalho_id,
      trace: error
    });
    let err = new Error("Falha durante tentativa de finalização.");
    err.status = 500;
    return { finalizaError: err };
  }
};

controller.inicia = async usuario_id => {
  const data_inicio = new Date();
  const { erro, prioridade } = calculaFila(usuario_id);

  if (erro) {
    return { iniciaError: erro, dados: null };
  }

  db.macro
    .tx(async t => {
      await t.none(
        `UPDATE macrocontrole.execucao_etapa SET
          situacao = 3 
          WHERE situacao = 2 and operador = $1`,
        [usuario_id]
      );
      await t.none(
        `DELETE FROM macrocontrole.fila_prioritaria
          WHERE execucao_etapa_id IN (
          SELECT id from macrocontrole.execucao_etapa WHERE subfase_etapa_id = $1 and unidade_trabalho_id = $2)`,
        [prioridade.subfase_etapa_id, prioridade.unidade_trabalho_id]
      );
      let result = await t.result(
        `UPDATE macrocontrole.execucao_etapa SET
          data_inicio = $1, situacao = 2, operador_atual = $4
          WHERE subfase_etapa_id = $2 and unidade_trabalho_id = $3 and (situacao = 1 or situacao = 3)`,
        [
          data_inicio,
          prioridade.subfase_etapa_id,
          prioridade.unidade_trabalho_id,
          usuario_id
        ]
      );

      if (!result.rowCount) {
        throw new Error("Não pode iniciar a tarefa selecionada para a fila.");
      }

      return result;
    })
    .then(data => {
      const { erro, dados } = dadosProducao(
        prioridade.subfase_etapa_id,
        prioridade.unidade_trabalho_id
      );
      if (erro) {
        throw error;
        return { iniciaError: erro, dados: null };
      }
      return { iniciaError: null, dados };
    })
    .catch(error => {
      logger.error("Error during initializing query", {
        context: "distribuicao_ctrl",
        usuario_id: usuario_id,
        trace: error
      });
      let iniciaError = new Error("Falha durante tentativa de inicialização.");
      iniciaError.status = 500;
      return { iniciaError, dados: null };
    });
};

module.exports = controller;
