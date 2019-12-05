"use strict";

const {sapConn, createAdminConn} = require("./db");

const { createPS } = require("./sql_file")

const path = require("path")

const revokeSQL = createPS(path.join(__dirname, "sql", "revoke.sql"));

const managePermissions = {}

managePermissions.revokeAndGrantAllExecution = async () => {
    const dbInfos = await sapConn.any(
        `SELECT bd.nome, bd.servidor, bd.porta, a.id AS atividade_id, lt.login 
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut
        ON ut.id = a.unidade_trabalho_id 
        INNER JOIN macrocontrole.banco_dados AS bd
        ON bd.id = ut.banco_dados_id
        INNER JOIN dgeo.login_temporario AS lt
        ON lt.usuario_id = a.usuario_id AND lt.servidor = bd.servidor AND lt.porta = bd.porta
        WHERE a.tipo_situacao_id = 2`
    );

    if(!dbInfos){
        return null
    }
    for (let info of dbInfos) {
        const conn = await createAdminConn(info.servidor, info.porta, info.nome)
        await managePermissions.revokeAllPermissionsUser(info.login, conn)
        await managePermissions.grantPermissionsUser(info.atividade_id, info.login, conn)
    }

};

managePermissions.revokeAllPermissionsUser = async (login, connection) => {
    const query = await connection.oneOrNone(revokeSQL, { login });
    if(!query){
        return null
    }
    return connection.none(query.revoke_query)
};

managePermissions.grantPermissionsUser = async (atividadeId, login, connection) => {
    const grantInfo = await sapConn.any(
        `SELECT c.schema, c.nome AS nome_camada, ppc.camada_apontamento,
        ppc.atributo_situacao_correcao, ppc.atributo_justificativa_apontamento, ut.epsg, 
        ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) AS geom,
        e.tipo_etapa_id, bd.nome AS bd_nome
        FROM macrocontrole.camada AS c
        INNER JOIN macrocontrole.perfil_propriedades_camada AS ppc ON ppc.camada_id = c.id
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ppc.subfase_id
        INNER JOIN macrocontrole.atividade AS a ON a.etapa_id = e.id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        WHERE a.id = $<atividadeId>`, { atividadeId }
    );
    if(!grantInfo || grantInfo.length == 0){
        return null
    }

    await connection.tx(async t => {
        const dbName = grantInfo[0].db_nome;
        await t.none(
            `GRANT CONNECT ON DATABASE $<db:name> TO $<login:name>;`, { dbName, login }
        );
    
        const schemasSQL = grantInfo
                        .map(v => v.schema)
                        .filter((v, i, array) => array.indexOf(v) === i)
                        .reduce((prev, e) => `${prev} GRANT USAGE ON SCHEMA ${e} TO ${login};`);

        await t.none(schemasSQL);
                
        let camadas;
        const tipoEtapa = grantInfo[0].tipo_etapa_id;
        
        if(tipoEtapa === 1 || tipoEtapa === 4){ //Execução ou RevCorr
            camadas = grantInfo.filter(v => v.camada_apontamento == false)
                    .map(v => `${v.schema}.${v.nome_camada}`)
                    .filter((v, i, array) => array.indexOf(v) === i)
        }

        if(tipoEtapa === 2  || tipoEtapa === 3){ //Revisão e Correção
            camadas = grantInfo.map(v => `${v.schema}.${v.nome_camada}`)
                    .filter((v, i, array) => array.indexOf(v) === i)
        }
        
        if(tipoEtapa === 3){ //Correção
            const camadasApontamentoSQL = grantInfo
                .filter(v => v.camada_apontamento == true)
                .map(v => `GRANT UPDATE(${v.atributo_justificativa_apontamento}, ${v.atributo_situacao_correcao}) ON ${v.schema}.${v.nome_camada} TO ${login};`)
                .filter((v, i, array) => array.indexOf(v) === i)
                .reduce((prev, e) => `${prev} ${e}`)
                
            await t.none(camadasApontamentoSQL);
        }

        const enableRLS = camadas
                            .map(v => `ALTER TABLE ${v} ENABLE ROW LEVEL SECURITY;`)
                            .reduce((prev, e) => `${prev} ${e}`)

        await t.none(enableRLS);

        let createPolicy;
        const epsg =  grantInfo[0].epsg;
        const geom =  grantInfo[0].geom;

        if(tipoEtapa === 1 || tipoEtapa === 4 || tipoEtapa === 2){//Execução, Revisão, RevCorr POLICY
            createPolicy = camadas
            .map(v => {
                let policyName = `policy_${login}_${v.replace('.','_')}`;
                let spatialConstraint = `ST_INTERSECTS(geom, ST_GEOMFROMEWKT('SRID=${epsg};${geom}'))`;
                return `CREATE POLICY ${policyName} ON ${v} FOR ALL TO ${login} USING (${spatialConstraint}) WITH CHECK (${spatialConstraint});`
            })
            .reduce((prev, e) => `${prev} ${e}`)
        }

        if(tipoEtapa === 3){ //Correção
            let flagPolicy = grantInfo
            .filter(v => v.camada_apontamento == true)
            .map(v => `${v.schema}.${v.nome_camada}`)
            .filter((v, i, array) => array.indexOf(v) === i)
            .map(v => {
                let policyName = `flagpolicy_${login}_${v.replace('.','_')}`;
                let spatialConstraint = `ST_INTERSECTS(geom, ST_GEOMFROMEWKT('SRID=${epsg};${geom}'))`;
                return `CREATE POLICY ${policyName} ON ${v} FOR SELECT, UPDATE TO ${login} USING (${spatialConstraint}) WITH CHECK (${spatialConstraint});`
            })
            .reduce((prev, e) => `${prev} ${e}`) 

            let otherPolicy = grantInfo
            .filter(v => v.camada_apontamento == false)
            .map(v => `${v.schema}.${v.nome_camada}`)
            .filter((v, i, array) => array.indexOf(v) === i)
            .map(v => {
                let policyName = `otherpolicy_${login}_${v.replace('.','_')}`;
                let spatialConstraint = `ST_INTERSECTS(geom, ST_GEOMFROMEWKT('SRID=${epsg};${geom}'))`;
                return `CREATE POLICY ${policyName} ON ${v} FOR ALL TO ${login} USING (${spatialConstraint}) WITH CHECK (${spatialConstraint});`
            })
            .reduce((prev, e) => `${prev} ${e}`) 

            createPolicy = `${flagPolicy} ${otherPolicy}`;
        }

        await t.none(createPolicy);

        await t.none(
            `GRANT SELECT ON ALL TABLES IN SCHEMA public TO $<login:name>;`, { login }
        );
    
        //grant select sequenciador
        const sequenceSQL = await t.any(
            `SELECT string_agg(query, ' ') AS grant_sequence FROM (
            SELECT 'GRANT USAGE, SELECT ON SEQUENCE ' || replace(replace(column_default, '''::regclass)',''), 'nextval(''','') || ' TO ' || $<login> || ';' AS query
            FROM information_schema.columns AS c
            WHERE c.table_schema || '.' || c.table_name IN ($<camadas:csv>)
            AND column_default ~ 'nextval'
            ) AS foo;`, { camadas, login }
        );
        if(sequenceSQL){
            await t.none(sequenceSQL.grant_sequence)
        }
        
        //grant trigger function
        const triggerSQL = await t.any(
            `SELECT string_agg(query, ' ') AS grant_trigger FROM (
                SELECT 'GRANT EXECUTE ON FUNCTION ' || routine_schema || '.' || routine_name || '(' || 
                pg_get_function_identity_arguments(
                    (regexp_matches(specific_name, E'.*\_([0-9]+)'))[1]::oid) || ') to ' || $<login> || ';' AS query
                FROM pg_trigger AS t
                INNER JOIN pg_proc AS p ON p.oid = t.tgfoid
                INNER JOIN information_schema.routines AS r ON r.routine_name = p.proname
                INNER JOIN information_schema.triggers AS info_t ON info_t.trigger_name = t.tgname
                WHERE info_t.event_object_schema || '.' || info_t.event_object_table IN ($<camadas:csv>)
            ) AS foo;`, { camadas, login }
        );
        if(triggerSQL){
            await t.none(triggerSQL.grant_trigger)
        }
    
        //grant select nos dominios relacionados
        const fkSQL = await t.any(
            `SELECT string_agg(query, ' ') AS grant_fk FROM (
                SELECT 'GRANT SELECT ON ' || ccu.table_schema || '.' || ccu.table_name || ' TO ' || $<login> || ';' AS query
                FROM information_schema.table_constraints AS tc
                INNER JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_schema || '.' || tc.table_name IN ($<camadas:csv>)
                AND tc.constraint_type = 'FOREIGN KEY'
            ) AS foo;`, { camadas, login }
        );
        if(fkSQL){
            await t.none(fkSQL.grant_fk)
        }
    })
};

module.exports = managePermissions;