"use strict";

const db = require("./main_db");

const { readSqlFile } = require("./sql_file")

const managePermissions = {}

managePermissions.revokeAllPermissionsUser = async (atividadeId, login, connection) => {
    return false
};

managePermissions.grantPermissionsUser = async (atividadeId, login, connection) => {
    return false
};

module.exports = managePermissions;