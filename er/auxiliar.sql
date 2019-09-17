-- calcula tempo aproximado de execução das atividades
WITH cte AS (
SELECT id,
CASE 
WHEN data_fim::date = data_inicio::date
THEN 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio )
WHEN DATE_PART('hour', data_fim  - data_inicio ) < 12
THEN 0
WHEN DATE_PART('hour', data_fim  - data_inicio ) <= 18
THEN 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) - 12*60
ELSE
60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) - 18*60
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
FROM macrocontrole.atividade WHERE tipo_situacao_id IN (4,6)
)
UPDATE macrocontrole.atividade AS a
SET tempo_execucao = cte.minutos + cte.minutos_dias
FROM cte
WHERE a.id = cte.id;

WITH data_login AS (
  SELECT min(data_login) AS data_min FROM acompanhamento.login
)
, datas AS (SELECT a.id, COUNT (DISTINCT data_login::date) as nr_dias FROM macrocontrole.atividade AS a
INNER JOIN acompanhamento.login AS l ON l.usuario_id = a.usuario_id
INNER JOIN data_login AS dl ON TRUE
WHERE a.data_inicio::date > dl.data_min::date AND a.tipo_situacao_id IN (4,6)
AND l.data_login >= a.data_inicio AND l.data_login <= a.data_fim
GROUP BY a.id)
, cte AS (
SELECT a.id,
CASE 
WHEN data_fim::date = data_inicio::date
THEN 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio )
WHEN DATE_PART('hour', data_fim  - data_inicio ) < 12
THEN 0
WHEN DATE_PART('hour', data_fim  - data_inicio ) <= 18
THEN 60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) - 12*60
ELSE
60*DATE_PART('hour', data_fim  - data_inicio ) + DATE_PART('minute', data_fim - data_inicio ) - 18*60
END AS minutos,
CASE
WHEN d.nr_dias > 2
THEN (d.nr_dias - 2 )*6*60
ELSE 0
END AS minutos_dias
FROM macrocontrole.atividade AS a
INNER JOIN data_login AS dl ON TRUE
INNER JOIN datas AS d ON d.id = a.id AND a.data_inicio::date > dl.data_min::date AND a.tipo_situacao_id IN (4,6)
)
UPDATE macrocontrole.atividade AS a
SET tempo_execucao = cte.minutos + cte.minutos_dias
FROM cte
INNER JOIN data_login AS dl ON TRUE
WHERE a.id = cte.id and a.data_inicio::date > dl.data_min::date;


-- aproxima tempo execução a partir de monitoramento_acao
WITH dl AS (
SELECT data, LAG(data,1) OVER(ORDER BY data) AS previous_data
FROM microcontrole.monitoramento_acao
WHERE atividade_id = 1
)
SELECT 
SUM(CASE 
WHEN data::date = previous_data::date AND (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data )) < 16
THEN 60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data )
ELSE 0
END) AS tempo
FROM dl WHERE data IS NOT NULL AND previous_data IS NOT NULL;