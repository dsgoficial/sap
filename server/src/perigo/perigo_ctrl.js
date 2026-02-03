'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const { db, disableTriggers } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.limpaAtividades = async usuarioId => {
  let ativids;
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const updatedIds = await t.any(
      `UPDATE macrocontrole.atividade
      SET usuario_id = NULL, data_inicio = NULL, data_fim = NULL, tipo_situacao_id = 1
      WHERE usuario_id = $<usuarioId> RETURNING id`,
      { usuarioId }
    )

    if (!updatedIds.length || updatedIds.length == 0) {
      throw new AppError(
        'Usuário não encontrado ou o usuário não possue atividades relacionadas',
        httpCode.BadRequest
      )
    }

    ativids = updatedIds.map(row => row.id)
  
  })
  await disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, ativids)
}

controller.limpaLog = async() => {
  const logDir = path.join(__dirname, '..', '..', 'logs/combined.log')
  const daysToShow = 3
  const cutofftimestamp = new Date(Date.now() - daysToShow * 24 * 60 * 60 * 1000);

  let fileData = await readFile(logDir, 'utf8')

  let logData = fileData.split('\n').filter(entry => {
    const logDate = new Date(entry.split('|')[0])
    return logDate > cutofftimestamp
  }).join('\n')
  
  fs.writeFileSync(logDir, logData);

}

controller.getPropriedadesCamada = async () => {
  return db.sapConn.any(
    `SELECT pc.camada_id, pc.camada_incomum, pc.atributo_filtro_subfase, 
    pc.camada_apontamento, pc.atributo_situacao_correcao, 
    pc.atributo_justificativa_apontamento', pc.subfase_id
    FROM macrocontrole.propriedades_camada AS pc
    INNER JOIN macrocontrole.subfase AS s ON s.id = pc.subfase_id`
  )
}

controller.criaPropriedadesCamada = async propriedadesCamada => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'camada_id', 'camada_incomum', 'atributo_filtro_subfase', 
      'camada_apontamento', 'atributo_situacao_correcao', 
      'atributo_justificativa_apontamento', 'subfase_id'
    ])

    const query = db.pgp.helpers.insert(propriedadesCamada, cs, {
      table: 'propriedades_camada',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPropriedadesCamada = async propriedadesCamada => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'camada_id', 'camada_incomum', 'atributo_filtro_subfase',
      'camada_apontamento', 'atributo_situacao_correcao',
      'atributo_justificativa_apontamento', 'subfase_id'
    ])

    const query =
      db.pgp.helpers.update(
        propriedadesCamada,
        cs,
        { table: 'propriedades_camada', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deletePropriedadesCamada = async propriedadesCamadaIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.propriedades_camada
      WHERE id in ($<propriedadesCamadaIds:csv>)`,
      { propriedadesCamadaIds }
    )

    if (exists && exists.length < propriedadesCamadaIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma propriedade de camada id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.propriedades_camada
      WHERE id in ($<propriedadesCamadaIds:csv>)`,
      { propriedadesCamadaIds }
    )
  })
}

controller.getInsumo = async () => {
  return db.sapConn.any(
    `SELECT i.id, i.nome, i.caminho, i.epsg, i.tipo_insumo_id, i.grupo_insumo_id, i.geom,
    ti.nome AS tipo_insumo, gi.nome AS grupo_insumo
    FROM macrocontrole.insumo AS i
    INNER JOIN dominio.tipo_insumo AS ti ON ti.code = i.tipo_insumo_id
    INNER JOIN macrocontrole.grupo_insumo AS gi ON gi.id = i.grupo_insumo_id`
  )
}

controller.criaInsumo = async insumo => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome', 'caminho', 'epsg', 'tipo_insumo_id', 
      'grupo_insumo_id', 'geom'
    ])

    const query = db.pgp.helpers.insert(insumo, cs, {
      table: 'insumo',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaInsumo = async insumo => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'nome', 'caminho', 'epsg', 'tipo_insumo_id',
      'grupo_insumo_id', 'geom'
    ])

    const query =
      db.pgp.helpers.update(
        insumo,
        cs,
        { table: 'insumo', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteInsumo = async insumoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.insumo
      WHERE id in ($<insumoIds:csv>)`,
      { insumoIds }
    )

    if (exists && exists.length < insumoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um insumo id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.insumo
      WHERE id in ($<insumoIds:csv>)`,
      { insumoIds }
    )
  })
}

controller.deleteProdutosSemUT = async () => {
  return db.sapConn.tx(async t => {
    const deletedProducts = await t.any(
      `DELETE FROM macrocontrole.produto
      WHERE id IN (
        SELECT p.id
        FROM macrocontrole.produto AS p
        LEFT JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
        WHERE rp.ut_id IS NULL
      )
      RETURNING id`
    );
    
    return deletedProducts;
  });
};

controller.deleteUTSemAtividade = async () => {
  return db.sapConn.tx(async t => {
    const deletedUT = await t.any(
      `DELETE FROM macrocontrole.unidade_trabalho
      WHERE id IN (
        SELECT ut.id
        FROM macrocontrole.unidade_trabalho AS ut
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
        WHERE a.unidade_trabalho_id IS NULL
      )
      RETURNING id`
    );
    
    return deletedUT;
  });
};


controller.deleteLoteSemProduto = async () => {
  const deletedLotes = await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const lotesToDelete = await t.any(
      `SELECT l.id
      FROM macrocontrole.lote AS l
      LEFT JOIN macrocontrole.produto AS p ON p.lote_id = l.id
      WHERE p.id IS NULL`
    );

    if (lotesToDelete.length === 0) {
      return []; // No lotes to delete
    }

    const loteIds = lotesToDelete.map(lote => lote.id);

    const existingUnidades = await t.any(
      `SELECT id FROM macrocontrole.unidade_trabalho WHERE lote_id IN ($<loteIds:csv>)`,
      { loteIds }
    );

    if (existingUnidades.length > 0) {
      const unidadesWithAtividades = await t.any(
        `SELECT ut.id
        FROM macrocontrole.unidade_trabalho ut
        WHERE ut.lote_id IN ($<loteIds:csv>)
        AND EXISTS (
          SELECT 1 FROM macrocontrole.atividade a WHERE a.unidade_trabalho_id = ut.id
        )`,
        { loteIds }
      );

      if (unidadesWithAtividades.length > 0) {
        throw new AppError('Não é possível deletar lotes com Unidades de Trabalho que possuem Atividades associadas.', httpCode.BadRequest);
      }

      await t.none(`DELETE FROM macrocontrole.insumo_unidade_trabalho WHERE unidade_trabalho_id IN ($<unidadeIds:csv>)`, { unidadeIds: existingUnidades.map(u => u.id) });

      await t.none(`DELETE FROM macrocontrole.unidade_trabalho WHERE id IN ($<unidadeIds:csv>)`, { unidadeIds: existingUnidades.map(u => u.id) });
    }

    const etapasWithAtividades = await t.any(
      `SELECT e.id
      FROM macrocontrole.etapa e
      WHERE e.lote_id IN ($<loteIds:csv>)
      AND EXISTS (
        SELECT 1 FROM macrocontrole.atividade a WHERE a.etapa_id = e.id
      )`,
      { loteIds }
    );

    if (etapasWithAtividades.length > 0) {
      throw new AppError('Não é possível deletar lotes com Etapas que possuem Atividades associadas.', httpCode.BadRequest);
    }

    await t.none(`DELETE FROM macrocontrole.restricao_etapa WHERE etapa_anterior_id IN (SELECT id FROM macrocontrole.etapa WHERE lote_id IN ($<loteIds:csv>)) OR etapa_posterior_id IN (SELECT id FROM macrocontrole.etapa WHERE lote_id IN ($<loteIds:csv>))`, { loteIds });

    const blocosWithPerfil = await t.any(
      `SELECT b.id
      FROM macrocontrole.bloco b
      WHERE b.lote_id IN ($<loteIds:csv>)
      AND EXISTS (
        SELECT 1 FROM macrocontrole.perfil_bloco_operador pbo WHERE pbo.bloco_id = b.id
      )`,
      { loteIds }
    );

    if (blocosWithPerfil.length > 0) {
      throw new AppError('Não é possível deletar lotes com Blocos que possuem Perfil de Operador associado.', httpCode.BadRequest);
    }

    const blocosWithUnidades = await t.any(
      `SELECT b.id
      FROM macrocontrole.bloco b
      WHERE b.lote_id IN ($<loteIds:csv>)
      AND EXISTS (
        SELECT 1 FROM macrocontrole.unidade_trabalho ut WHERE ut.bloco_id = b.id
      )`,
      { loteIds }
    );

    if (blocosWithUnidades.length > 0) {
      throw new AppError('Não é possível deletar lotes com Blocos que possuem Unidades de Trabalho associadas.', httpCode.BadRequest);
    }

    await t.none(`DELETE FROM macrocontrole.perfil_requisito_finalizacao WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_fme WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_configuracao_qgis WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_estilo WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_regras WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_menu WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_tema WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_model_qgis WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_linhagem WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_workflow_dsgtools WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.perfil_alias WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.pit WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });


    await t.none(`DELETE FROM macrocontrole.etapa WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });
    await t.none(`DELETE FROM macrocontrole.bloco WHERE lote_id IN ($<loteIds:csv>)`, { loteIds });

    const deletedLotes = await t.any(
      `DELETE FROM macrocontrole.lote
      WHERE id IN ($<loteIds:csv>)
      RETURNING id`,
      { loteIds }
    );

    return deletedLotes;
  });
  
  for (const lote of deletedLotes) {
    await disableTriggers.refreshMaterializedViewFromLote(db.sapConn, lote.id);
  }

  return deletedLotes;
};


module.exports = controller