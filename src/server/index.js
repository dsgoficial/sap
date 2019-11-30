"use strict";

module.exports = {
  app: require("./app"),
  cluster: require("./cluster"),
  routes: require("./routes"),
  startServer: require("./start_server"),
  swaggerOptions: require("./swagger_options"),
  createDocumentation: require("./create_documentation")
};
