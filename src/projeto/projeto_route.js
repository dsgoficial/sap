"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyAdmin } = require("../login");

const projetoCtrl = require("./projeto_ctrl");
const projetoSchema = require("./projeto_schema");

const router = express.Router();

router.get(
  "/estilos",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstilos();

    const msg = "Estilos retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/regras",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getRegras();

    const msg = "Regras retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/modelos",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getModelos();

    const msg = "Modelos retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/menus",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getMenus();

    const msg = "Menus retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/estilos",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaEstilos(req.body.estilos, req.body.usuarioId);

    const msg = "Estilos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/regras",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regras }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaRegras(req.body.regras, req.body.usuarioId);

    const msg = "Regras gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/menus",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menus }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaMenus(req.body.menus, req.body.usuarioId);

    const msg = "Menus gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/modelos",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaModelos(req.body.modelos, req.body.usuarioId);

    const msg = "Modelos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/projeto_qgis",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getProject();

    const msg = "Projeto do QGIS retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/usuarios",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.usuarios }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaUsuarios(req.body.usuarios);

    const msg = "Usuários criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/banco_dados",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getBancoDados();

    const msg = "Banco de dados retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/usuarios",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getUsuarios();

    const msg = "Usuários retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/criar_revisao",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atividadeCriarRevisao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaRevisao(req.body.unidade_trabalho_ids);

    const msg = "Revisão criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/atividade/criar_revcorr",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atividadeCriarRevcorr }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaRevcorr(req.body.unidade_trabalho_ids);

    const msg = "Revisão/Correção criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/lote",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLotes();

    const msg = "Lotes retornados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.put(
  "/unidade_trabalho/lote",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoLote }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.unidadeTrabalhoLote(
      req.body.unidade_trabalho_ids,
      req.body.lote
    );

    const msg = "Lote das unidades de trabalho atualizado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

module.exports = router;
