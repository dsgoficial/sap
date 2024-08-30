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
        INNER JOIN controle_campo.relacionamento_campo_produto AS r ON r.campo_id = c.id
        INNER JOIN macrocontrole.produto AS p ON p.id = r.produto_id
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome
        `
    )
}

controller.getCampoById = async (campo_id) => {
    return db.sapConn.any(
        `SELECT c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome AS situacao, ST_COLLECT(c.geom) AS geom,
        json_agg(json_build_object('id', t.id, 'militar', t.militar, 
        'placa_vtr', t.placa_vtr, 'inicio', t.inicio, 'fim', t.fim,
         'geom', t.geom)) AS track,
        json_agg(json_build_object('id', i.id, 'nome', i.nome)) AS imagem
        FROM controle_campo.campo AS c
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
        const produtosGeom = await t.one(
            `SELECT ST_Multi(ST_Transform(ST_Union(p.geom), 4674))::geometry(MULTIPOLYGON, 4674) AS geom
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>) 
            AND (ST_GeometryType(p.geom) = 'ST_Polygon' OR ST_GeometryType(p.geom) = 'ST_MultiPolygon')`,
            { produtos_id: campo.produtos_id }
        )
        
        const novoCampo = await t.one(
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

        for (const produto_id of campo.produtos_id) {
            await t.none(
            `INSERT INTO controle_campo.relacionamento_campo_produto
            (campo_id, produto_id)
            VALUES
            ($<campo_id>, $<produtos_id>)
            `,
            {
                campo_id: novoCampo.id,
                produtos_id: produto_id
            }
        );
    }
        return novoCampo
    })
}

controller.atualizaCampo = async (id, campo) => {
    return db.sapConn.tx(async t => {
        const produtosExistentes = await t.one(
            `SELECT count(*) AS num_produtos
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>)`,
            { produtos_id: campo.produtos_id }
        )
 
        if (produtosExistentes.num_produtos != campo.produtos_id.length) {
            throw new AppError('Produtos inexistentes', httpCode.NotFound)
          }

        const produtosGeom = await t.one(
            `SELECT ST_Multi(ST_Transform(ST_Union(p.geom), 4674))::geometry(MULTIPOLYGON, 4674) AS geom
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>)`,
            { produtos_id: campo.produtos_id }
        )

        campo.id = id;
        campo.geom = produtosGeom.geom;
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'nome', 'pit', 'descricao', 'militares', 'placas_vtr', 'inicio', 'fim', 'situacao_id', 'geom'
        ])

        const query =
            db.pgp.helpers.update(campo,  cs, {table: 'campo', schema: 'controle_campo'}) + ` WHERE id = $/id/`;
                
        await t.none(query, { id });
    })
}

controller.deletaCampo = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.relacionamento_campo_produto WHERE campo_id = $<id>`,
            { id: id }
        );
        await t.none(
            `DELETE FROM controle_campo.imagem WHERE campo_id = $<id>`,
            { id: id }
        );
        await t.none(
            `DELETE FROM controle_campo.track WHERE campo_id = $<id>`,
            { id: id }
        );
        await t.none(
            `DELETE FROM controle_campo.campo WHERE id = $<id>`,
            { id: id }
        );
    })
}

// Gerencia Fotos
controller.criaFotos = async (fotos) => {
    return db.sapConn.tx(async t => {
        const cs = new db.pgp.helpers.ColumnSet([
            'nome', 'campo_id'
        ])

        const query = db.pgp.helpers.insert(fotos, cs, {
            table: 'imagem',
            schema: 'controle_campo'
        })
        await t.none(query)
    });
}

controller.deletaFotos = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.imagem WHERE id = $<id>`,
            { id: id }
        )
    })
}

controller.deletaFotosByCampo = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.imagem WHERE campo_id = $<id>`,
            { id: id }
        )
    })
}

controller.criaTracker = async (track) => {
    return db.sapConn.tx(async t => {
        await t.one(
            `INSERT INTO controle_campo.track
            (militar, placa_vtr, data, inicio, fim, campo_id, geom)
            VALUES
            ($<militar>, $<placa_vtr>, $<data>, $<inicio>, $<fim>, $<campo_id>, $<geom>)
            RETURNING id
            `,
            {
                militar: track.militar,
                placa_vtr: track.placa_vtr,
                data: track.data,
                inicio: track.inicio,
                fim: track.fim,
                campo_id: track.campo_id,
                geom: track.geom
            }
        )
    })
}

controller.deleteTracker = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.track WHERE id = $<id>`,
            { id: id }
        )
    })
}

module.exports = controller