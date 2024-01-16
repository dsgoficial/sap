'use strict'

module.exports = {
  db: require('./db'),
  databaseVersion: require('./database_version'),
  microcontroleDatabaseVersion: require('./database_version_microcontrole'),
  sqlFile: require('./sql_file'),
  temporaryLogin: require('./temporary_login'),
  managePermissions: require('./manage_permissions'),
  disableTriggers: require('./disable_triggers')
}
