"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const gerenciaCtrl = require("./gerencia_ctrl");
const gerenciaSchema = require("./gerencia_schema");

const router = express.Router();

router.get(
  "/estilos",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getEstilos();

    const msg = "Estilos retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/regras",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getRegras();

    const msg = "Regras retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/modelos",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getModelos();

    const msg = "Modelos retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/menus",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getMenus();

    const msg = "Menus retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/estilos",
  schemaValidation({ body: gerenciaSchema.estilos }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaEstilos(req.body.estilos, req.body.usuarioId);

    const msg = "Estilos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/regras",
  schemaValidation({ body: gerenciaSchema.regras }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaRegras(req.body.regras, req.body.usuarioId);

    const msg = "Regras gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/menus",
  schemaValidation({ body: gerenciaSchema.menus }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaMenus(req.body.menus, req.body.usuarioId);

    const msg = "Menus gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/modelos",
  schemaValidation({ body: gerenciaSchema.qgisModels }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaModelos(req.body.modelos, req.body.usuarioId);

    const msg = "Modelos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/atividade/:id",
  schemaValidation({ params: gerenciaSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividade(
      req.params.id,
      req.body.usuarioId //gerenteId
    );

    const msg = dados ? "Atividade retornada" : "Atividade não encontrada";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/atividade/usuario/:id",
  schemaValidation({
    params: gerenciaSchema.idParams,
    query: gerenciaSchema.proximaQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividadeUsuario(
      req.params.id,
      req.query.proxima,
      req.body.usuarioId //gerenteId
    );

    const msg = "Banco de dados retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/banco_dados",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getBancoDados();

    const msg = dados
      ? "Atividade retornada"
      : "Atividade do usuário não encontrada";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/usuario",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getUsuario();

    const msg = "Usuários retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/perfil_producao",
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducao();

    const msg = "Perfis de produção retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/unidade_trabalho/disponivel",
  schemaValidation({ body: gerenciaSchema.unidadeTrabalhoDisponivel }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.unidadeTrabalhoDisponivel(
      req.body.unidade_trabalho_ids,
      req.body.disponivel
    );

    const msg =
      "Atributo disponível das unidades de trabalho atualizado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/pausar",
  schemaValidation({ body: gerenciaSchema.atividadePausar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.pausaAtividade(req.body.unidade_trabalho_ids);

    const msg = "Atividade pausada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/reiniciar",
  schemaValidation({ body: gerenciaSchema.atividadeReiniciar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.reiniciaAtividade(req.body.unidade_trabalho_ids);

    const msg = "Atividade reiniciada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/voltar",
  schemaValidation({ body: gerenciaSchema.atividadeVoltar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.voltaAtividade(
      req.body.atividade_ids,
      req.body.manter_usuarios
    );

    const msg = "Atividade voltou para etapa anterior com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/avancar",
  schemaValidation({ body: gerenciaSchema.atividadeAvancar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.avancaAtividade(
      req.body.atividade_ids,
      req.body.concluida
    );

    const msg = "Atividade avançou para próxima etapa com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/criar_revisao",
  schemaValidation({ body: gerenciaSchema.atividadeCriarRevisao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaRevisao(req.body.unidade_trabalho_ids);

    const msg = "Revisão criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/atividade/criar_revcorr",
  schemaValidation({ body: gerenciaSchema.atividadeCriarRevcorr }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaRevcorr(req.body.unidade_trabalho_ids);

    const msg = "Revisão/Correção criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/fila_prioritaria",
  schemaValidation({ body: gerenciaSchema.filaPrioritaria }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritaria(
      req.body.atividade_ids,
      req.body.usuario_prioridade_id,
      req.body.prioridade
    );

    const msg = "Fila prioritaria criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/fila_prioritaria_grupo",
  schemaValidation({ body: gerenciaSchema.filaPrioritariaGrupo }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritariaGrupo(
      req.body.atividade_ids,
      req.body.perfil_producao_id,
      req.body.prioridade
    );

    const msg = "Fila prioritaria grupo criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/observacao",
  schemaValidation({ body: gerenciaSchema.observacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaObservacao(
      req.body.atividade_ids,
      req.body.observacao_atividade,
      req.body.observacao_etapa,
      req.body.observacao_subfase,
      req.body.observacao_unidade_trabalho,
      req.body.lote
    );

    const msg = "Observação criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

module.exports = router;
