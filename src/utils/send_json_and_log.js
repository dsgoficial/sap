
const logger = require("./utils");

const { VERSION } = require('./config');

const sendJsonAndLog = (
  sucess,
  message,
  context,
  information,
  res,
  status = 200,
  dados = null
) => {
  logger.info(message, {
    context: context,
    information: information,
    status: status
  });
  let jsonData = {
    version: VERSION,
    sucess: sucess,
    message: message
  };

  if (dados) {
    jsonData.dados = dados
  }

  return res.status(status).json(jsonData);
};

module.exports = sendJsonAndLog;
