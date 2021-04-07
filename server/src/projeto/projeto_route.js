"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyAdmin } = require("../login");

const projetoCtrl = require("./projeto_ctrl");
const projetoSchema = require("./projeto_schema");

const router = express.Router();

router.get(
  "/nome_estilos",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getNomeEstilos();

    const msg = "Estilos retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);


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
    await projetoCtrl.gravaEstilos(req.body.estilos, req.usuarioId);

    const msg = "Estilos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/regras",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regras }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaRegras(
      req.body.regras,
      req.body.grupo_regras,
      req.usuarioId
    );

    const msg = "Regras gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/menus",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menus }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaMenus(req.body.menus, req.usuarioId);

    const msg = "Menus gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/modelos",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaModelos(req.body.modelos, req.usuarioId);

    const msg = "Modelos gravados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/modelos",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atualizaQgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaModelos(req.body.modelos, req.usuarioId);

    const msg = "Modelos atualizados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.delete(
  "/modelos",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModelsIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaModelos(req.body.modelos_ids);

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
  "/dado_producao",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getDadoProducao();

    const msg = "Dados de producão retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/login",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLogin();

    const msg = "Dados de login retornados";

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

router.delete(
  "/atividades",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.listaAtividades }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividades(req.body.atividades_ids);

    const msg = "Atividades pausadas ou não iniciadas deletadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/atividades",
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
    await projetoCtrl.criaGerenciadorFME(req.body.gerenciador_fme);

    const msg =
      "Informações dos serviços do Gerenciador do FME inseridas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/gerenciador_fme",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEUpdate
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGerenciadorFME(req.body.gerenciador_fme);

    const msg =
      "Informações dos serviços do Gerenciador do FME atualizadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.delete(
  "/configuracao/gerenciador_fme",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGerenciadorFME(req.body.servidores_id);

    const msg =
      "Informações dos serviços do Gerenciador do FME deletadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/configuracao/camadas",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getCamadas();

    const msg = "Camadas retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/configuracao/camadas",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deleteCamadas(req.body.camadas_ids);

    const msg = "Camada deletada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/configuracao/camadas",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadas
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaCamadas(req.body.camadas);

    const msg = "Camadas criadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/camadas",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaCamadas(req.body.camadas);

    const msg = "Camadas atualizadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.get(
  "/configuracao/perfil_fme",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilFME();

    const msg = "Perfil FME retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/configuracao/perfil_fme",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilFME(req.body.perfil_fme_ids);

    const msg = "Perfil FME deletado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/configuracao/perfil_fme",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisFME
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilFME(req.body.perfis_fme);

    const msg = "Perfis FME criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/perfil_fme",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilFME(req.body.perfis_fme);

    const msg = "Perfis FME atualizados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);


router.get(
  "/configuracao/perfil_modelo",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilModelo();

    const msg = "Perfil Modelo QGIS retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/configuracao/perfil_modelo",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilModelo(req.body.perfil_modelo_ids);

    const msg = "Perfil Modelo QGIS deletado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/configuracao/perfil_modelo",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisModelo
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilModelo(req.body.perfis_modelo);

    const msg = "Perfis Modelo QGIS criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/perfil_modelo",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilModelo(req.body.perfis_modelo);

    const msg = "Perfis Modelo QGIS atualizados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);



router.get(
  "/configuracao/perfil_regras",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilRegras();

    const msg = "Perfil de Regras retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/configuracao/perfil_regras",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilRegras(req.body.perfil_regras_ids);

    const msg = "Perfil de Regras deletado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/configuracao/perfil_regras",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegras
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilRegras(req.body.perfis_regras);

    const msg = "Perfis de Regras criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/perfil_regras",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrastualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilRegras(req.body.perfis_regras);

    const msg = "Perfisde de Regras atualizados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);


router.get(
  "/configuracao/perfil_estilos",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilEstilos();

    const msg = "Perfil de Estilos retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/configuracao/perfil_estilos",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilosIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilEstilos(req.body.perfil_estilos_ids);

    const msg = "Perfil de Estilos deletado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/configuracao/perfil_estilos",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilEstilos(req.body.perfis_estilos);

    const msg = "Perfis de Estilos criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/configuracao/perfil_estilos",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilostualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilEstilos(req.body.perfis_estilos);

    const msg = "Perfisde de Estilos atualizados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);



router.delete(
  "/insumos",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.deletaInsumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaInsumosAssociados(
      req.body.unidade_trabalho_ids,
      req.body.grupo_insumo_id
    );

    const msg = "Insumos associados deletados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.get(
  "/grupo_insumo",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGrupoInsumo();

    const msg = "Grupos de insumos retornados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.delete(
  "/unidade_trabalho",
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaUnidadeTrabalho(req.body.unidade_trabalho_ids);

    const msg = "Unidade de trabalho deletadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.delete(
  "/revisao/:id",
  verifyAdmin,
  schemaValidation({
    params: projetoSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaRevisao(req.params.id);

    const msg = "Revisão e correção deletadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.get(
  "/estrategia_associacao",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstrategiaAssociacao();

    const msg = "Estratégias retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/unidade_trabalho/insumos",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.associaInsumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.associaInsumos(
      req.body.unidade_trabalho_ids,
      req.body.grupo_insumo_id,
      req.body.estrategia_id,
      req.body.caminho_padrao
    );

    const msg = "Produtos criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/unidade_trabalho/copiar",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadeTrabalhoCopiar
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.copiarUnidadeTrabalho(
      req.body.unidade_trabalho_ids,
      req.body.etapa_ids,
      req.body.associar_insumos
    );

    const msg = "Unidades de trabalho copiadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/unidade_trabalho",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadesTrabalho
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaUnidadeTrabalho(
      req.body.unidades_trabalho,
      req.body.subfase_id
    );

    const msg = "Unidades de trabalho criadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.post(
  "/produto",
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.produtos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaProdutos(
      req.body.produtos,
      req.body.linha_producao_id
    );

    const msg = "Produtos criados com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

module.exports = router;
