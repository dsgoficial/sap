'use strict'

// RPCMTec (seção produção/pessoal do SAP). Rotas admin-only, mesmo padrão do
// SCO/SCA: preview em JSON e export DOCX (download binário).

const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin } = require('../login')
const relatorioCtrl = require('./relatorio_ctrl')
const relatorioSchema = require('./relatorio_schema')

const router = express.Router()

router.use(verifyAdmin)

// Export DOCX (antes da rota de preview para o sufixo /docx não ser capturado).
router.get(
  '/rpcmtec/:ano/:mes/docx',
  schemaValidation({ params: relatorioSchema.anoMesParams }),
  asyncHandler(async (req, res, next) => {
    const { ano, mes } = req.params
    const buffer = await relatorioCtrl.gerarRelatorioSapDocx({ ano, mes })
    const nome = `RPCMTec-sap-${ano}-${String(mes).padStart(2, '0')}.docx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${nome}"`)
    return res.send(buffer)
  })
)

// Preview em tela (mesmos dados do DOCX, no envelope JSON padrão).
router.get(
  '/rpcmtec/:ano/:mes',
  schemaValidation({ params: relatorioSchema.anoMesParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await relatorioCtrl.gerarRelatorioSap({ ano: req.params.ano, mes: req.params.mes })
    return res.sendJsonAndLog(true, 'RPCMTec (seção produção/pessoal) gerado com sucesso', httpCode.OK, dados)
  })
)

module.exports = router
