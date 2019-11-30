"use strict";

const db = require("./main_db");

const testeDBs = {};

const testdb = async (usuario, senha, server, port, dbname) => {
  const con = `postgres://${usuario}:${senha}@${server}:${port}/${dbname}`;
  if (!(con in testeDBs)) {
    testeDBs[con] = db.pgp(con);
  }

  let result;

  await testeDBs[con]
    .connect()
    .then(function(obj) {
      obj.done(); // success, release connection;
      result = true;
    })
    .catch(function(error) {
      result = false;
    });
  return result;
};

module.exports = testdb;
