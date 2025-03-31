// Carregar dependências externas
'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const { db, disableTriggers } = require('../database')
const { AppError, httpCode } = require('../utils')
const controller = {}

// Função para obter todas as situações
controller.getSituacao = async () => {
    return db.sapConn.any(
        `SELECT s.code, s.nome
        FROM controle_campo.situacao AS s`
    )
}

// Função para obter todas as categorias
controller.getCategorias = async () => {   
    return db.sapConn.any(
        `SELECT unnest(enum_range(NULL::controle_campo.categoria_campo)) as categoria;`
    )
}

// Função para obter todos os produtos de um lote
controller.getProdutosByLot = async (lote_id) => {
    return db.sapConn.any(
        `SELECT p.id, p.nome
        FROM macrocontrole.produto as p
        INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
        WHERE l.id = $<lot>`,
        { lot: lote_id }
    )
}

// Rotas de Campo
// Função para obter todos os campos + imagens + tracks
controller.getCampos = async () => {
    return db.sapConn.any(
        `SELECT c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome AS situacao, ST_AsEWKT(c.geom) AS geom, c.categorias,
        (
            SELECT COUNT(*)
            FROM controle_campo.imagem AS img
            WHERE img.campo_id = c.id
        ) AS qtd_fotos,
        (
            SELECT COUNT(*)
            FROM controle_campo.track AS t
            WHERE t.campo_id = c.id
        ) AS qtd_track,
        (
			SELECT COUNT(*)
			FROM controle_campo.relacionamento_campo_produto AS rcp
			WHERE rcp.campo_id = c.id
		) AS produtos_associados
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio, 
        c.fim, c.situacao_id, s.nome
        `
    )
}

// Retornar campos como GeoJSON
controller.getCamposGeoJson = async () => {
    return db.sapConn.any(`
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(c.geom)::json,
                    'properties', json_build_object(
                        'id', c.id,
                        'nome', c.nome,
                        'descricao', c.descricao,
                        'situacao', s.nome,
                        'inicio', c.inicio,
                        'fim', c.fim
                    )
                )
            )
        ) AS geojson
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        WHERE c.geom IS NOT NULL
    `).then(result => {
        return result[0].geojson;
    });
}

// Função para obter um campo específico
controller.getCampoById = async (campo_id) => {
    return db.sapConn.one(
        `SELECT c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio,
        c.fim, c.situacao_id, s.nome AS situacao, ST_AsEWKT(c.geom) AS geom,
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
                'dia', t.dia
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
                'imagem_bin', i.imagem_bin
            )
        )
            FROM controle_campo.imagem AS i
            WHERE i.campo_id = c.id
        ) AS imagens
        FROM controle_campo.campo AS c
        INNER JOIN controle_campo.situacao AS s ON s.code = c.situacao_id
        WHERE c.id = $<id>
        GROUP BY c.id, c.nome, c.orgao, c.pit, c.descricao, c.militares, c.placas_vtr, c.inicio,
        c.fim, c.situacao_id, s.nome`,
        { id: campo_id }
    )
}

// Função para criar um campo
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

// Função para atualizar um campo
controller.atualizaCampo = async (id, campo) => {
    try {
        // Criar a consulta SQL com cast explícito para o campo categorias
        const query = `
            UPDATE controle_campo.campo 
            SET 
                nome = $(nome),
                descricao = $(descricao),
                orgao = $(orgao),
                pit = $(pit),
                militares = $(militares),
                placas_vtr = $(placas_vtr),
                inicio = $(inicio),
                fim = $(fim),
                situacao_id = $(situacao_id),
                categorias = $(categorias)::controle_campo.categoria_campo[]
            WHERE id = $(id)
        `;
        
        // Adicionar o ID ao objeto campo
        campo.id = id;
        
        // Executar a consulta
        await db.sapConn.none(query, campo);
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar campo:', error);
        throw error;
    }
}

// Função para deletar um campo
controller.deletaCampo = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.relacionamento_campo_produto WHERE campo_id = $<id>`,
            { id: id }
        );
        await t.none(
            `DELETE FROM controle_campo.campo WHERE id = $<id>`,
            { id: id }
        );
    })
}

// Função para obter estatísticas dos campos, apenas Front-End
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
// Função para obter todas as fotos
controller.getFotos = async () => {
    return db.sapConn.any(
        `SELECT i.id, i.descricao, i.data_imagem, i.campo_id, c.nome AS nome_campo
        FROM controle_campo.imagem AS i
        INNER JOIN controle_campo.campo AS c ON i.campo_id = c.id`
    )
}

// Função para obter uma foto específica pelo ID
controller.getFotoById = async (id) => {
    return db.sapConn.one(
        `SELECT id, descricao, data_imagem, imagem_bin, campo_id
        FROM controle_campo.imagem
        WHERE id = $<id>`,
        { id: id }
    )
}

// Função para obter todas as fotos de um campo específico
controller.getFotosByCampo = async (campo_id) => {
    return db.sapConn.any(
        `SELECT id, descricao, data_imagem, imagem_bin
        FROM controle_campo.imagem
        WHERE campo_id = $<campo_id>`,
        { campo_id: campo_id }
    )
}

// Função para criar fotos
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

// Função para deletar uma foto
controller.deletaFotos = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.imagem WHERE id = $<id>`,
            { id: id }
        )
    })
}

// Função para deletar todas as fotos de um campo
controller.deletaFotosByCampo = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.imagem WHERE campo_id = $<id>`,
            { id: id }
        )
    })
}

// Funções de Trackers
// Selecionar todos os tracks
controller.getTracks = async () => {
    return db.sapConn.any(
        `SELECT t.id, t.chefe_vtr, t.motorista, t.placa_vtr, t.dia, t.campo_id, c.nome AS nome_campo
        FROM controle_campo.track AS t
        INNER JOIN controle_campo.campo AS c ON t.campo_id = c.id`
    )
}

// Função para obter um track específico pelo ID
controller.getTrackById = async (id) => {
    return db.sapConn.one(
        `SELECT id, chefe_vtr, motorista, placa_vtr, dia, campo_id, ST_AsGeoJSON(geom)::json as geom
        FROM controle_campo.track
        WHERE id = $<id>`,
        { id: id }
    )
}

// Função para onter um track por campo
controller.getTracksByCampo = async (campo_id) => {
    return db.sapConn.any(
        `SELECT id, chefe_vtr, motorista, placa_vtr, dia
        FROM controle_campo.track
        WHERE campo_id = $<campo_id>`,
        { campo_id: campo_id }
    )
}

// Função para criar um track
controller.criaTracker = async (track) => {
    return db.sapConn.tx(async t => {
        const result = await t.one(
            `INSERT INTO controle_campo.track
            (chefe_vtr, motorista, placa_vtr, dia, campo_id)
            VALUES
            ($<chefe_vtr>, $<motorista>, $<placa_vtr>, $<dia>, $<campo_id>)
            RETURNING id
            `,
            {
                chefe_vtr: track.chefe_vtr,
                motorista: track.motorista,
                placa_vtr: track.placa_vtr,
                dia: track.dia,
                campo_id: track.campo_id
            }
        );
        return result.id;  // Retorna explicitamente o ID gerado
    });
}

// Função para atualizar um track
controller.atualizaTrack = async (id, track) => {
    return db.sapConn.tx(async t => {
        const trackAtualizado = {
            id: id,
            chefe_vtr: track.chefe_vtr,
            motorista: track.motorista,
            placa_vtr: track.placa_vtr,
            dia: track.dia
        }
        
        const cs = new db.pgp.helpers.ColumnSet([
            'id', 'chefe_vtr', 'motorista', 'placa_vtr', 'dia'
        ])

        const query = db.pgp.helpers.update(trackAtualizado, cs, {
            table: 'track',
            schema: 'controle_campo'
        }) + ` WHERE id = $/id/`
        
        await t.none(query, { id })
    })
}

// Função para deletar um track
controller.deleteTracker = async (id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.track_p WHERE track_id = $<id>`,
            { id: id }
        )
        await t.none(
            `DELETE FROM controle_campo.track WHERE id = $<id>`,
            { id: id }
        )
    })
}

// Funções de Controle para Tracker Ponto
// Função para criar um track ponto
controller.criaTrackerPonto = async (tracks) => {
    let trackIds = []
    await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
        const cs = new db.pgp.helpers.ColumnSet([
          'id',
          'track_id',
          'x_ll',
          'y_ll',
          'track_id_garmin',
          'track_segment',
          'track_segment_point_index',
          'elevation',
          'creation_time',
          { name: 'geom', mod: ':raw' },
          { name: 'data_importacao', init: () => new Date() }
        ])
    
        // Formatação da geometria para cada track ponto
        tracks.forEach(p => {
          if (!p.x_ll || !p.y_ll) {
            throw new AppError(
              'Coordenadas x_ll e y_ll são obrigatórias',
              httpCode.BadRequest
            )
          }
          
          // Conversão das coordenadas para geometria de ponto
          p.geom = `ST_SetSRID(ST_MakePoint(${p.x_ll}, ${p.y_ll}), 4326)`
        })
    
        const query = db.pgp.helpers.insert(tracks, cs, {
          table: 'track_p',
          schema: 'controle_campo'
        }) + ' RETURNING id'
    
        trackIds = await t.map(query, undefined, a => a.id)
      })

      await db.sapConn.none('REFRESH MATERIALIZED VIEW controle_campo.track_l');
      
      return trackIds
    }

// Funções de Controle Relaciomaneto Produto x Campo
// Função para obter todos os produtos de um campo
controller.getProdutosCampo = async () => {
    return db.sapConn.any(
        `SELECT p.id, p.nome as produto_nome, c.id, c.nome, l.nome as nome_lote
        FROM controle_campo.relacionamento_campo_produto AS rcp
        INNER JOIN controle_campo.campo AS c ON c.id = rcp.campo_id
        INNER JOIN macrocontrole.produto AS p ON p.id = rcp.produto_id
		INNER JOIN macrocontrole.lote as l ON l.id = p.lote_id`
    )
}

controller.getProdutosByCampoId = async (campo_id) => {
    return db.sapConn.any(
        `SELECT p.id, p.nome as produto_nome, c.id, c.nome, l.nome as nome_lote
        FROM controle_campo.relacionamento_campo_produto AS rcp
        INNER JOIN controle_campo.campo AS c ON c.id = rcp.campo_id
        INNER JOIN macrocontrole.produto AS p ON p.id = rcp.produto_id
		INNER JOIN macrocontrole.lote as l ON l.id = p.lote_id
        WHERE c.id = $<campo_id>`,
        { campo_id: campo_id }
    )
}

// Função para criar um relacionamento entre produtos e campos
controller.criaProdutosCampo = async (associacoes) => {
    try {
      return await db.sapConn.tx(async t => {
        const cs = new db.pgp.helpers.ColumnSet([
          'campo_id',
          'produto_id'
        ])
      
        const query = db.pgp.helpers.insert(associacoes, cs, {
          table: 'relacionamento_campo_produto',
          schema: 'controle_campo'
        }) + ' RETURNING id'
      
        const ids = await t.map(query, undefined, a => a.id)
        return { ids }
      });
    } catch (error) {
      // Código de erro para violação de restrição única no PostgreSQL é '23505'
      if (error.code === '23505') {
        // Extrair os valores do par duplicado (opcional)
        const match = error.detail.match(/\(campo_id, produto_id\)=\((.+)\)/);
        const duplicateValues = match ? match[1] : '';
        
        throw {
          message: 'Um ou mais produtos selecionados já estão associados a este campo.',
          detail: `Não foi possível criar associações duplicadas ${duplicateValues ? `para ${duplicateValues}` : ''}.`,
          code: 'DUPLICATE_ASSOCIATION'
        };
      }
      // Repassar outros erros
      throw error;
    }
  }

controller.deletaProdutoByCampoId = async (campo_id) => {
    return db.sapConn.tx(async t => {
        await t.none(
            `DELETE FROM controle_campo.relacionamento_campo_produto WHERE campo_id = $<campo_id>`,
            { campo_id: campo_id }
        )
    })
}

controller.getTrackMVT = async (z, x, y, campo_id, track_id) => {
    // Query base
    let query = `WITH
        bounds AS (
            SELECT ST_TileEnvelope($<z>, $<x>, $<y>) AS geom
        ),
        campo_tracks AS (
            SELECT tl.id, tl.track_id, tl.track_id_garmin, 
                tl.min_t, tl.max_t, tl.geom
            FROM controle_campo.track_l AS tl
            INNER JOIN controle_campo.track AS t ON tl.track_id = t.id
            WHERE t.campo_id = $<campo_id>`;
    
    // Adicionar filtro de track_id se especificado
    if (track_id) {
        query += ` AND tl.track_id = $<track_id>`;
    }
    
    // Completar a query
    query += `
            AND tl.geom && (SELECT geom FROM bounds)
        )
        SELECT ST_AsMVT(tile, 'track_layer', 4096, 'geom') AS mvt
        FROM (
            SELECT id, track_id, track_id_garmin,
                to_char(min_t, 'YYYY-MM-DD HH24:MI:SS') as min_time,
                to_char(max_t, 'YYYY-MM-DD HH24:MI:SS') as max_time,
                ST_AsMVTGeom(
                    geom,
                    (SELECT geom FROM bounds),
                    4096,
                    256,
                    true
                ) AS geom
            FROM campo_tracks
        ) AS tile`;
    
    // Parâmetros para a query
    const params = { 
        z: z, 
        x: x, 
        y: y,
        campo_id: campo_id
    };
    
    // Adicionar track_id aos parâmetros se especificado
    if (track_id) {
        params.track_id = track_id;
    }
    
    return db.sapConn.oneOrNone(query, params);
};

module.exports = controller