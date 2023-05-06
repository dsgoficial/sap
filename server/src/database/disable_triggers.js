const dt = {}

dt.disableTriggerForTableInTransaction = async (db, schema, table, operationCallback) => {
    return db.tx(async (t) => {
        await t.none(`ALTER TABLE $<schema:name>.$<table:name> DISABLE TRIGGER ALL;`, { schema, table });
        await operationCallback(t);
        await t.none(`ALTER TABLE  $<schema:name>.$<table:name> ENABLE TRIGGER ALL;`, { schema, table });
    });
}

dt.disableAllTriggersInTransaction = async (db, operationCallback) => {
    return db.tx(async (t) => {
        await t.none("SET LOCAL session_replication_role = 'replica';");
        await operationCallback(t);
        await t.none("SET LOCAL session_replication_role = 'origin';");
    });
}

dt.reCreateMaterializedViewFromFases = async (db, loteId, faseIds) => {
    let sqlview = await db.none(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || $<loteId> || '_subfase_'|| s.id || 
                ';DELETE FROM public.layer_styles WHERE f_table_schema = ''acompanhamento'' AND f_table_name = (''lote_' || $<loteId> || '_subfase_' || s.id || ''') AND stylename = ''acompanhamento_subfase'';' ||
                'SELECT acompanhamento.cria_view_acompanhamento_subfase(' || s.id || ', ' || $<loteId> || ');' AS query
        FROM macrocontrole.subfase AS s
        WHERE s.fase_id in ($<faseIds:csv>)) AS foo;
        `,
        { loteId, faseIds }
    );

    return db.any(sqlview.fix);
}

dt.reCreateMaterializedViewFromSubfases = async (db, loteId, subfaseIds) => {
    let sqlview = await db.none(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || $<loteId> || '_subfase_'|| s.id || 
                ';DELETE FROM public.layer_styles WHERE f_table_schema = ''acompanhamento'' AND f_table_name = (''lote_' || $<loteId> || '_subfase_' || s.id || ''') AND stylename = ''acompanhamento_subfase'';' ||
                'SELECT acompanhamento.cria_view_acompanhamento_subfase(' || s.id || ', ' || $<loteId> || ');' AS query
        FROM macrocontrole.subfase AS s
        WHERE s.id in ($<subfaseIds:csv>)) AS foo;
        `,
        { loteId, subfaseIds }
    );

    return db.any(sqlview.fix);
}

dt.reCreateMaterializedViewFromUTs = async (db, utIds) => {
    let sqlview = await db.none(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || ut.lote_id || '_subfase_'|| s.id || 
                ';DELETE FROM public.layer_styles WHERE f_table_schema = ''acompanhamento'' AND f_table_name = (''lote_' || ut.lote_id || '_subfase_' || s.id || ''') AND stylename = ''acompanhamento_subfase'';' ||
                'SELECT acompanhamento.cria_view_acompanhamento_subfase(' || s.id || ', ' || ut.lote_id || ');' AS query
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.subfase_id = s.id
        WHERE ut.id in ($<utIds:csv>)) AS foo;
        `,
        { utIds }
    );

    return db.any(sqlview.fix);
}

dt.reCreateMaterializedViewFromAtivs = async (db, ativIds) => {
    let sqlview = await db.none(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || ut.lote_id || '_subfase_'|| s.id || 
                ';DELETE FROM public.layer_styles WHERE f_table_schema = ''acompanhamento'' AND f_table_name = (''lote_' || ut.lote_id || '_subfase_' || s.id || ''') AND stylename = ''acompanhamento_subfase'';' ||
                'SELECT acompanhamento.cria_view_acompanhamento_subfase(' || s.id || ', ' || ut.lote_id || ');' AS query
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.subfase_id = s.id
        INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
        WHERE a.id in ($<ativIds:csv>)) AS foo;
        `,
        { ativIds }
    );

    return db.any(sqlview.fix);
}


module.exports = dt