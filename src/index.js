'use strict';

const config = require("./config.json");
const app = require("./app");
const logger = require("./logger/logger");

//Starts server
app.listen(config.port, () => {
  logger.info("Server start", {
    context: "index",
    information: {
      port: config.port
    }
  });
});
