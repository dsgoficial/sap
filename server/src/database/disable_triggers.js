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

dt.reCreateSubfaseMaterializedViewFromFases = async (db, loteId, faseIds) => {
    let sqlview = await db.none(
        `
        SELECT string_agg(query, ' ') AS fix FROM (
          SELECT UNIQUE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || $<loteId> || '_subfase_'|| s.id || 
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
        `

        `,
        { utIds }
    );

    return db.any(sqlview.fix);
}

dt.refreshMaterializedViewFromAtivs = async (db, ativIds) => {
    let sqlview = await db.none(
        `

        `,
        { ativIds }
    );

    return db.any(sqlview.fix);
}


module.exports = dt