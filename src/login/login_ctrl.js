const db = require("../utils/database_connection");
const controller = {};


var settings = require("../config.json");
var promise = require("bluebird");
var options = {
  promiseLib: promise
};
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var jwtSecret = settings.secret;

var pgp = require("pg-promise")(options);
var dbSdt = pgp(settings.connectionStringSdt);
var dbControle = pgp(settings.connectionStringControle);
var dbAcervo = pgp(settings.connectionStringAcervo);

//  login no sistema
//  expects {login: String, senha: String}
controller.login = async (usuario, senha) => {
  var sdtData;
  var controleData;
  dbSdt
    .oneOrNone(
      "SELECT u.id, u.nome_guerra, u.senha, u.login, p.nome_abrev AS posto_grad_nome" +
        " FROM usuario AS u INNER JOIN posto_grad AS p ON p.id = u.posto_grad_id WHERE login = $1",
      [body.login]
    )
    .then(function(data) {
      sdtData = data;
      if (sdtData) {
        return dbControle
          .oneOrNone(
            "SELECT t.id AS perfil_id, t.nome AS perfil_nome FROM usuario_perfil AS u INNER JOIN tipo_perfil AS t ON t.id = u.tipo_perfil_id WHERE u.usuario_id = $1",
            [sdtData.id]
          )
          .then(function(data) {
            controleData = data;
            var usuario = {
              id: sdtData.id,
              login: sdtData.login,
              nomeGuerra: sdtData.nome_guerra,
              postoGrad: {
                nome: sdtData.posto_grad_nome
              },
              perfil: {
                id: controleData.perfil_id,
                nome: controleData.perfil_nome
              }
            };

            bcrypt.compare(body.senha, sdtData.senha, function(err, match) {
              if (match) {
                var token = jwt.sign(usuario, jwtSecret, {
                  expiresIn: "24h" // expires in 24 hours
                });
                return res.status(200).json({
                  sucess: true,
                  response: "OK",
                  token: token
                });
              } else {
                return res.status(401).json({
                  sucess: false,
                  response: "Erro"
                });
              }
            });
          });
      } else {
        return res.status(401).json({
          sucess: false,
          response: "Erro"
        });
      }
    })
    .catch(function(err) {
      return next(err);
    });
}


module.exports = controller;
