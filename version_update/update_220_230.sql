BEGIN;

UPDATE public.versao
SET nome = '2.3.0' WHERE code = 1;

INSERT INTO dominio.tipo_insumo (code, nome) VALUES (10, 'ArcGis MapServer') ;

COMMIT;