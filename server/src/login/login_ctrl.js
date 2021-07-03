'use strict'

const jwt = require('jsonwebtoken')
const semver = require('semver')

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { JWT_SECRET } = require('../config')

const { authenticateUser } = require('../authentication')

const controller = {}

const verificaQGIS = async (qgis) => {
  const qgisMinimo = await db.sapConn.oneOrNone(
    'SELECT versao_minima FROM dgeo.versao_qgis LIMIT 1'
  )
  if (!qgisMinimo) {
    return
  }
  const qgisVersionOk =
    qgis &&
    semver.gte(semver.coerce(qgis), semver.coerce(qgisMinimo.versao_minima))

  if (!qgisVersionOk) {
    const msg = `Versão incorreta do QGIS. A seguinte versão é necessária: ${qgisMinimo.versao_minima}`
    throw new AppError(msg, httpCode.BadRequest)
  }
}

const verificaPlugins = async (plugins) => {
  const pluginsMinimos = await db.sapConn.any(
    'SELECT nome, versao_minima FROM dgeo.plugin'
  )
  if (!pluginsMinimos) {
    return
  }

  for (let i = 0; i < pluginsMinimos.length; i++) {
    let notFound = true
    if (plugins) {
      plugins.forEach((p) => {
        if (
          p.nome === pluginsMinimos[i].nome &&
          semver.gte(
            semver.coerce(p.versao),
            semver.coerce(pluginsMinimos[i].versao_minima)
          )
        ) {
          notFound = false
        }
      })
    }
    if (notFound) {
      const listplugins = []

      pluginsMinimos.forEach((pm) => {
        listplugins.push(pm.nome + '-' + pm.versao_minima)
      })

      const msg = `Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: ${listplugins.join(
        ', '
      )}`
      throw new AppError(msg, httpCode.BadRequest)
    }
  }
}

const gravaLogin = async (usuarioId) => {
  return db.sapConn.any(
    `
      INSERT INTO acompanhamento.login(usuario_id, data_login) VALUES($<usuarioId>, now())
      `,
    { usuarioId }
  )
}

const signJWT = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      secret,
      {
        expiresIn: '10h'
      },
      (err, token) => {
        if (err) {
          reject(new AppError('Erro durante a assinatura do token', null, err))
        }
        resolve(token)
      }
    )
  })
}

controller.login = async (usuario, senha, aplicacao, plugins, qgis) => {
  const usuarioDb = await db.sapConn.oneOrNone(
    'SELECT id, uuid, administrador FROM dgeo.usuario WHERE login = $<usuario> and ativo IS TRUE',
    { usuario }
  )
  if (!usuarioDb) {
    throw new AppError(
      'Usuário não autorizado para utilizar o SAP',
      httpCode.BadRequest
    )
  }

  const verifyAuthentication = await authenticateUser(
    usuario,
    senha,
    aplicacao
  )
  if (!verifyAuthentication) {
    throw new AppError('Usuário ou senha inválida', httpCode.BadRequest)
  }

  if (aplicacao === 'sap_fp' || aplicacao === 'sap_fg') {
    await verificaQGIS(qgis)

    await verificaPlugins(plugins)
  }
  const { id, administrador, uuid } = usuarioDb

  const token = await signJWT({ id, uuid, administrador }, JWT_SECRET)

  await gravaLogin(id)

  return { token, administrador, uuid }
}

module.exports = controller
