'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const { db } = require('../database')

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
    const deletedUTs = await t.any(
      `DELETE FROM macrocontrole.unidade_trabalho
      WHERE id IN (
        SELECT ut.id
        FROM macrocontrole.unidade_trabalho AS ut
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
        WHERE a.id IS NULL
      )
      RETURNING id`
    );
    
    return deletedUTs;
  });
};

controller.deleteLoteSemProduto = async () => {
  return db.sapConn.tx(async t => {
    const deletedLotes = await t.any(
      `DELETE FROM macrocontrole.lote
      WHERE id IN (
        SELECT l.id
        FROM macrocontrole.lote AS l
        LEFT JOIN macrocontrole.produto AS p ON p.lote_id = l.id
        WHERE p.id IS NULL
      )
      RETURNING id`
    );
    
    return deletedLotes;
  });
};

module.exports = controller