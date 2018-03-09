const db = require("../utils/database_connection");
const controller = {};

const login = async (login, senha) => {
  try {
    usuario_id = await db.verifyConnection(login, senha);
    if (usuario_id) {
      return {
        message: "Success",
        id: usuario_id
      };
    } else {
      //FIXME Log error?
      //FIXME Não existe somente esse erro, pode ser o banco fora do ar
      return {
        message: "Usuário ou senha incorretos.",
        status: 401
      };
    }
  } catch (err) {
    //FIXME log error
    return {
      message: "Problema no servidor. Contate o administrador.",
      status: 500
    };
  }
};

const calculaFila = async usuario => {
  //fixme try except
  // e se a atividade prioritaria já estiver em execução? Como lidar com a fila priopritaria
  let fila_prioritaria = await db.macro.oneOrNone(
    "SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria as f" +
      " INNER JOIN macrocontrole.execucao_etapa as ee ON ee.id = f.execucao_etapa_id" +
      " WHERE f.usuario_id = $1 ORDER BY f.prioridade LIMIT 1",
    [usuario]
  );

  if (fila_prioritaria != null) {
    return fila_prioritaria;
  }

  let cartas_pausadas = await db.macro.oneOrNone(
    "SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee" +
      " INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id" +
      " WHERE ee.operador_atual = $1 and ee.situacao = 3 ORDER BY ut.prioridade LIMIT 1",
    [usuario]
  );

  if (cartas_pausadas != null) {
    return cartas_pausadas;
  }

  let prioridade_operador = await db.macro.any(
    "SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee" +
      " INNER JOIN macrocontrole.subfase_etapa_operador as seo ON seo.subfase_etapa_id = ee.subfase_etapa_id" +
      " INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id" +
      " WHERE seo.usuario_id = $1 and ee.situacao = 1 ORDER BY seo.prioridade, ut.prioridade",
    [usuario]
  );

  if (prioridade_operador.length > 0) {
    let restricao = await db.macro.any(
      "SELECT re.tipo_restricao_id, ee1.subfase_etapa_id as se1, ee1.unidade_trabalho_id as ut1, ee1.operador_atual as op1, " +
        " ee2.subfase_etapa_id as se2, ee2.unidade_trabalho_id as ut2, ee2.operador_atual as op2 FROM macrocontrole.restricao_etapa as re" +
        " INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.subfase_etapa_id = re.subfase_etapa_1_id" +
        " INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.subfase_etapa_id = re.subfase_etapa_2_id"
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
      return fila_operador[1];
    }
  }

  return null;
};

const dadosProducao = async (subfase_etapa, unidade_trabalho) => {
  const info = {};

  let dadosut = await db.macro.any(
    "SELECT u.nome_guerra, ee.operador_atual, up.tipo_perfil_id, ut.id as unidade_trabalho_id, ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, se.etapa_id, e.nome as etapa_nome" +
      " FROM macrocontrole.execucao_etapa as ee" +
      " INNER JOIN macrocontrole.subfase_etapa as se ON se.id = ee.subfase_etapa " +
      " INNER JOIN macrocontrole.etapa as e ON e.id = se.etapa_id " +
      " INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho " +
      " LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id" +
      " INNER JOIN sdt.usuario AS u ON u.id = ee.operador_atual" +
      " LEFT JOIN macrocontrole.usuario_perfil AS up ON up.usuario_id = u.id" +
      " WHERE ee.subfase_etapa = $1 and ee.unidade_trabalho = $2",
    [subfase_etapa, unidade_trabalho]
  );

  if (dadosut.length > 0) {
    info.usuario = dadosut[0].nome_guerra;
    info.perfil = dadosut[0].tipo_perfil_id;
    info.unidade_trabalho = {};

    let camadas = await db.macro.any(
      "SELECT c.nome, pc.filtro, pc.geometria_editavel, pc.restricao_atributos" +
        " FROM macrocontrole.propriedades_camada AS pc" +
        " INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id" +
        " WHERE pc.etapa_id = $1",
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
      "SELECT i.nome, i.path" +
        " FROM macrocontrole.insumo AS i" +
        " INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id" +
        " WHERE iut.unidade_trabalho_id = $1",
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
    return res.status(200).json(info);
  } else {
    //FIXME LOG
    const err = new Error("Problema no servidor (dados produção).");
    err.status = 500;
    return next(err);
  }
};

controller.verifica = async (req, res, next, body) => {
  login = controller.login(body.login, body.senha);

  if (login.message !== "Success") {
    const err = new Error(login.message);
    err.status = login.status;
    return next(err);
  } else {
    try {
      //verifica cartas em execução
      let em_andamento = await db.macro.oneOrNone(
        "SELECT subfase_etapa_id, unidade_trabalho_id" +
          " FROM macrocontrole.execucao_etapa" +
          " WHERE operador_atual = $1 and situacao = 2 LIMIT 1",
        [login.id]
      );

      if (em_andamento) {
        const dados = dadosProducao(
          em_andamento.subfase_etapa_id,
          em_andamento.unidade_trabalho_id
        );
        return res.status(200).json(dados);
      } else {
        return res.status(200).json({
          message: "Sem atividade em execução."
        });
      }
    } catch (error) {
      const err = new Error("Problema no servidor (verifica).");
      err.status = 500;
      return next(err);
    }
  }
};

controller.finaliza = async (req, res, next, body) => {
  login = controller.login(body.login, body.senha);

  if (login.message !== "Success") {
    const err = new Error(login.message);
    err.status = login.status;
    return next(err);
  } else {
    const data_fim = new Date();
    try {
      let finaliza = await db.macro.none(
        "UPDATE macrocontrole.execucao_etapa SET" +
          " data_fim = $1, situacao = 4 " +
          " WHERE subfase_etapa_id = $2 and unidade_trabalho_id = $3 and operador_atual = $4",
        [data_fim, body.subfase_etapa_id, body.unidade_trabalho_id, login.id]
      );

      return res.status(200).json({
        message: "Finalizado com Sucesso"
      });
    } catch (error) {
      const err = new Error("Problema no servidor (finaliza).");
      err.status = 500;
      return next(err);
    }
  }
};

controller.inicia = async (req, res, next, body) => {
  login = controller.login(body.login, body.senha);

  if (login.message !== "Success") {
    const err = new Error(login.message);
    err.status = login.status;
    return next(err);
  } else {
    const prioridade = calculaFila(login.id);

    if (prioridade) {
      const data_inicio = new Date();

      db.macro
        .tx(async t => {
          await t.none(
            "UPDATE macrocontrole.execucao_etapa SET" +
              " situacao = 3 " +
              " WHERE situacao = 2 and operador = $1",
            [login.id]
          );
          await t.none(
            "DELETE FROM macrocontrole.fila_prioritaria" +
              " WHERE execucao_etapa_id IN (" +
              " SELECT id from macrocontrole.execucao_etapa WHERE subfase_etapa_id = $1 and unidade_trabalho_id = $2)",
            [prioridade.subfase_etapa_id, prioridade.unidade_trabalho_id]
          );
          await t.none(
            "UPDATE macrocontrole.execucao_etapa SET" +
              " data_fim = $1, situacao = 2" +
              " WHERE subfase_etapa_id = $2 and unidade_trabalho_id = $3 and operador_atual = $4",
            [
              data_inicio,
              prioridade.subfase_etapa_id,
              prioridade.unidade_trabalho_id,
              login.id
            ]
          );
        })
        .then(data => {
          const dados = dadosProducao(
            prioridade.subfase_etapa_id,
            prioridade.unidade_trabalho_id
          );
          return res.status(200).json(dados);
        })
        .catch(error => {
          const err = new Error("Problema no servidor (inicia).");
          err.status = 500;
          return next(err);
        });
    } else {
      return res.status(200).json({
        message:
          "O operador não possui unidades de trabalho disponível. Contate o Gerente"
      });
    }
  }
};

module.exports = controller;
