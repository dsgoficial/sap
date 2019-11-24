"use strict";

module.exports = {
  db: require("./main_db"),
  testDb: require("./test_db"),
  databaseVersion: require("./database_version"),
  createPS: require("./create_ps"),
  temporaryLogin: require("./temporary_login")
};
