"use strict";

const { db } = require("../database");

const controller = {};

const calculaFila = async usuario => {
  return db
    .task(async t => {
      let fila_prioritaria = await t.oneOrNone(
        `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.fila_prioritaria as f
        INNER JOIN macrocontrole.execucao_etapa as ee ON ee.id = f.execucao_etapa_id
        WHERE f.usuario_id = $1 ORDER BY f.prioridade LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria != null) {
        return fila_prioritaria;
      }

      let cartas_pausadas = await t.oneOrNone(
        `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id FROM macrocontrole.execucao_etapa as ee
        INNER JOIN macrocontrole.perfil_subfase_etapa as pse ON pse.subfase_etapa_id = ee.subfase_etapa_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        WHERE ee.operador_atual = $1 and ee.situacao = 3 ORDER BY pse.prioridade, ut.prioridade LIMIT 1`,
        [usuario]
      );

      if (cartas_pausadas != null) {
        return cartas_pausadas;
      }

      let prioridade_operador = await t.oneOrNone(
        `SELECT ee.subfase_etapa_id, ee.unidade_trabalho_id
        FROM macrocontrole.execucao_etapa AS ee
        INNER JOIN macrocontrole.perfil_subfase_etapa AS pse ON pse.subfase_etapa_id = ee.subfase_etapa_id
        INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
        INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
        INNER JOIN macrocontrole.subfase_etapa AS se ON se.id = ee.subfase_etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        LEFT JOIN
        (
          SELECT ee.situacao, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.execucao_etapa AS ee
          INNER JOIN macrocontrole.subfase_etapa AS se ON se.id = ee.subfase_etapa_id 
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem = ee_ant.ordem + 1
        WHERE ut.disponivel = TRUE AND ppo.usuario_id = $1 AND ee.situacao = 1 AND
        (ee_ant.situacao IS NULL OR ee_ant.situacao = 4 OR ee_ant.situacao = 5)
        AND ee.id NOT IN        
        (
          SELECT ee.id FROM macrocontrole.execucao_etapa AS ee
          INNER JOIN macrocontrole.perfil_subfase_etapa AS pse ON pse.subfase_etapa_id = ee.subfase_etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
          INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
          LEFT JOIN macrocontrole.restricao_etapa AS re ON re.subfase_etapa_2_id = ee.subfase_etapa_id
          LEFT JOIN macrocontrole.execucao_etapa AS ee_re ON ee_re.subfase_etapa_id = re.subfase_etapa_1_id
            AND ee_re.unidade_trabalho_id = ee.unidade_trabalho_id
          LEFT JOIN dgeo.usuario AS u_re ON u_re.id = ee_re.operador_atual
          WHERE ppo.usuario_id = $1 AND (
            (re.tipo_restricao_id = 1 AND ee_re.operador_atual = $1) OR
            (re.tipo_restricao_id = 2 AND ee_re.operador_atual != $1) OR 
            (re.tipo_restricao_id = 3 AND u_re.turno != u.turno AND u_re.turno != 3 AND u.turno != 3)
          )
        )
        AND ee.id NOT IN
        (
          SELECT execucao_etapa_id FROM macrocontrole.fila_prioritaria
        )
        ORDER BY pse.prioridade, ut.prioridade LIMIT 1`,
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
      err.information.usuario_id = usuario_id;
      err.information.trace = error;
      return { erro: err, prioridade: null };
    });
};

const dadosProducao = async (subfase_etapa, unidade_trabalho) => {
  return db
    .task(async t => {
      let dadosut = await t.one(
        `SELECT u.id as usuario_id, u.nome_guerra, up.tipo_perfil_id, s.nome as subfase_nome, 
        ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom,
        ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, e.nome as etapa_nome
        FROM macrocontrole.execucao_etapa as ee
        INNER JOIN macrocontrole.subfase_etapa as se ON se.id = ee.subfase_etapa_id
        INNER JOIN macrocontrole.etapa as e ON e.id = se.etapa_id
        INNER JOIN macrocontrole.subfase as s ON s.id = se.subfase_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        LEFT JOIN dgeo.usuario AS u ON u.id = ee.operador_atual
        LEFT JOIN macrocontrole.usuario_perfil AS up ON up.usuario_id = u.id
        WHERE ee.subfase_etapa_id = $1 and ee.unidade_trabalho_id = $2`,
        [subfase_etapa, unidade_trabalho]
      );

      const info = {};
      info.usuario_id = dadosut.usuario_id
      info.usuario = dadosut.nome_guerra;
      info.perfil = dadosut.tipo_perfil_id;
      info.atividade = {};

      let camadas = await t.any(
        `SELECT c.nome, pc.filtro, pc.geometria_editavel, pc.restricao_atributos
        FROM macrocontrole.perfil_propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_etapa_id = $1`,
        [subfase_etapa]
      );

      let estilos = await t.any(
        "SELECT nome FROM macrocontrole.perfil_estilo WHERE subfase_etapa_id = $1",
        [subfase_etapa]
      );

      let regras = await t.any(
        "SELECT nome FROM macrocontrole.perfil_regras WHERE subfase_etapa_id = $1",
        [subfase_etapa]
      );

      let menus = await t.any(
        "SELECT nome FROM macrocontrole.perfil_menu WHERE subfase_etapa_id = $1",
        [subfase_etapa]
      );

      let fme = await t.any(
        "SELECT servidor_fme, categoria_fme FROM macrocontrole.perfil_fme WHERE subfase_etapa_id = $1",
        [subfase_etapa]
      );

      let monitoramento = await t.any(
        `SELECT tm.nome as tipo_monitoramento, c.nome as camada, bd.nome AS nome_bd, bd.servidor, bd.porta
        FROM macrocontrole.perfil_monitoramento AS pm
        INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = pm.banco_dados_id
        INNER JOIN macrocontrole.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento 
        LEFT JOIN macrocontrole.camada AS c ON c.id = pm.camada_id
        WHERE subfase_etapa_id = $1`,
        [subfase_etapa]
      );

      let rotinas = await t.any(
        `SELECT r.nome, c1.nome as camada, c2.nome as camada_apontamento, pr.parametros
        FROM macrocontrole.perfil_rotina AS pr
        INNER JOIN macrocontrole.rotina AS r ON r.id = pr.rotina_id
        INNER JOIN macrocontrole.camada AS c1 ON c1.id = pr.camada_id
        INNER JOIN macrocontrole.camada AS c2 ON c2.id = pr.camada_apontamento_id
        WHERE pr.subfase_etapa_id = $1`,
        [subfase_etapa]
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
      info.atividade.subfase_etapa_id = subfase_etapa;
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

      estilos.forEach(r => info.atividade.estilos.push(r.nome));
      regras.forEach(r => info.atividade.regras.push(r.nome));
      menus.forEach(r => info.atividade.menus.push(r.nome));

      info.atividade.camadas = [];
      camadas.forEach(c => {
        info.atividade.camadas.push({
          nome: c.nome,
          filtro: c.editavel,
          geometria_editavel: c.geometria_editavel,
          restricao_atributos: c.restricao_atributos
        });
      });

      info.atividade.monitoramento = {};
      monitoramento.forEach(m => {
        if(!(m.tipo_monitoramento in info.atividade.monitoramento)){
          info.atividade.monitoramento[m.tipo_monitoramento] = []
        }
        let aux = {
          nome_bd: m.nome_bd,
          servidor: m.servidor,
          porta: m.porta
        }
        if(m.camada){
          aux.camada = m.camada
        }
        info.atividade.monitoramento[m.tipo_monitoramento].push(aux);
      });

      info.atividade.rotinas = {};
      rotinas.forEach(r => {
        if(!(r.nome in info.atividade.rotinas)){
          info.atividade.rotinas[r.nome] = []
        }
        let aux = {
          camada: r.camada,
          camada_apontamento: r.camada_apontamento
        }

        if(r.parametros){
          let param = JSON.parse(r.parametros)
          aux = {...aux, ...param}
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
        INNER JOIN macrocontrole.subfase_etapa AS se ON se.id = ee.subfase_etapa_id
        INNER JOIN macrocontrole.subfase as sub ON sub.id = se.subfase_id
        INNER JOIN macrocontrole.etapa as et ON et.id = se.etapa_id
        INNER JOIN dgeo.usuario AS u ON u.id = ee.operador_atual
        INNER JOIN macrocontrole.situacao AS sit ON sit.code = ee.situacao
        WHERE ee.unidade_trabalho_id = $1 and ee.subfase_etapa_id != $2
        ORDER BY se.ordem`,
        [unidade_trabalho, subfase_etapa]
      );

      let requisitos = await t.any(
        `SELECT r.descricao
        FROM macrocontrole.requisito AS r
        INNER JOIN macrocontrole.subfase_etapa AS se ON se.id = r.subfase_etapa_id
        WHERE r.subfase_etapa_id = $1`,
        [subfase_etapa]
      );
      info.atividade.requisitos = []
      requisitos.forEach(r => info.atividade.requisitos.push(r.descricao));
      info.atividade.requisitos.sort()
      
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
      err.information.subfase_etapa_id = subfase_etapa;
      err.information.unidade_trabalho_id = unidade_trabalho;
      err.information.trace = error;
      return { erro: err, dados: null };
    });
};

controller.verifica = async usuario_id => {
  try {
    let em_andamento = await db.oneOrNone(
      `SELECT subfase_etapa_id, unidade_trabalho_id
      FROM macrocontrole.execucao_etapa
      WHERE operador_atual = $1 and situacao = 2 LIMIT 1`,
      [usuario_id]
    );

    if (em_andamento) {
      const { erro, dados } = await dadosProducao(
        em_andamento.subfase_etapa_id,
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

controller.finaliza = async (
  usuario_id,
  subfase_etapa_id,
  unidade_trabalho_id
) => {
  const data_fim = new Date();
  try {
    let { data_inicio } = await db.one(
      `SELECT data_inicio FROM macrocontrole.execucao_etapa
      WHERE subfase_etapa_id = $1 and unidade_trabalho_id = $2 and operador_atual = $3`,
      [subfase_etapa_id, unidade_trabalho_id, usuario_id]
    );
    console.log('Tempo de execução', (data_fim - data_inicio)/60000)
    if (data_fim - data_inicio < 120000) {
      throw new Error(
        "Tempo menor que a tolerância para finalizar uma atividade."
      );
    }

    let result = await db.result(
      `UPDATE macrocontrole.execucao_etapa SET
      data_fim = $1, situacao = 4
      WHERE subfase_etapa_id = $2 and unidade_trabalho_id = $3 and operador_atual = $4`,
      [data_fim, subfase_etapa_id, unidade_trabalho_id, usuario_id]
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
    err.information.subfase_etapa_id = subfase_etapa_id;
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
          situacao = 3 
          WHERE situacao = 2 and operador_atual = $1`,
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
    .then(async data => {
      const { erro, dados } = await dadosProducao(
        prioridade.subfase_etapa_id,
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
