"use strict";

const dotenv = require("dotenv");

dotenv.config({
  path: process.env.NODE_ENV === "test" ? "config_testing.env" : "config.env"
});

const VERSION = "2.0.0";

module.exports = {
  PORT: process.env.PORT,
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  VERSION: VERSION
};
