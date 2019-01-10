"use strict";

/*
  function getRtm(req,res,next){
    const rtm = {}
    db_acervo.task(function (t) {
      const batch = []
      batch.push(t.any('SELECT mi, inom, nome, bloco, levantamento_auditoria, aerotriangulacao, restituicao, aquisicao, reambulacao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.ci_25k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, nome, vetorizacao, validacao, area_continua, bdgex_vetorial FROM producao.pcad_50k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, bloco, nome, aquisicao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.ram_50k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, nome, aquisicao, reambulacao, complementacao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.sc_25k ORDER BY mi'))
      return t.batch(batch)
    }).then(function (data) {
      rtm.ci25k = data[0];
      rtm.pcad50k = data[1];
      rtm.ram50k = data[2];
      rtm.sc25k = data[3];
      return res.status(200).json(rtm)
    })
  }


  
select ee.subfase_etapa_id, se.subfase_id,
170*AVG(
CASE 
WHEN extract(epoch from ee.data_fim-ee.data_inicio)/3600 <= 6
THEN
(date_part('hours',(ee.data_fim-ee.data_inicio))/6 + date_part('minutes',(ee.data_fim-ee.data_inicio))/360)/(ST_Area(ut.geom::GEOGRAPHY)/1000000)
WHEN extract(epoch from ee.data_fim-ee.data_inicio)/3600 > 6 and extract(epoch from ee.data_fim-ee.data_inicio)/3600 <= 18
THEN
1/(ST_Area(ut.geom::GEOGRAPHY)/1000000)
WHEN extract(epoch from ee.data_fim-ee.data_inicio)/3600 >18 and extract(epoch from ee.data_fim-ee.data_inicio)/3600 <= 24
THEN
((date_part('hours',(ee.data_fim-ee.data_inicio))-18)/6 + date_part('minutes',(ee.data_fim-ee.data_inicio))/360)/(ST_Area(ut.geom::GEOGRAPHY)/1000000)
ELSE
(date_part('days',(ee.data_fim-ee.data_inicio)) + date_part('hours',(ee.data_fim-ee.data_inicio))/6 + date_part('minutes',(ee.data_fim-ee.data_inicio))/360)/(ST_Area(ut.geom::GEOGRAPHY)/1000000)
END
) as tempo
from macrocontrole.execucao_etapa as ee
inner join macrocontrole.subfase_etapa as se ON se.id = ee.subfase_etapa_id
inner join macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
where ee.data_fim is not null and ee.data_inicio is not null and data_fim > data_inicio
and 170*(date_part('days',(ee.data_fim-ee.data_inicio)) + date_part('hours',(ee.data_fim-ee.data_inicio))/6 + date_part('minutes',(ee.data_fim-ee.data_inicio))/360)/(ST_Area(ut.geom::GEOGRAPHY)/1000000) < 20
GROUP BY ee.subfase_etapa_id, se.subfase_id
order by tempo



*/

