'use strict'

const db = require('./db')

const { createPS } = require('./sql_file')

const path = require('path')

const revokeSQL = createPS(path.join(__dirname, 'sql', 'revoke.sql'))
const revokeAllUsersSQL = createPS(
  path.join(__dirname, 'sql', 'revoke_all_users.sql')
)

const managePermissions = {}

managePermissions.revokeAllDb = async (servidor, porta, banco) => {
  const conn = await db.createAdminConn(servidor, porta, banco, false)

  const query = await conn.oneOrNone(revokeAllUsersSQL)
  if (!query) {
    return null
  }

  return conn.none(query.revoke_query)
}

managePermissions.revokeAndGrantAllExecution = async () => {
  const dbInfos = await db.sapConn.any(
    `SELECT dp.nome, dp.configuracao_producao, a.id AS atividade_id, lt.login 
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut
        ON ut.id = a.unidade_trabalho_id 
        INNER JOIN macrocontrole.dado_producao AS dp
        ON dp.id = ut.dado_producao_id
        INNER JOIN dgeo.login_temporario AS lt
        ON lt.usuario_id = a.usuario_id AND lt.configuracao = dp.configuracao_producao
        WHERE a.tipo_situacao_id = 2 AND dp.tipo_dado_producao_id = 2`
  )

  if (!dbInfos) {
    return null
  }
  for (const info of dbInfos) {
    const servidor = info.configuracao_producao.split(':')[0]
    const porta = info.configuracao_producao.split(':')[1]
    const conn = await db.createAdminConn(servidor, porta, info.nome, false)
    await managePermissions.revokeAllPermissionsUser(info.login, conn)
    await managePermissions.grantPermissionsUser(
      info.atividade_id,
      info.login,
      conn
    )
  }
}

managePermissions.revokeAllPermissionsUser = async (login, connection) => {
  const query = await connection.oneOrNone(revokeSQL, [login])
  if (!query) {
    return null
  }
  return connection.none(query.revoke_query)
}

managePermissions.grantPermissionsUser = async (
  atividadeId,
  login,
  connection
) => {
  const grantInfo = await db.sapConn.any(
    `SELECT c.schema, c.nome AS nome_camada, ppc.camada_apontamento,
        ppc.atributo_situacao_correcao, ppc.atributo_justificativa_apontamento, 
        ppc.atributo_filtro_subfase, ppc.subfase_id, ut.epsg, 
        ST_ASEWKT(ST_SnapToGrid(ST_Transform(ut.geom,ut.epsg::integer), 0.000001)) AS geom,
        e.tipo_etapa_id, dp.nome AS db_nome
        FROM macrocontrole.camada AS c
        INNER JOIN macrocontrole.propriedades_camada AS ppc ON ppc.camada_id = c.id
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ppc.subfase_id
        INNER JOIN macrocontrole.atividade AS a ON a.etapa_id = e.id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.dado_producao AS dp ON dp.id = ut.dado_producao_id
        WHERE a.id = $<atividadeId> AND dp.tipo_dado_producao_id = 2`,
    { atividadeId }
  )
  if (!grantInfo || grantInfo.length === 0) {
    return null
  }

  const dbName = grantInfo[0].db_nome
  let grantSQL = `GRANT CONNECT ON DATABASE ${dbName} TO ${login};`

  const schemasSQL = grantInfo
    .map((v) => v.schema)
    .filter((v, i, array) => array.indexOf(v) === i)
    .map((v) => `GRANT USAGE ON SCHEMA ${v} TO ${login};`)
    .join(' ')

  grantSQL += schemasSQL

  grantSQL += `GRANT USAGE ON SCHEMA PUBLIC TO ${login}; GRANT SELECT ON public.geometry_columns TO ${login};`

  let camadas
  const tipoEtapa = grantInfo[0].tipo_etapa_id

  if (tipoEtapa === 1 || tipoEtapa === 4) {
    // Execução ou RevCorr
    camadas = grantInfo
      .filter((v) => v.camada_apontamento === false)
      .map((v) => `${v.schema}.${v.nome_camada}`)
      .filter((v, i, array) => array.indexOf(v) === i)
  }

  if (tipoEtapa === 2 || tipoEtapa === 5) {
    // Revisão ou Revisão Final
    camadas = grantInfo
      .map((v) => `${v.schema}.${v.nome_camada}`)
      .filter((v, i, array) => array.indexOf(v) === i)
  }

  if (tipoEtapa === 3) {
    // Correção
    const camadasApontamentoSQL = grantInfo
      .filter((v) => v.camada_apontamento === true)
      .filter((v, i, array) => array.indexOf(v) === i)
      .map(
        (v) =>
          `GRANT SELECT ON ${v.schema}.${v.nome_camada} TO ${login}; GRANT UPDATE(${v.atributo_justificativa_apontamento}, ${v.atributo_situacao_correcao}) ON ${v.schema}.${v.nome_camada} TO ${login};`
      )
      .join(' ')

    const outrasCamadasSQL = grantInfo
      .filter((v) => v.camada_apontamento === false)
      .filter((v, i, array) => array.indexOf(v) === i)
      .map(
        (v) =>
          `GRANT SELECT, INSERT, DELETE, UPDATE ON ${v.schema}.${v.nome_camada} TO ${login};`
      )
      .join(' ')

      grantSQL += camadasApontamentoSQL
      grantSQL += outrasCamadasSQL
  } else {
    const camadasSql = camadas
      .map((v) => `GRANT SELECT, INSERT, DELETE, UPDATE ON ${v} TO ${login};`)
      .join(' ')

      grantSQL += camadasSql
  }
  /** 
  // enableRLS
  const enableRLSSQL = await connection.oneOrNone(
    `SELECT string_agg('ALTER TABLE ' || nspname || '.' || relname || ' ENABLE ROW LEVEL SECURITY;', '') AS txt
    FROM pg_class AS c
    INNER JOIN pg_catalog.pg_namespace AS ns ON c.relnamespace = ns.oid
    WHERE relrowsecurity is false AND nspname || '.' || relname in ($<camadas:csv>);`,
    { camadas }
  )
  if (enableRLSSQL && enableRLSSQL.txt) {
    grantSQL += enableRLSSQL.txt
  }

  let createPolicy
  const geom = grantInfo[0].geom

  createPolicy = camadas
    .map((v) => {
      const policyName = `policy_${login}_${v.replace('.', '_')}`
      let spatialConstraint = `ST_INTERSECTS(geom, ST_GEOMFROMEWKT('${geom}'))`
      if (v.atributo_filtro_subfase) {
        const subfaseConstraint = `${v.atributo_filtro_subfase} = ${v.subfase_id}`
        spatialConstraint = `${spatialConstraint} AND ${subfaseConstraint}`
      }
      return `CREATE POLICY ${policyName} ON ${v} FOR ALL TO ${login} USING (${spatialConstraint}) WITH CHECK (${spatialConstraint});`
    })
    .join(' ')


  grantSQL += createPolicy
  
  */

  // grant select sequenciador
  const sequenceSQL = await connection.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_sequence FROM (
          SELECT 'GRANT USAGE, SELECT ON SEQUENCE ' || replace(replace(column_default, '''::regclass)',''), 'nextval(''','') || ' TO ' || $<login> || ';' AS query
          FROM information_schema.columns AS c
          WHERE c.table_schema || '.' || c.table_name IN ($<camadas:csv>)
          AND column_default ~ 'nextval'
          ) AS foo;`,
    { camadas, login }
  )
  if (sequenceSQL && sequenceSQL.grant_sequence) {
    grantSQL += sequenceSQL.grant_sequence
  }
  // grant trigger function
  const triggerSQL = await connection.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_trigger FROM (
              SELECT 'GRANT EXECUTE ON FUNCTION ' || routine_schema || '.' || routine_name || '(' || 
              pg_get_function_identity_arguments(
                  (regexp_matches(specific_name, E'.*\\_([0-9]+)'))[1]::oid) || ') to ' || $<login> || ';' AS query
              FROM pg_trigger AS t
              INNER JOIN pg_proc AS p ON p.oid = t.tgfoid
              INNER JOIN information_schema.routines AS r ON r.routine_name = p.proname
              INNER JOIN information_schema.triggers AS info_t ON info_t.trigger_name = t.tgname
              WHERE info_t.event_object_schema || '.' || info_t.event_object_table IN ($<camadas:csv>)
          ) AS foo;`,
    { camadas, login }
  )
  const triggerSchema = await connection.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_trigger FROM (
              SELECT 'GRANT USAGE ON SCHEMA ' || routine_schema || ' TO ' || $<login> || ';' AS query
              FROM pg_trigger AS t
              INNER JOIN pg_proc AS p ON p.oid = t.tgfoid
              INNER JOIN information_schema.routines AS r ON r.routine_name = p.proname
              INNER JOIN information_schema.triggers AS info_t ON info_t.trigger_name = t.tgname
              WHERE info_t.event_object_schema || '.' || info_t.event_object_table IN ($<camadas:csv>)
          ) AS foo;`,
    { camadas, login }
  )
  if (triggerSQL && triggerSQL.grant_trigger) {
    grantSQL += triggerSQL.grant_trigger
  }
  if (triggerSchema && triggerSchema.grant_trigger) {
    grantSQL += triggerSchema.grant_trigger
  }
  // grant select nos dominios relacionados
  const fkSQL = await connection.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_fk FROM (
              SELECT 'GRANT SELECT ON ' || ccu.table_schema || '.' || ccu.table_name || ' TO ' || $<login> || ';' AS query
              FROM information_schema.table_constraints AS tc
              INNER JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
              WHERE tc.table_schema || '.' || tc.table_name IN ($<camadas:csv>)
              AND tc.constraint_type = 'FOREIGN KEY'
          ) AS foo;`,
    { camadas, login }
  )

  const fkSchema = await connection.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_fk FROM (
              SELECT 'GRANT USAGE ON SCHEMA ' || ccu.table_schema || ' TO ' || $<login> || ';' AS query
              FROM information_schema.table_constraints AS tc
              INNER JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
              WHERE tc.table_schema || '.' || tc.table_name IN ($<camadas:csv>)
              AND tc.constraint_type = 'FOREIGN KEY'
          ) AS foo;`,
    { camadas, login }
  )
  if (fkSQL && fkSQL.grant_fk) {
    grantSQL += fkSQL.grant_fk
  }
  if (fkSchema && fkSchema.grant_fk) {
    grantSQL += fkSchema.grant_fk
  }

  await connection.none(grantSQL)

}

module.exports = managePermissions
