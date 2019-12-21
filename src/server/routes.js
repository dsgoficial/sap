'use strict'

const { loginRoute } = require('../login')
const { producaoRoute } = require('../producao')
const { microcontroleRoute } = require('../microcontrole')
const { gerenciaRoute } = require('../gerencia')
const { projetoRoute } = require('../projeto')
const { acompanhamentoRoute } = require('../acompanhamento')
const { metadadosRoute } = require('../metadados')

const routes = app => {
  app.use('/login', loginRoute)

  app.use('/distribuicao', producaoRoute)

  app.use('/microcontrole', microcontroleRoute)

  app.use('/gerencia', gerenciaRoute)

  app.use('/projeto', projetoRoute)

  app.use('/acompanhamento', acompanhamentoRoute)

  app.use('/metadados', metadadosRoute)
}
module.exports = routes
