const Joi = require('joi')

const finaliza = Joi.object().keys({
  subfase_etapa_id: Joi.number().integer().strict().required(),
  unidade_trabalho_id: Joi.number().integer().strict().required()
})

module.exports.finaliza = finaliza
