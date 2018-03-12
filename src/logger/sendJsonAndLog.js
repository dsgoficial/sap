const logger = require("../logger/logger");

const sendJsonAndLog = (sucess,  message,  context,  information,  res,  status = 200,  dados = null) => {
  logger.info(message, {
    context: context,
    information: information,
    status: status
  });
  let jsonData;

  if (dados) {
    jsonData = {
      sucess: sucess,
      message: message,
      dados: dados
    };
  } else {
    jsonData = {
      sucess: sucess,
      message: message
    };
  }
  return res.status(status).json(jsonData);
};

module.exports = sendJsonAndLog;