"use strict";

require("dotenv").config()
 
const app = require("./app");
const { logger } = require("./logger");

//Starts server
app.listen(process.env.PORT, () => {
  logger.info("Server start", {
    context: "index",
    information: {
      port: process.env.PORT
    }
  });
});
