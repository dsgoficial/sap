'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const { db, disableTriggers } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}
controller.getCampos = async () => {
    return db.sapConn.any(
        `SELECT c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome AS situacao, ST_COLLECT(p.geom) AS geom
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        INNER JOIN controle_campo.relacionamento_campos_produtos AS r ON r.campo_id = c.id
        INNER JOIN macrocontrole.produto AS p ON p.id = r.produto_id
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome
        `
    )
}

controller.getCampoById = async (campo_id) => {
    return db.sapConn.any(
        `SELECT c.id, c.nome, c.orgao,c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome AS situacao, ST_COLLECT(p.geom) AS geom
        json_agg(json_build_object('id', t.id, 'dia', t.data, 'militar', t.militar, 
        'placa_vtr', t.placa_vtr, 'inicio', t.inicio, 'fim', t.fim,
         'geom', t.geom)) AS track
        json_agg(json_build_object('id', i.id, 'nome', i.nome)) AS imagem
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        INNER JOIN controle_campo.relacionamento_campos_produtos AS r ON r.campo_id = c.id
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        LEFT JOIN controle_campo.imagem AS i ON i.campo_id = c.id
        LEFT JOIN controle_campo.track AS t ON t.campo_id = c.id
        WHERE c.id = $<id>
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome
        `,
        { id: campo_id }
    )
}

controller.criaCampo = async (campo) => {
    return db.sapConn.tx(async t => {
        const produtosGeom = t.one(
            `SELECT ST_COLLECT(p.geom) AS geom
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>)`,
            { produtos_id: campo.produtos_id }
        )

        t.one(
            `INSERT INTO controle_campo.campo
            (nome, descricao, orgao, pit, militares, placas_vtr, inicio, fim, situacao_id, geom)
            VALUES
            ($<nome>, $<descricao>, $<orgao>, $<pit>, $<militares>, $<placas_vtr>, $<inicio>, $<fim>, $<situacao_id>, $<geom>)
            RETURNING id
            `,
            {
                nome: campo.nome,
                descricao: campo.descricao,
                pit: campo.pit,
                orgao: campo.orgao,
                militares: campo.militares,
                placas_vtr: campo.placas_vtr,
                inicio: campo.inicio,
                fim: campo.fim,
                situacao_id: campo.situacao_id,
                geom: produtosGeom.geom
            }
        )
    })
}

controller.atualizaCampo = async (id, campo) => {
    return db.sapConn.tx(async t => {
        const produtosGeom = t.one(
            `SELECT ST_COLLECT(p.geom) AS geom
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>)`,
            { produtos_id: campo.produtos_id }
        )

        campo.id = id;
        campo.geom = produtosGeom.geom;
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'nome', 'pit','descricao', 'militares', 'placas_vtr', 'inicio', 'fim', 'situacao_id', 'geom'
        ])

        const query =
            db.pgp.helpers.update(
                campo,  
                cs,
                { table: 'controle_campo.campo', schema: 'controle_campo' },
                {
                    tableAlias: 'X',
                    valueAlias: 'Y'
                }
            ) + 'WHERE Y.id = X.id' 
        await t.none(query)
    })
}

module.exports = controller