-- calcula tempo aproximado de execução das atividades
WITH cte AS (
SELECT id,
CASE 
WHEN data_fim::date = data_inicio::date
THEN round(60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60)
WHEN 24*60*DATE_PART('day', data_fim  - data_inicio ) + DATE_PART('hour', data_fim  - data_inicio ) < 12
THEN 0
WHEN 24*60*DATE_PART('day', data_fim  - data_inicio ) + DATE_PART('hour', data_fim  - data_inicio ) <= 18
THEN round(24*60*DATE_PART('day', data_fim  - data_inicio ) + 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60  - 12*60)
ELSE
round(24*60*DATE_PART('day', data_fim  - data_inicio ) + 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60 - 18*60)
END AS minutos,
CASE
WHEN ((SELECT count(*) AS count_days_no_weekend
       FROM   generate_series(data_inicio::date
                     , data_fim::date
                     , interval  '1 day') the_day
        WHERE  extract('ISODOW' FROM the_day) < 6)) > 2
THEN ((SELECT count(*) AS count_days_no_weekend
       FROM   generate_series(data_inicio::date
                     , data_fim::date
                     , interval  '1 day') the_day
        WHERE  extract('ISODOW' FROM the_day) < 6) - 2 )*6*60
ELSE 0
END AS minutos_dias
FROM macrocontrole.atividade WHERE tipo_situacao_id IN (4,5)
)
UPDATE macrocontrole.atividade AS a
SET tempo_execucao_estimativa = cte.minutos + cte.minutos_dias
FROM cte
WHERE a.id = cte.id;

WITH data_login AS (
  SELECT min(data_login) AS data_min FROM acompanhamento.login
)
, datas AS (SELECT a.id, COUNT (DISTINCT data_login::date) as nr_dias FROM macrocontrole.atividade AS a
INNER JOIN acompanhamento.login AS l ON l.usuario_id = a.usuario_id
INNER JOIN data_login AS dl ON TRUE
WHERE a.data_inicio::date > dl.data_min::date AND a.tipo_situacao_id IN (4,5)
AND l.data_login >= a.data_inicio AND l.data_login <= a.data_fim
GROUP BY a.id)
, cte AS (
SELECT a.id,
CASE 
WHEN data_fim::date = data_inicio::date
THEN round(60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60)
WHEN 24*60*DATE_PART('day', data_fim  - data_inicio ) + DATE_PART('hour', data_fim  - data_inicio ) < 12
THEN 0
WHEN 24*60*DATE_PART('day', data_fim  - data_inicio ) + DATE_PART('hour', data_fim  - data_inicio ) <= 18
THEN round(24*60*DATE_PART('day', data_fim  - data_inicio ) + 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60  - 12*60)
ELSE
round(24*60*DATE_PART('day', data_fim  - data_inicio ) + 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) + DATE_PART('seconds', data_fim - data_inicio )/60 - 18*60)
END AS minutos,
CASE
WHEN d.nr_dias > 2
THEN (d.nr_dias - 2 )*6*60
ELSE 0
END AS minutos_dias
FROM macrocontrole.atividade AS a
INNER JOIN data_login AS dl ON TRUE
INNER JOIN datas AS d ON d.id = a.id AND a.data_inicio::date > dl.data_min::date AND a.tipo_situacao_id IN (4,5)
)
UPDATE macrocontrole.atividade AS a
SET tempo_execucao_estimativa = cte.minutos + cte.minutos_dias
FROM cte
INNER JOIN data_login AS dl ON TRUE
WHERE a.id = cte.id and a.data_inicio::date > dl.data_min::date;


WITH datas AS (
SELECT id, data_inicio AS data FROM macrocontrole.atividade
UNION
(SELECT a.id, data
FROM microcontrole.monitoramento_acao AS ma
INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
WHERE a.data_inicio < ma.data AND a.data_fim > ma.data
ORDER BY data)
UNION
SELECT id, data_fim AS data FROM macrocontrole.atividade
)
, dl AS (
SELECT id, data, LAG(data,1) OVER(PARTITION BY id ORDER BY data) AS previous_data
FROM datas
)
, resultado AS (
SELECT id,
round(SUM(CASE 
WHEN data::date = previous_data::date AND (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data ) + DATE_PART('seconds', data - previous_data )/60) < 5
THEN (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data ) + DATE_PART('seconds', data - previous_data )/60)
ELSE 0
    END)) as tempo
FROM dl WHERE data IS NOT NULL AND previous_data IS NOT NULL
GROUP BY id)
UPDATE macrocontrole.atividade AS a
SET tempo_execucao_microcontrole = resultado.tempo
FROM resultado
WHERE a.id = resultado.id;