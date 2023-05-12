const dt = {}

dt.disableTriggerForTableInTransaction = async (db, schema, table, operationCallback) => {
    return db.tx(async t => {
        await t.none(`ALTER TABLE $<schema:name>.$<table:name> DISABLE TRIGGER ALL;`, { schema, table });
        await operationCallback(t);
        await t.none(`ALTER TABLE  $<schema:name>.$<table:name> ENABLE TRIGGER ALL;`, { schema, table });
    });
}

dt.disableAllTriggersInTransaction = async (db, operationCallback) => {
    return db.tx(async t => {
        await t.none("SET LOCAL session_replication_role = 'replica';");
        await operationCallback(t);
        await t.none("SET LOCAL session_replication_role = 'origin';");
    });
}

dt.reCreateSubfaseMaterializedViewFromFases = async (db, loteId, faseIds) => {
    let sqlview = await db.one(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT DISTINCT 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || $<loteId> || '_subfase_'|| s.id || 
                ';DELETE FROM public.layer_styles WHERE f_table_schema = ''acompanhamento'' AND f_table_name = (''lote_' || $<loteId> || '_subfase_' || s.id || ''') AND stylename = ''acompanhamento_subfase'';' ||
                'SELECT acompanhamento.cria_view_acompanhamento_subfase(' || s.id || ', ' || $<loteId> || ');' AS query
        FROM macrocontrole.subfase AS s
        WHERE s.fase_id in ($<faseIds:csv>)) AS foo;
        `,
        { loteId, faseIds }
    );

    return db.any(sqlview.fix);
}

dt.refreshMaterializedViewFromUTs = async (db, utIds) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || ut.lote_id || '_subfase_' || ut.subfase_id  AS viewname
               FROM macrocontrole.unidade_trabalho AS ut
               WHERE ut.id in ($<utIds:csv>)
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS subfase
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || ut.lote_id AS viewname
               FROM macrocontrole.unidade_trabalho AS ut
               WHERE ut.id in ($<utIds:csv>)
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             WHERE pgm.schemaname = 'acompanhamento' AND pgm.matviewname = 'bloco'
            ) AS bloco
        ) AS foo;`,
        { utIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromAtivs = async (db, ativIds) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || ut.lote_id || '_subfase_' || ut.subfase_id  AS viewname
               FROM macrocontrole.atividade AS a
               INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
               WHERE a.id in ($<ativIds:csv>)
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS subfase            
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || ut.lote_id AS viewname
               FROM macrocontrole.atividade AS a
               INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
               WHERE a.id in ($<ativIds:csv>)
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             WHERE pgm.schemaname = 'acompanhamento' AND pgm.matviewname = 'bloco'
            ) AS bloco
        ) AS foo;`,
        { ativIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromSubfases = async (db, loteId, subfaseIds) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id || '_subfase_' || s.id  AS viewname
               FROM macrocontrole.subfase AS s
                        INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
                        INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
                        WHERE s.id in ($<subfaseIds:csv>) AND l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS subfase            
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id AS viewname
               FROM macrocontrole.lote AS l
                WHERE l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             WHERE pgm.schemaname = 'acompanhamento' AND pgm.matviewname = 'bloco'
            ) AS bloco
        ) AS foo;`,
        { loteId, subfaseIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromLote = async (db, loteId) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id || '_subfase_' || s.id  AS viewname
               FROM macrocontrole.lote AS l
                        INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = l.linha_producao_id
                        INNER JOIN macrocontrole.subfase AS s ON s.fase_id = f.id
                        WHERE l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS subfase
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id AS viewname
               FROM macrocontrole.lote AS l
                WHERE l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             WHERE pgm.schemaname = 'acompanhamento' AND pgm.matviewname = 'bloco'
            ) AS bloco
        ) AS foo;`,
        { loteId }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromLoteNoSubfase = async (db, loteId) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id AS viewname
               FROM macrocontrole.lote AS l
                WHERE l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             WHERE pgm.schemaname = 'acompanhamento' AND pgm.matviewname = 'bloco'
            ) AS bloco
        ) AS foo;`,
        { loteId }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromLoteOnlyLote = async (db, loteId) => {
    let sqlview = await db.one(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || nome_view || ';' AS query
            FROM (
             SELECT pgm.schemaname || '.' || pgm.matviewname AS nome_view
             FROM pg_matviews AS pgm
             INNER JOIN (
               SELECT DISTINCT 'lote_' || l.id AS viewname
               FROM macrocontrole.lote AS l
                WHERE l.id = $<loteId>
             ) AS x ON pgm.matviewname = x.viewname AND pgm.schemaname = 'acompanhamento'
            ) AS lote
        ) AS foo;`,
        { loteId }
    );

    return db.any(sqlview.view);
}

dt.handleRelacionamentoUtInsertUpdate = async (db, utIds) => {
    await db.func(
        `macrocontrole.handle_relacionamento_ut_insert_update`,
        utIds
    );
}

dt.handleRelacionamentoUtDelete = async (db, utIds) => {
    await db.func(
        `macrocontrole.handle_relacionamento_ut_delete`,
        utIds    
    );
}

dt.handleRelacionamentoProdutoInsertUpdate = async (db, produtoIds) => {
    await db.func(
        `macrocontrole.handle_relacionamento_produto_insert_update`,
        produtoIds
    );
}

dt.handleRelacionamentoProdutoDelete = async (db, produtoIds) => {
    await db.func(
        `macrocontrole.handle_relacionamento_produto_delete`,
        produtoIds
    );
}

module.exports = dt