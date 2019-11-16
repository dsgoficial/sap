"use strict";

const { db } = require("../database");
const { serializeError } = require("serialize-error");

const { distribuicaoCtrl } = require("../distribuicao_atividades");

const controller = {};

const get_usuario_nome_by_id = async usuario_id => {
  const usuario = await t.one(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id = $1`,
    [usuario_id]
  );
  return usuario.posto_nome;
};

controller.get_atividade = async atividade_id => {
  try {
    const atividade = await db.oneOrNone(
      `SELECT a.etapa_id, a.unidade_trabalho_id
      FROM macrocontrole.atividade AS a
      WHERE a.id = $1 LIMIT 1`,
      [atividade_id]
    );
    if (atividade) {
      const { erro, dados } = await distribuicaoCtrl.dados_producao(
        atividade_id
      );
      if (erro) {
        return { verificaError: erro, dados: null };
      }
      return { verificaError: null, dados: dados };
    } else {
      const err = new Error("ID inválido.");
      err.status = 404;
      err.context = "gerencia_ctrl";
      err.information = {};
      err.information.atividade_id = atividade_id;
      return { verificaError: err, dados: null };
    }
  } catch (error) {
    const err = new Error("Falha durante retorno dos dados da atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.trace = serializeError(error);
    return { verificaError: err, dados: null };
  }
};

controller.get_atividade_usuario = async (usuario_id, proxima) => {
  try {
    let atividade_id;

    if (proxima) {
      const { erro, prioridade } = await distribuicaoCtrl.calcula_fila(
        usuario_id
      );
      if (erro) {
        return { erro: erro, dados: null };
      }
      atividade_id = prioridade.id;
    } else {
      const em_andamento = await db.oneOrNone(
        `SELECT a.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        WHERE a.usuario_id = $1 and ut.disponivel IS TRUE and a.tipo_situacao_id = 2 LIMIT 1`,
        [usuario_id]
      );
      if (!em_andamento) {
        return { erro: null, dados: null };
      }
      atividade_id = em_andamento.id;
    }

    const { erro2, dados } = await distribuicaoCtrl.dados_producao(
      atividade_id
    );
    if (erro2) {
      return { erro: erro2, dados: null };
    }
    return { erro: null, dados: dados };
  } catch (error) {
    const err = new Error(
      "Falha durante retorno dos dados da atividade de um usuário."
    );
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.trace = serializeError(error);
    return { erro: err, dados: null };
  }
};

controller.get_estilos = async () => {
  try {
    const dados = await db.any(`SELECT * FROM dgeo.layer_styles`);
    return { error: null, dados: dados };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar estilos.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_regras = async () => {
  try {
    const dados = await db.any(`SELECT * FROM dgeo.layer_rules`);
    return { error: null, dados: dados };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar regras.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_modelos = async () => {
  try {
    const dados = await db.any(`SELECT * FROM dgeo.layer_qgis_models`);
    return { error: null, dados: dados };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar modelos.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_menus = async () => {
  try {
    const dados = await db.any(`SELECT * FROM dgeo.layer_menus`);
    return { error: null, dados: dados };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar menus.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.grava_estilos = async (estilos, usuario_id) => {
  const data_gravacao = new Date();
  try {
    await db.tx(async t => {
      const usuario_posto_nome = get_usuario_nome_by_id(usuario_id);
      await t.none(`TRUNCATE dgeo.layer_styles RESTART IDENTITY`);

      const table = new db.helpers.TableName({
        table: "layer_styles",
        schema: "dgeo"
      });

      const cs = new db.helpers.ColumnSet(
        [
          "f_table_schema",
          "f_table_name",
          "f_geometry_column",
          "stylename",
          "styleqml",
          "stylesld",
          "ui",
          "owner",
          "update_time"
        ],
        { table }
      );

      const values = [];
      estilos.forEach(d => {
        values.push({
          f_table_schema: d.f_table_schema,
          f_table_name: d.f_table_name,
          f_geometry_column: d.f_geometry_column,
          stylename: d.stylename,
          styleqml: d.styleqml,
          stylesld: stylesld,
          ui: ui,
          owner: usuario_posto_nome,
          update_time: data_gravacao
        });
      });

      const query = db.helpers.insert(values, cs);

      await t.none(query);
    });

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar estilos.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.estilos = estilos;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.grava_regras = async (regras, usuario_id) => {
  const data_gravacao = new Date();
  try {
    await db.tx(async t => {
      const usuario_posto_nome = get_usuario_nome_by_id(usuario_id);

      await t.none(`TRUNCATE dgeo.layer_rules RESTART IDENTITY`);

      const table = new db.helpers.TableName({
        table: "layer_rules",
        schema: "dgeo"
      });

      const cs = new db.helpers.ColumnSet(
        [
          "grupo_regra",
          "tipo_regra",
          "schema",
          "camada",
          "atributo",
          "regra",
          "cor_rgb",
          "descricao",
          "ordem",
          "owner",
          "update_time"
        ],
        { table }
      );

      const values = [];
      regras.forEach(d => {
        values.push({
          grupo_regra: d.grupo_regra,
          tipo_regra: d.tipo_regra,
          schema: d.schema,
          camada: d.camada,
          atributo: d.atributo,
          regra: d.regra,
          cor_rgb: d.cor_rgb,
          descricao: d.descricao,
          ordem: d.ordem,
          owner: usuario_posto_nome,
          update_time: data_gravacao
        });
      });

      const query = db.helpers.insert(values, cs);

      const result = await t.result(query);

      if (!result.rowCount || result.rowCount == 0) {
        throw new Error("Erro ao inserir regra.");
      }
    });

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar regras.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.regras = regras;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.grava_modelos = async (modelos, usuario_id) => {
  const data_gravacao = new Date();
  try {
    await db.tx(async t => {
      const usuario_posto_nome = get_usuario_nome_by_id(usuario_id);

      await t.none(`TRUNCATE dgeo.layer_qgis_models RESTART IDENTITY`);

      const table = new db.helpers.TableName({
        table: "layer_qgis_models",
        schema: "dgeo"
      });

      const cs = new db.helpers.ColumnSet(
        ["nome", "descricao", "model_xml", "owner", "update_time"],
        { table }
      );

      const values = [];
      modelos.forEach(d => {
        values.push({
          nome: d.nome,
          descricao: d.descricao,
          model_xml: d.model_xml,
          owner: usuario_posto_nome,
          update_time: data_gravacao
        });
      });

      const query = db.helpers.insert(values, cs);

      const result = await t.result(query);

      if (!result.rowCount || result.rowCount == 0) {
        throw new Error("Erro ao inserir modelo.");
      }
    });

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar modelos.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.modelos = modelos;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.grava_menus = async (menus, usuario_id) => {
  const data_gravacao = new Date();
  try {
    await db.tx(async t => {
      const usuario_posto_nome = get_usuario_nome_by_id(usuario_id);

      await t.none(`TRUNCATE dgeo.layer_menus RESTART IDENTITY`);

      const table = new db.helpers.TableName({
        table: "layer_menus",
        schema: "dgeo"
      });

      const cs = new db.helpers.ColumnSet(
        ["nome_menu", "definicao_menu", "ordem_menu", "owner", "update_time"],
        { table }
      );

      const values = [];
      menus.forEach(d => {
        values.push({
          nome_menu: d.nome_menu,
          definicao_menu: d.definicao_menu,
          ordem_menu: d.ordem_menu,
          owner: usuario_posto_nome,
          update_time: data_gravacao
        });
      });

      const query = db.helpers.insert(values, cs);

      const result = await t.result(query);

      if (!result.rowCount || result.rowCount == 0) {
        throw new Error("Erro ao inserir/atualizar menu.");
      }
    });

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar menus.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.menus = menus;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.get_banco_dados = async () => {
  try {
    const banco_dados = await db.any(
      `SELECT nome, servidor, porta FROM macrocontrole.banco_dados`
    );
    return { error: null, dados: banco_dados };
  } catch (error) {
    const err = new Error(
      "Falha durante tentativa de retornar banco de dados."
    );
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_usuario = async () => {
  try {
    const usuarios = await db.any(
      `SELECT u.id, tpg.nome_abrev || ' ' || u.nome_guerra AS nome
      FROM dgeo.usuario AS u INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id WHERE u.ativo IS TRUE`
    );
    return { error: null, dados: usuarios };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar usuarios.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_perfil_producao = async () => {
  try {
    const perfil_producao = await db.any(
      `SELECT id, nome FROM macrocontrole.perfil_producao`
    );
    return { error: null, dados: perfil_producao };
  } catch (error) {
    const err = new Error(
      "Falha durante tentativa de retornar perfis de produção."
    );
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.unidade_trabalho_disponivel = async (
  unidade_trabalho_ids,
  disponivel
) => {
  try {
    const table = new db.helpers.TableName({
      table: "unidade_trabalho",
      schema: "macrocontrole"
    });

    const cs = new db.helpers.ColumnSet(["?id", "disponivel"], { table });

    const values = [];
    unidade_trabalho_ids.forEach(d => {
      values.push({
        id: d,
        disponivel: disponivel
      });
    });

    const query =
      db.helpers.update(values, cs, null, {
        tableAlias: "X",
        valueAlias: "Y"
      }) + "WHERE Y.id = X.id";

    db.none(query);

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante atualização de unidades de trabalho.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.disponivel = disponivel;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.pausa_atividade = async unidade_trabalho_ids => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      const updated_ids = await t.any(
        `
      UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
      WHERE id in (
        SELECT a.id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
        WHERE ut.id in ($2:raw) AND a.tipo_situacao_id = 2
        ) RETURNING id
      `,
        [data_fim, unidade_trabalho_ids.join(",")]
      );
      if (updated_ids.length > 0) {
        const updated_ids_fixed = [];
        updated_ids.forEach(u => {
          updated_ids_fixed.push(u.id);
        });
        const atividades = await t.any(
          `SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id in ($1:raw)`,
          [updated_ids_fixed.join(",")]
        );

        const table = new db.helpers.TableName({
          table: "atividade",
          schema: "macrocontrole"
        });

        const cs = new db.helpers.ColumnSet(
          ["etapa_id", "unidade_trabalho_id", "usuario_id", "tipo_situacao_id"],
          { table }
        );

        const values = [];
        atividades.forEach(d => {
          values.push({
            etapa_id: d.etapa_id,
            unidade_trabalho_id: d.unidade_trabalho_id,
            usuario_id: d.usuario_id,
            tipo_situacao_id: 3
          });
        });

        const query = db.helpers.insert(values, cs);

        const result = await t.result(query);

        if (!result.rowCount || result.rowCount == 0) {
          throw new Error("Erro ao inserir atividades.");
        }
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante pausa atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.reinicia_atividade = async unidade_trabalho_ids => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      const updated_ids = await t.any(
        `
      UPDATE macrocontrole.atividade SET
      data_inicio = COALESCE(data_inicio, $1), data_fim = COALESCE(data_fim, $1), tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
      WHERE id in (
        SELECT DISTINCT ON (ut.id) a.id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        WHERE ut.id in ($2:raw) AND a.tipo_situacao_id in (2,3)
        ORDER BY ut.id, e.ordem
        ) RETURNING id
      `,
        [data_fim, unidade_trabalho_ids.join(",")]
      );
      if (updated_ids.length > 0) {
        const updated_ids_fixed = [];
        updated_ids.forEach(u => {
          updated_ids_fixed.push(u.id);
        });
        const atividades = await t.any(
          `SELECT etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE id in ($1:raw)`,
          [updated_ids_fixed.join(",")]
        );
        const table = new db.helpers.TableName({
          table: "atividade",
          schema: "macrocontrole"
        });
        const cs = new db.helpers.ColumnSet(
          ["etapa_id", "unidade_trabalho_id", "tipo_situacao_id"],
          { table }
        );

        const values = [];
        atividades.forEach(d => {
          values.push({
            etapa_id: d.etapa_id,
            unidade_trabalho_id: d.unidade_trabalho_id,
            tipo_situacao_id: 1
          });
        });

        const query = db.helpers.insert(values, cs);

        const result = await t.result(query);

        if (!result.rowCount || result.rowCount == 0) {
          throw new Error("Erro ao inserir atividades.");
        }
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante reiniciar atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.volta_atividade = async (atividade_ids, manter_usuarios) => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      const atividades_updates = await t.any(
        `
      UPDATE macrocontrole.atividade SET
      tipo_situacao_id = 5, data_inicio = COALESCE(data_inicio, $2), data_fim = COALESCE(data_fim, $2), tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
      WHERE id IN (
          SELECT a_ant.id
          FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
          INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
          WHERE a.id in ($1:raw) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (2,3,4)
      ) RETURNING id 
      `,
        [atividade_ids.join(","), data_fim]
      );
      const ids = [];
      atividades_updates.forEach(i => {
        ids.push(i.id);
      });
      if (ids.length > 0) {
        ids = ids.join(",");
        if (manter_usuarios) {
          await t.none(
            `
          INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id, observacao)
          (
            SELECT etapa_id, unidade_trabalho_id, usuario_id, 3 AS tipo_situacao_id, observacao
            FROM macrocontrole.atividade
            WHERE id in ($1:raw)
          )
          `,
            [ids]
          );
        } else {
          await t.none(
            `
            INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id, observacao)
            (
              SELECT etapa_id, unidade_trabalho_id, 1 AS tipo_situacao_id, observacao
              FROM macrocontrole.atividade
              WHERE id in ($1:raw)
            )
            `,
            [ids]
          );
        }
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante voltar atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_ids = atividade_ids;
    err.information.manter_usuarios = manter_usuarios;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.avanca_atividade = async (atividade_ids, concluida) => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      if (concluida) {
        await t.none(
          `
          DELETE FROM macrocontrole.atividade
          WHERE id IN (
              SELECT a_ant.id
              FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
              INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
              WHERE a.id in ($1:raw) AND e_ant.ordem <= e.ordem AND a_ant.tipo_situacao_id IN (1,3)
          )
          `,
          [atividade_ids.join(",")]
        );
        await t.none(
          `
          UPDATE macrocontrole.atividade SET
          tipo_situacao_id = 5, data_fim = $2, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
          WHERE id IN (
              SELECT a_ant.id
              FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
              INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
              WHERE a.id in ($1:raw) AND e_ant.ordem <= e.ordem AND a_ant.tipo_situacao_id IN (2)
          )
          `,
          [atividade_ids.join(","), data_fim]
        );
      } else {
        await t.none(
          `
        DELETE FROM macrocontrole.atividade
        WHERE id IN (
            SELECT a_ant.id
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
            INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
            INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
            WHERE a.id in ($1:raw) AND e_ant.ordem < e.ordem AND a_ant.tipo_situacao_id IN (1,3)
        )
        `,
          [atividade_ids.join(",")]
        );
        await t.none(
          `
        UPDATE macrocontrole.atividade SET
        tipo_situacao_id = 5, data_fim = $2, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
        WHERE id IN (
            SELECT a_ant.id
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
            INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
            INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
            WHERE a.id in ($1:raw) AND e_ant.ordem < e.ordem AND a_ant.tipo_situacao_id IN (2)
        )
        `,
          [atividade_ids.join(","), data_fim]
        );
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante avançar atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_ids = atividade_ids;
    err.information.concluida = concluida;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.cria_revisao = async unidade_trabalho_ids => {
  try {
    await db.tx(async t => {
      for (const unidade_trabalho_id of unidade_trabalho_ids) {
        const atividade = await t.one(
          `SELECT ut.subfase_id, max(e.ordem) AS ordem 
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
          WHERE ut.id = $1
          GROUP BY ut.subfase_id`,
          [unidade_trabalho_id]
        );
        const etapa_rev = await t.oneOrNone(
          `SELECT e.id FROM macrocontrole.unidade_trabalho_id AS ut
          INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
          LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
          WHERE ut.id = $1 AND a.id IS NULL AND e.tipo_etapa_id = 2
          ORDER BY e.ordem
          LIMIT 1`,
          [unidade_trabalho_id]
        );
        const etapa_corr = await t.oneOrNone(
          `SELECT e.id FROM macrocontrole.unidade_trabalho_id AS ut
          INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
          LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
          WHERE ut.id = $1 AND a.id IS NULL AND e.tipo_etapa_id = 3
          ORDER BY e.ordem
          LIMIT 1`,
          [unidade_trabalho_id]
        );
        let ids;
        if (etapa_rev && etapa_corr) {
          ids = [];
          ids.push(etapa_rev);
          ids.push(etapa_corr);
        } else {
          ids = await t.any(
            `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
        VALUES(2,$1,$2),(3,$1,$3) RETURNING id
        `,
            [atividade.subfase_id, atividade.ordem + 1, atividade.ordem + 2]
          );
        }
        await t.none(
          `
        INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
        VALUES ($1,$3,1),($2,$3,1)
        `,
          [ids[0].id, ids[1].id, unidade_trabalho_id]
        );
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da revisão.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.cria_revcorr = async unidade_trabalho_ids => {
  try {
    await db.tx(async t => {
      for (const unidade_trabalho_id of unidade_trabalho_ids) {
        const atividade = await t.one(
          `SELECT ut.subfase_id, max(e.ordem) AS ordem 
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
          WHERE ut.id = $1
          GROUP BY ut.subfase_id`,
          [unidade_trabalho_id]
        );
        const etapa_revcorr = await t.oneOrNone(
          `SELECT e.id FROM macrocontrole.unidade_trabalho_id AS ut
          INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
          LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
          WHERE ut.id = $1 AND a.id IS NULL AND e.tipo_etapa_id = 4
          ORDER BY e.ordem
          LIMIT 1`,
          [unidade_trabalho_id]
        );
        let revcorr;
        if (etapa_revcorr) {
          revcorr = etapa_revcorr;
        } else {
          revcorr = await t.one(
            `
          INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
          VALUES($1,$2,$3) RETURNING id
          `,
            [4, atividade.subfase_id, atividade.ordem + 1]
          );
        }
        await t.none(
          `
        INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
        VALUES ($1,$2,1)
        `,
          [revcorr.id, unidade_trabalho_id]
        );
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da revisão/correção.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.cria_fila_prioritaria = async (
  atividade_ids,
  usuario_prioridade_id,
  prioridade
) => {
  try {
    await db.none(
      `
      INSERT INTO macrocontrole.fila_prioritaria(atividade_id, usuario_id, prioridade)
      (
        SELECT id, $2 as usuario_id, row_number() over(order by id) + $3-1 as prioridade
        FROM macrocontrole.atividade
        WHERE id in ($1:raw)
      )
      `,
      [atividade_ids.join(","), usuario_prioridade_id, prioridade]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da fila prioritária.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_ids = atividade_ids;
    err.information.usuario_prioridade_id = usuario_prioridade_id;
    err.information.prioridade = prioridade;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.cria_fila_prioritaria_grupo = async (
  atividade_ids,
  perfil_producao_id,
  prioridade
) => {
  try {
    await db.none(
      `
      INSERT INTO macrocontrole.fila_prioritaria_grupo(atividade_id, perfil_producao_id, prioridade)
      (
        SELECT id, $2 as perfil_producao_id, row_number() over(order by id) + $3-1 as prioridade
        FROM macrocontrole.atividade
        WHERE id in ($1:raw)
      )
      `,
      [atividade_ids.join(","), perfil_producao_id, prioridade]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da fila prioritária grupo.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_ids = atividade_ids;
    err.information.perfil_producao_id = perfil_producao_id;
    err.information.prioridade = prioridade;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.cria_observacao = async (
  atividade_ids,
  observacao_atividade,
  observacao_etapa,
  observacao_subfase,
  observacao_unidade_trabalho
) => {
  try {
    await db.tx(async t => {
      await t.any(
        `
        UPDATE macrocontrole.atividade SET
        observacao = $2 WHERE id in ($1:raw)
        `,
        [atividade_ids.join(","), observacao_atividade]
      );

      await t.any(
        `
        UPDATE macrocontrole.etapa SET
        observacao = $2 WHERE id in (
          SELECT DISTINCT e.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($1:raw)
        )
        `,
        [atividade_ids.join(","), observacao_etapa]
      );

      await t.any(
        `
        UPDATE macrocontrole.subfase SET
        observacao = $2 WHERE id in (
          SELECT DISTINCT e.subfase_id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($1:raw)
        )
        `,
        [atividade_ids.join(","), observacao_subfase]
      );

      await t.any(
        `
        UPDATE macrocontrole.unidade_trabalho SET
        observacao = $2 WHERE id in (
          SELECT DISTINCT a.unidade_trabalho_id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($1:raw)
        )
        `,
        [atividade_ids.join(","), observacao_unidade_trabalho]
      );
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação de observação.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_ids = atividade_ids;
    err.information.observacao_atividade = observacao_atividade;
    err.information.observacao_etapa = observacao_etapa;
    err.information.observacao_subfase = observacao_subfase;
    err.information.observacao_unidade_trabalho = observacao_unidade_trabalho;
    err.information.trace = serializeError(error);
    return { error: err };
  }
};

controller.createProject = () => {
  console.log(chalk.blue("Criando arquivo de projeto"));

  try {
    const proj = fs
      .readFileSync(
        path.resolve("./templates/sap_config_template.qgs"),
        "utf-8"
      )
      .replace(/{{DATABASE}}/g, process.env.DB_NAME)
      .replace(/{{HOST}}/g, process.env.DB_SERVER)
      .replace(/{{PORT}}/g, process.env.DB_PORT)
      .replace(/{{USER}}/g, process.env.DB_USER)
      .replace(/{{PASSWORD}}/g, process.env.DB_PASSWORD);

    const exists = fs.existsSync("sap_config.qgs");
    if (exists) {
      throw Error(
        "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
      );
    }
    fs.writeFileSync("sap_config.qgs", proj);
    console.log(
      chalk.blue("Arquivo de projeto (sap_config.qgs) criado com sucesso!")
    );
  } catch (error) {
    if (
      error.message ===
      "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
    ) {
      console.log(
        chalk.red(
          "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
        )
      );
    } else {
      console.log(chalk.red(error.message));
      console.log("-------------------------------------------------");
      console.log(chalk.red(error));
    }
  }
};

module.exports = controller;
