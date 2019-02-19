"use strict";

const express = require("express");

const path = require("path");

const { renderAndLog } = require("../logger");

const metadadosCtrl = require("./metadados_ctrl");

const router = express.Router();

const nunjucks = require("nunjucks");
/**app.set(
  "templates",
  path.join(__dirname, "src", "gerador_metadados", "templates")
);
nunjucks.configure(
  path.join(__dirname, "src", "gerador_metadados", "templates"),
  {
    autoescape: true,
    express: app
  }
);**/

/**
 * @api {get} /metadados/:uuid Retorna metadado de um produto identificado pelo UUID
 * @apiGroup Metadados
 * @apiVersion 1.0.0
 * @apiName GeraMetadado
 * @apiPermission operador
 *
 *
 * @apiDescription Gera os metadados de um determinado produto
 *
 *
 * @apiSuccess {String} Retorna os metadados gerados no formato XML.
 *
 *
 */

router.get("/:uuid", async (req, res, next) => {
  let { erro, template, dados } = await metadadosCtrl.geraMetadado(
    req.params.uuid
  );
  if (erro) {
    return next(erro);
  }

  let information = {
    produto_uuid: req.params.uuid
  };

  return renderAndLog(
    "Metadado retornado.",
    "metadados_route",
    information,
    res,
    200,
    template,
    dados
  );
});

module.exports = router;
