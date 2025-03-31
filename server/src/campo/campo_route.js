// Carregar dependências externas
'use strict'
const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin, verifyLogin } = require('../login')
const campoCtrl = require('./campo_ctrl')
const campoSchema = require('./campo_schema')
const router = express.Router()

// Rotas genéricas
router.get(
  '/situacao',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getSituacao()

    const msg = 'Situações retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/categoria',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCategorias()

    const msg = 'Categorias retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/produtos/:lote_id',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getProdutosByLot(req.params.lote_id)

    const msg = 'Produtos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

// Rotas de campo
router.get(
  '/campos',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCampos()

    const msg = 'Campos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/campos-geojson',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCamposGeoJson()

    const msg = 'Campos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.get(
  '/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCampoById(req.params.uuid)

    const msg = 'Dados do campo retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/campos',
  verifyAdmin,
  schemaValidation({ body: campoSchema.campo }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.criaCampo(req.body.campo)

    const msg = 'Campo criado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/campos/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.campo }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.atualizaCampo(req.params.uuid, req.body.campo)

    const msg = 'Campo atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/campos/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaCampo(req.params.uuid)

    const msg = 'Campo deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/campos/estatisticas',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getEstatisticasCampos()

    const msg = 'Estatísticas de campos retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

// Rotas de fotos
router.get(
  '/fotos',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getFotos()

    const msg = 'Fotos retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/fotos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getFotoById(req.params.uuid)

    const msg = 'Foto retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)


router.get(
  '/fotos/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getFotosByCampo(req.params.uuid)

    const msg = 'Fotos retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/fotos',
  verifyAdmin,
  schemaValidation({ body: campoSchema.fotos }),
  asyncHandler(async (req, res, next) => {
      await campoCtrl.criaFotos(req.body.fotos)

      const msg = 'Fotos criadas com sucesso'

      return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.put(
  '/fotos/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.fotoUpdate }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.atualizaFoto(req.params.uuid, req.body.foto)

    const msg = 'Foto atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/fotos/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaFotos(req.params.uuid)

    const msg = 'Foto deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
);

router.delete(
  '/fotos/:campo_id',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaFotosByCampo(req.params.uuid)

    const msg = 'Fotos deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
);

// Rotas de track
router.get(
  '/tracks',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getTracks()

    const msg = 'Tracks retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tracks/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getTrackById(req.params.uuid)

    const msg = 'Track retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tracks/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getTracksByCampo(req.params.uuid)

    const msg = 'Tracks retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/tracks',
  verifyAdmin,
  schemaValidation({ body: campoSchema.track }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.criaTracker(req.body.track)

    const msg = 'Track criado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/tracks/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.trackUpdate }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.atualizaTrack(req.params.uuid, req.body.track)

    const msg = 'Track atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/tracks/:uuid',
  verifyAdmin,
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deleteTracker(req.params.uuid)

    const msg = 'Track deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

// Rotas de Tracks Ponto
router.post(
  '/tracks_ponto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const trackIds = await campoCtrl.criaTrackerPonto(req.body)

    const msg = 'Tracks de ponto inseridos com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, { ids: trackIds })
  })
)

// Rotas de Relacionamento Produto/Campo
router.get(
  '/produtos_campo',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getProdutosCampo()
    const msg = 'Associações entre produtos e campo retornadas com sucesso'
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/produtos_campo/:campo_id',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getProdutosByCampoId(req.params.campo_id)
    const msg = 'Campos Associados Retornados com sucesso'
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/produtos_campo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.criaProdutosCampo(req.body.associacoes)
    const msg = 'Associações entre produtos e campo criadas com sucesso'
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/produtos_campo/:campo_id',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.deletaProdutoByCampoId(req.params.campo_id)
    const msg = 'Produtos associados a campo deletados com sucesso'
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tracks/:campo_id/tracks/mvt/:z/:x/:y.mvt', async (req, res) => {
  try {
      const { z, x, y, campo_id } = req.params;
      const { trackId } = req.query; // Obtém o trackId do query parameter
      
      // Verificar se os parâmetros são válidos
      if (!z || !x || !y || !campo_id) {
          return res.status(400).json({ message: 'Parâmetros incompletos' });
      }
      
      const tile = await campoCtrl.getTrackMVT(
          parseInt(z, 10), 
          parseInt(x, 10), 
          parseInt(y, 10), 
          campo_id,
          trackId // Passa o trackId para o controller (pode ser undefined)
      );
      
      if (!tile || !tile.mvt) {
          // Retornar um MVT vazio em vez de 404 para compatibilidade com clientes de mapa
          res.setHeader('Content-Type', 'application/x-protobuf');
          return res.send(Buffer.from(''));
      }
      
      // Configurar os headers apropriados para MVT
      res.setHeader('Content-Type', 'application/x-protobuf');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // Enviar o buffer do MVT
      res.send(Buffer.from(tile.mvt, 'binary'));
  } catch (error) {
      console.error('Erro ao gerar MVT:', error);
      res.status(500).json({ message: 'Erro ao processar o tile' });
  }
});

module.exports = router