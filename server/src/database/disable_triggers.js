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
    let sqlview = await db.none(
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
    let sqlview = await db.none(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || ut.lote_id || '_subfase_' || ut.subfase_id || ';' AS query
            FROM macrocontrole.unidade_trabalho AS ut
            WHERE ut.id in ($<utIds:csv>)
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || ut.lote_id || ';' AS query
            FROM macrocontrole.unidade_trabalho AS ut
            WHERE ut.id in ($<utIds:csv>)
            UNION
            SELECT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.bloco;' AS query
        ) AS foo;`,
        { utIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromAtivs = async (db, ativIds) => {
    let sqlview = await db.none(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || ut.lote_id || '_subfase_' || ut.subfase_id || ';' AS query
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
            WHERE a.id in ($<ativIds:csv>)
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || ut.lote_id || ';' AS query
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
            WHERE a.id in ($<ativIds:csv>)
        ) AS foo;`,
        { ativIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromSubfases = async (db, loteId, subfaseIds) => {
    let sqlview = await db.none(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || $<loteId> || '_subfase_' || s.id || ';' AS query
            FROM macrocontrole.subfase AS s
            INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
            INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
            WHERE s.id in ($<subfaseIds:csv>) AND l.id = $<loteId>
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || l.id || ';' AS query
            FROM macrocontrole.lote AS l
            WHERE l.id = $<loteId>
        ) AS foo;`,
        { loteId, subfaseIds }
    );

    return db.any(sqlview.view);
}

dt.refreshMaterializedViewFromLote = async (db, loteId) => {
    let sqlview = await db.none(
        `SELECT string_agg(query, ' ') AS view FROM (
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || l.id || '_subfase_' || s.id || ';' AS query
            FROM macrocontrole.lote AS l
            INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = l.linha_producao_id
            INNER JOIN macrocontrole.subfase AS s ON s.fase_id = f.id
            WHERE l.id = $<loteId>
            UNION
            SELECT DISTINCT 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_' || l.id || ';' AS query
            FROM macrocontrole.lote AS l
            WHERE l.id = $<loteId>
        ) AS foo;`,
        { loteId }
    );

    return db.any(sqlview.view);
}

module.exports = dt