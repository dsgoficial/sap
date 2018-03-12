const config = require("./config.json");
const app = require("./app");
const logger = require("./logger/logger");

//Starts server
logger.info("Server start", {
  context: "index",
  port: config.port
});
app.listen(config.port, () =>
  console.log(`Listening on port ${config.port}`)
);
