'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const projetoCtrl = require('./projeto_ctrl')
const projetoSchema = require('./projeto_schema')

const router = express.Router()

router.get(
  '/tipo_produto',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoProduto()

    const msg = 'Tipos de produto retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_rotina',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoRotina()

    const msg = 'Tipos de rotina retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_criacao_unidade_trabalho',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoCriacaoUnidadeTrabalho()

    const msg = 'Tipos de criação de unidade de trabalho retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_controle_qualidade',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoCQ()

    const msg = 'Tipos de controle de qualidade retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_fase',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoFase()

    const msg = 'Tipos de fase retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_pre_requisito',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoPreRequisito()

    const msg = 'Tipos de pre requisito retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_etapa',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoEtapa()

    const msg = 'Tipos de etapa retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_exibicao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoExibicao()

    const msg = 'Tipos de exibição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_restricao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoRestricao()

    const msg = 'Tipos de restrição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)



router.get(
  '/tipo_insumo',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoInsumo()

    const msg = 'Tipos de insumo retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_dado_producao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoDadoProducao()

    const msg = 'Tipos de dado de produção retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/grupo_estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGrupoEstilos()

    const msg = 'Grupo de estilos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGrupoEstilos(req.body.grupo_estilos_ids)

    const msg = 'Grupo de estilos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/regras',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getRegras()

    const msg = 'Regras retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regras }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaRegras(
      req.body.regras,
      req.usuarioId
    )

    const msg = 'Regras gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regrasAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaRegras(req.body.regras, req.usuarioId)

    const msg = 'Regras atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regrasIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaRegras(req.body.regras_ids)

    const msg = 'Regras deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/menus',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getMenus()

    const msg = 'Menus retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menus }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaMenus(req.body.menus, req.usuarioId)

    const msg = 'Menus gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menusAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaMenus(req.body.menus, req.usuarioId)

    const msg = 'Menus atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menusIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaMenus(req.body.menus_ids)

    const msg = 'Menus deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstilos()

    const msg = 'Estilos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaEstilos(req.body.estilos, req.usuarioId)

    const msg = 'Estilos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaEstilos(req.body.estilos, req.usuarioId)

    const msg = 'Estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaEstilos(req.body.estilos_ids)

    const msg = 'Estilos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/modelos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getModelos()

    const msg = 'Modelos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaModelos(req.body.modelos, req.usuarioId)

    const msg = 'Modelos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atualizaQgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaModelos(req.body.modelos, req.usuarioId)

    const msg = 'Modelos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModelsIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaModelos(req.body.modelos_ids)

    const msg = 'Modelos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/dado_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getDadoProducao()

    const msg = 'Dados de producão retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/banco_dados',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getDatabase()

    const msg = 'Banco de dados retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/login',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLogin()

    const msg = 'Dados de login retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/bloco',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getBlocos()

    const msg = 'Blocos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/unidade_trabalho/bloco',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoBloco }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.unidadeTrabalhoBloco(
      req.body.unidade_trabalho_ids,
      req.body.bloco_id
    )

    const msg = 'Bloco das unidades de trabalho atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.listaAtividades }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividades(req.body.atividades_ids)

    const msg = 'Atividades não iniciadas deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/unidade_trabalho/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividadesUnidadeTrabalho(req.body.unidade_trabalho_ids)

    const msg = 'Atividades não iniciadas relacionadas a unidade de trabalho deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoEtapa }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaAtividades(
      req.body.unidade_trabalho_ids,
      req.body.etapa_id
    )

    const msg = 'Atividades criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/projetos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getProjetos()

    const msg = 'Projetos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/linha_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLinhasProducao()

    const msg = 'Linhas de produção retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/fases',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getFases()

    const msg = 'Fases retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/subfases',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getSubfases()

    const msg = 'Subfases retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/etapas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEtapas()

    const msg = 'Etapas retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGerenciadorFME()

    const msg =
      'Informações dos serviços do Gerenciador do FME retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.gerenciadorFME }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaGerenciadorFME(req.body.gerenciador_fme)

    const msg =
      'Informações dos serviços do Gerenciador do FME inseridas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEUpdate
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGerenciadorFME(req.body.gerenciador_fme)

    const msg =
      'Informações dos serviços do Gerenciador do FME atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGerenciadorFME(req.body.servidores_id)

    const msg =
      'Informações dos serviços do Gerenciador do FME deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/configuracao/camadas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getCamadas()

    const msg = 'Camadas retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deleteCamadas(req.body.camadas_ids)

    const msg = 'Camada deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadas
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaCamadas(req.body.camadas)

    const msg = 'Camadas criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaCamadas(req.body.camadas)

    const msg = 'Camadas atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/configuracao/perfil_fme',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilFME()

    const msg = 'Perfil FME retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilFME(req.body.perfil_fme_ids)

    const msg = 'Perfil FME deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisFME
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilFME(req.body.perfis_fme)

    const msg = 'Perfis FME criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilFME(req.body.perfis_fme)

    const msg = 'Perfis FME atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)


router.get(
  '/configuracao/perfil_menu',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilMenu()

    const msg = 'Perfil Menu QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilMenuIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilMenu(req.body.perfil_menu_ids)

    const msg = 'Perfil Menu QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisMenu
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilMenu(req.body.perfis_menu)

    const msg = 'Perfis Menu QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilMenuAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilMenu(req.body.perfis_menu)

    const msg = 'Perfis Menu QGIS atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)


router.get(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilModelo()

    const msg = 'Perfil Modelo QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilModelo(req.body.perfil_modelo_ids)

    const msg = 'Perfil Modelo QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisModelo
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilModelo(req.body.perfis_modelo)

    const msg = 'Perfis Modelo QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilModelo(req.body.perfis_modelo)

    const msg = 'Perfis Modelo QGIS atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/configuracao/perfil_regras',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilRegras()

    const msg = 'Perfil de Regras retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilRegras(req.body.perfil_regras_ids)

    const msg = 'Perfil de Regras deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegras
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilRegras(req.body.perfis_regras)

    const msg = 'Perfis de Regras criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrastualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilRegras(req.body.perfis_regras)

    const msg = 'Perfisde de Regras atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilEstilos()

    const msg = 'Perfil de Estilos retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilosIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilEstilos(req.body.perfil_estilos_ids)

    const msg = 'Perfil de Estilos deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilEstilos(req.body.perfis_estilos)

    const msg = 'Perfis de Estilos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilostualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilEstilos(req.body.perfis_estilos)

    const msg = 'Perfis de Estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/unidade_trabalho/insumos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.deletaInsumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaInsumosAssociados(
      req.body.unidade_trabalho_ids,
      req.body.grupo_insumo_id
    )

    const msg = 'Insumos associados deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/grupo_insumo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGrupoInsumo()

    const msg = 'Grupos de insumos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)



router.put(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.grupoInsumoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGrupoInsumo(req.body.grupo_insumos)

    const msg = 'Grupos de insumos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.grupoInsumo
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaGrupoInsumo(req.body.grupo_insumos)

    const msg = 'Grupos de insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoInsumoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGrupoInsumo(req.body.grupo_insumo_ids)

    const msg = 'Grupos de insumos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/unidade_trabalho',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaUnidadeTrabalho(req.body.unidade_trabalho_ids)

    const msg = 'Unidade de trabalho deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/tipo_estrategia_associacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstrategiaAssociacao()

    const msg = 'Estratégias retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/unidade_trabalho/insumos',
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
    )

    const msg = 'Insumos associados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/unidade_trabalho/copiar',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadeTrabalhoCopiar
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.copiarUnidadeTrabalho(
      req.body.unidade_trabalho_ids,
      req.body.etapa_ids,
      req.body.associar_insumos
    )

    const msg = 'Unidades de trabalho copiadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/unidade_trabalho',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadesTrabalho
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaUnidadeTrabalho(
      req.body.unidades_trabalho,
      req.body.lote_id,
      req.body.subfase_id
    )

    const msg = 'Unidades de trabalho criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.insumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaInsumos(
      req.body.insumos,
      req.body.tipo_insumo,
      req.body.grupo_insumo,
    )

    const msg = 'Insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/produto',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.produtos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaProdutos(
      req.body.produtos,
      req.body.lote_id
    )

    const msg = 'Produtos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/atalhos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getAtalhos()

    const msg = 'Atalhos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atalhos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaAtalhos(req.body.atalhos, req.usuarioId)

    const msg = 'Atalhos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atalhosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaAtalhos(req.body.atalhos, req.usuarioId)

    const msg = 'Atalhos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atalhosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtalhos(req.body.atalhos_ids)

    const msg = 'Atalhos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/versao_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getVersaoQgis()

    const msg = 'Versão QGIS retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/versao_qgis',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaVersaoQgis(req.body.versao_qgis)

    const msg = 'Versão QGIS atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/plugins',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPlugins()

    const msg = 'Plugins retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.plugins }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaPlugins(req.body.plugins)

    const msg = 'Plugins gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.pluginsAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPlugins(req.body.plugins)

    const msg = 'Plugins atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.pluginsIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaPlugins(req.body.plugins_ids)

    const msg = 'Plugins deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/lote',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLote()

    const msg = 'Lotes retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
