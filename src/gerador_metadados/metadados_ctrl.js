"use strict";

const { db } = require("../database");

const controller = {};

const xmlTemplate = {};

xmlTemplate["1"] = "template_carta_topo_vetorial.xml";
xmlTemplate["2"] = "template_carta_topo_matricial.xml";
xmlTemplate["3"] = "template_carta_ortoimagem.xml";
xmlTemplate["4"] = "template_ortoimagem.xml";
xmlTemplate["5"] = "template_mds.xml";
xmlTemplate["6"] = "template_mdt.xml";
xmlTemplate["7"] = "template_carta_tematica.xml";

controller.geraMetadado = async uuid => {
  
  const produto = await db.oneOrNone(
    `SELECT p.nome, p.mi, p.inom, p.escala, p.geometry, lp.tipo_produto_id,
    proj.nome AS projeto, ip.resumo, ip.proposito, ip.creditos, ip.informacoes_complementares,
    ip.limitacao_acesso_id, ip.restricao_uso_id, ip.grau_sigilo_id, ip.organizacao_responsavel_id,
    ip.organizacao_distribuicao_id, ip.datum_vertical_id, ip.especificacao_id, ip.declaracao_linhagem
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = p.linha_producao_id
    INNER JOIN macrocontrole.projeto AS proj ON lp.projeto_id = proj.id
    INNER JOIN metadado.informacoes_produto AS ip ON ip.linha_producao_id = lp.id
    WHERE p.uuid = $1`,
    [uuid]
  );
  //descobrir se o produto existe
  if(!produto){
    //throw error
  }
  const producao = await db.any(
    `SELECT ut.fase_id,
    (CASE WHEN min(ut.unidade_trabalho_id) IS NOT NULL min(ut.data_inicio) ELSE '-' END) AS data_inicio,
    (CASE WHEN min(ut.unidade_trabalho_id) IS NOT NULL (CASE WHEN count(*) - count(ut.data_fim) = 0 THEN max(ut.data_fim) ELSE NULL END) ELSE '-' END) AS data_fim
    FROM macrocontrole.produto AS p
    LEFT JOIN 
    (
      SELECT s.fase_id, ut.geom, min(a.data_inicio) as data_inicio,
      (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
      INNER JOIN
      (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id NOT IN (5,6)) AS a
      ON a.unidade_trabalho_id = ut.id
      GROUP BY ut.id, s.fase_id
    ) AS ut
    ON st_relate(ut.geom, p.geom, ''T********'')
    WHERE p.uuid = $1 GROUP BY p.id, ut.fase_id;
    `,
    [uuid]
  );
  //descobrir se o produto está finalizado
  let finalizado = producao.every(v => {
    return v.data_fim })
  if(!finalizado){
    //throw error
  }

  const palavras_chave = await db.any(
    `SELECT pc.nome AS palavra_chave, tpc.nome AS tipo_palavra_chave
    FROM metadado.palavra_chave AS pc
    INNER JOIN metadado.tipo_palavra_chave_id AS tpc ON tpc.code = pc.tipo_palavra_chave_id
    INNER JOIN macrocontrole.produto AS p ON p.id = pc.produto_id
    WHERE p.uuid = $1`,
    [uuid]
  );

  let template = xmlTemplate[produto.tipo_produto_id];

  let dados = produto;
  const d = new Date();
  dados.data_metadado = d.toISOString().split("T")[0];
  dados.palavras_chave = palavras_chave;

  //responsavel metadado
  //documento linhagem
  //insumo interno
  //informacoes de producao nivel fase
  //responsavel cada fase
  //metodologias

  return { erro: null, template: template, dados: dados };
};

module.exports = controller;

/*
data_imagem.toISOString().split("T")[0];      
*/
