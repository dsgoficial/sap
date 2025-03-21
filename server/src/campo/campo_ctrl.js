'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const { db, disableTriggers } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getSituacao = async () => {
    return db.sapConn.any(
        `SELECT s.code, s.nome
        FROM controle_campo.situacao AS s`
    )
}

controller.getCategorias = async () => {   
    return db.sapConn.any(
        `SELECT unnest(enum_range(NULL::controle_campo.categoria_campo)) as categoria;`
    )
}

controller.getCampos = async () => {
    return db.sapConn.any(
        `SELECT c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome AS situacao, ST_COLLECT(c.geom) AS geom,
        (
            SELECT COUNT(*)
            FROM controle_campo.imagem AS img
            WHERE img.campo_id = c.id
        ) AS qtd_fotos,
        (
            SELECT COUNT(*)
            FROM controle_campo.track AS t
            WHERE t.campo_id = c.id
        ) AS qtd_track
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome
        `
    )
}

controller.getCampoById = async (campo_id) => {
    return db.sapConn.one(
        `SELECT 
            c.id, 
            c.nome, 
            c.orgao, 
            c.pit, 
            c.descricao, 
            c.militares, 
            c.placas_vtr, 
            c.inicio, 
            c.fim, 
            c.situacao_id, 
            s.nome AS situacao, 
            c.geom,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', p.id,
                        'nome', p.nome
                    )
                )
                FROM controle_campo.relacionamento_campo_produto AS rcp
                JOIN macrocontrole.produto AS p ON p.id = rcp.produto_id
                WHERE rcp.campo_id = c.id
            ) AS produtos,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'chefe_vtr', t.chefe_vtr,
                        'motorista', t.motorista,
                        'placa_vtr', t.placa_vtr,
                        'dia', t.dia,
                        'inicio', t.inicio,
                        'fim', t.fim,
                        'geom', ST_AsGeoJSON(t.geom)::json
                    )
                )
                FROM controle_campo.track AS t
                WHERE t.campo_id = c.id
            ) AS tracks,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', i.id,
                        'descricao', i.descricao,
                        'data_imagem', i.data_imagem,
                        'imagem_jsonb', i.imagem_jsonb
                    )
                )
                FROM controle_campo.imagem AS i
                WHERE i.campo_id = c.id
            ) AS imagens
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        WHERE c.id = $<id>`,
        { id: campo_id }
    )
}

controller.criaCampo = async (campo) => {
    return await db.sapConn.none(
            `INSERT INTO controle_campo.campo
            (nome, descricao, orgao, pit, militares, placas_vtr, inicio, fim, situacao_id, categorias, geom)
            VALUES
            ($<nome>, $<descricao>, $<orgao>, $<pit>, $<militares>, $<placas_vtr>, $<inicio>, $<fim>, $<situacao_id>, $<categorias>::controle_campo.categoria_campo[], ST_GEOMFROMEWKT($<geom>))
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
                categorias: campo.categorias || [],
                geom: campo.geom
            }
        )
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
            `SELECT ST_Multi(ST_Transform(ST_Union(p.geom), 4326))::geometry(MULTIPOLYGON, 4326) AS geom
            FROM macrocontrole.produto AS p
            WHERE p.id IN ($<produtos_id:csv>)`,
            { produtos_id: campo.produtos_id }
        )

        campo.id = id;
        campo.geom = produtosGeom.geom;
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'nome', 'pit', 'descricao', 'militares', 'placas_vtr', 'inicio', 'fim', 'situacao_id', 'categorias', 'geom'
        ])

        const query =
            db.pgp.helpers.update(campo,  cs, {table: 'campo', schema: 'controle_campo'}) + ` WHERE id = $/id/`;
                
        await t.none(query, { id });
    })
}

controller.deletaCampo = async (id) => {
    return db.sapConn.tx(async t => {
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

controller.getEstatisticasCampos = async () => {
    return db.sapConn.task(async t => {
        // Estatísticas por situação
        const estatisticaPorSituacao = await t.any(
            `SELECT s.nome AS situacao, COUNT(c.id) AS quantidade
            FROM controle_campo.campo AS c
            INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
            GROUP BY s.nome
            ORDER BY quantidade DESC`
        );

        // Estatísticas por categoria
        const estatisticaPorCategoria = await t.any(
            `WITH categorias_expansao AS (
              SELECT c.id, unnest(c.categorias) AS categoria
              FROM controle_campo.campo AS c
            )
            SELECT categoria, COUNT(DISTINCT id) AS quantidade
            FROM categorias_expansao
            GROUP BY categoria
            ORDER BY quantidade DESC`
          );

        // Estatísticas por órgão
        const estatisticaPorOrgao = await t.any(
            `SELECT c.orgao, COUNT(c.id) AS quantidade
            FROM controle_campo.campo AS c
            GROUP BY c.orgao
            ORDER BY quantidade DESC`
        );

        // Estatísticas por ano do PIT
        const estatisticaPorPIT = await t.any(
            `SELECT c.pit, COUNT(c.id) AS quantidade
            FROM controle_campo.campo AS c
            GROUP BY c.pit
            ORDER BY pit DESC`
        );

        // Total de campos
        const totalCampos = await t.one(
            `SELECT COUNT(id) AS total
            FROM controle_campo.campo`
        );

        // Área total (em km²)
        const areaTotalKm2 = await t.one(
            `SELECT SUM(
                CASE 
                  WHEN geom IS NOT NULL THEN ST_Area(ST_Transform(geom, 3857)::geography) / 1000000
                  ELSE 0
                END
              ) AS area_total_km2
            FROM controle_campo.campo`
          );

        return {
            total_campos: totalCampos.total,
            area_total_km2: areaTotalKm2.area_total_km2,
            por_situacao: estatisticaPorSituacao,
            por_categoria: estatisticaPorCategoria,
            por_orgao: estatisticaPorOrgao,
            por_pit: estatisticaPorPIT
        };
    });
};

// Gerencia Fotos
controller.criaFotos = async (fotos) => {
    return db.sapConn.tx(async t => {
        const cs = new db.pgp.helpers.ColumnSet([
            'descricao', 'campo_id', 'data_imagem', 'imagem_bin'
        ])

        for (const foto of fotos) {
            foto.imagem_bin = Buffer.from(foto.imagem_base64, 'base64')
        }

        const query = db.pgp.helpers.insert(fotos, cs, {
            table: 'imagem',
            schema: 'controle_campo'
        })
        await t.none(query)
    });
}

controller.getFotoById = async (id) => {
    return db.sapConn.one(
        `SELECT id, descricao, data_imagem, imagem_jsonb, campo_id
        FROM controle_campo.imagem
        WHERE id = $<id>`,
        { id: id }
    )
}

// Função para obter todas as fotos de um campo específico
controller.getFotosByCampo = async (campo_id) => {
    return db.sapConn.any(
        `SELECT id, descricao, data_imagem, imagem_jsonb
        FROM controle_campo.imagem
        WHERE campo_id = $<campo_id>`,
        { campo_id: campo_id }
    )
}

// Função para atualizar informações de uma foto
controller.atualizaFoto = async (id, foto) => {
    return db.sapConn.tx(async t => {
        const fotoAtualizada = {
            id: id,
            descricao: foto.descricao,
            data_imagem: foto.data_imagem
        }
        
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'descricao', 'data_imagem'
        ])

        const query = db.pgp.helpers.update(fotoAtualizada, cs, {
            table: 'imagem',
            schema: 'controle_campo'
        }) + ` WHERE id = $/id/`
        
        await t.none(query, { id })
    })
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
            (chefe_vtr, motorista, placa_vtr, dia, inicio, fim, campo_id, geom)
            VALUES
            ($<chefe_vtr>, $<motorista>, $<placa_vtr>, $<dia>, $<inicio>, $<fim>, $<campo_id>, $<geom>)
            RETURNING id
            `,
            {
                chefe_vtr: track.chefe_vtr,
                motorista: track.motorista,
                placa_vtr: track.placa_vtr,
                dia: track.dia,
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

// Função para obter todos os tracks de um campo
controller.getTracksByCampo = async (campo_id) => {
    return db.sapConn.any(
        `SELECT id, chefe_vtr, motorista, placa_vtr, dia, inicio, fim, ST_AsGeoJSON(geom)::json as geom
        FROM controle_campo.track
        WHERE campo_id = $<campo_id>`,
        { campo_id: campo_id }
    )
}

// Função para obter um track específico pelo ID
controller.getTrackById = async (id) => {
    return db.sapConn.one(
        `SELECT id, chefe_vtr, motorista, placa_vtr, dia, inicio, fim, campo_id, ST_AsGeoJSON(geom)::json as geom
        FROM controle_campo.track
        WHERE id = $<id>`,
        { id: id }
    )
}

// Função para atualizar um track
controller.atualizaTrack = async (id, track) => {
    return db.sapConn.tx(async t => {
        const trackAtualizado = {
            id: id,
            chefe_vtr: track.chefe_vtr,
            motorista: track.motorista,
            placa_vtr: track.placa_vtr,
            dia: track.dia,
            inicio: track.inicio,
            fim: track.fim
        }
        
        // Se a geometria foi fornecida, incluí-la na atualização
        if (track.geom) {
            trackAtualizado.geom = track.geom
        }
        
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'chefe_vtr', 'motorista', 'placa_vtr', 'dia', 'inicio', 'fim',
            { name: 'geom', mod: ':raw', def: null }
        ])

        const query = db.pgp.helpers.update(trackAtualizado, cs, {
            table: 'track',
            schema: 'controle_campo'
        }) + ` WHERE id = $/id/`
        
        await t.none(query, { id })
    })
}

module.exports = controller