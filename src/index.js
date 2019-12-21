// Validates Node Version then starts the main code
var version = process.versions.node.split('.')
var major = +version[0]
var minor = +version[1]

if (major < 8 || (major === 8 && minor < 7)) {
  throw new Error('Versão mínima do Node.js suportada pelo serviço é 8.7')
}

module.exports = require('./main')
