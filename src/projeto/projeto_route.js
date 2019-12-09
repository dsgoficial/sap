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
      req.body.lote_id
    );

    const msg = "Lote das unidades de trabalho atualizado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/atividades/deletar",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.listaAtividades }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividades(req.body.atividades_ids);

    const msg = "Atividades pausadas ou não iniciadas deletadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/atividades/criar",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoEtapa }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaAtividades(
      req.body.unidade_trabalho_ids,
      req.body.etapa_id
    );

    const msg = "Atividades criadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.get(
  "/projetos",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getProjetos();

    const msg = "Projetos retornados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/linhas_producao",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLinhasProducao();

    const msg = "Linhas de produção retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/fases",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getFases();

    const msg = "Fases retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/subfases",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getSubfases();

    const msg = "Subfases retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/etapas",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEtapas();

    const msg = "Etapas retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/configuracao/gerenciador_fme",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGerenciadorFME();

    const msg =
      "Informações dos serviços do Gerenciador do FME retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/configuracao/gerenciador_fme",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.gerenciadorFME }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaGerenciadorFME(req.body.servidor, req.body.porta);

    const msg =
      "Informações dos serviços do Gerenciador do FME inseridas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

module.exports = router;
