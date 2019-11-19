var version = process.versions.node.split(".");

if (version[0] < 8 || (version[0] === 8 && version[1] < 7)) {
  throw new Error("Versão mínima do Node.js suportada pelo SAP é 8.7");
}

module.exports = require("./main");
