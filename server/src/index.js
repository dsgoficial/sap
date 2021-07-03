// Validates Node Version then starts the main code
var version = process.versions.node.split('.')
var major = +version[0]
var minor = +version[1]

if (major < 14 || (major === 14 && minor < 15)) {
  throw new Error('Versão mínima do Node.js suportada pelo Serviço é 14.15')
}

module.exports = require('./main')
