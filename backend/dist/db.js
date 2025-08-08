"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
/**
 * Configura e exporta uma instância de Pool para conexão com o PostgreSQL.
 * As credenciais podem ser definidas via variáveis de ambiente:
 * PGHOST, PGUSER, PGPASSWORD, PGDATABASE e PGPORT.
 */
const pool = new pg_1.Pool({
    user: process.env.PGUSER || 'iot_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'iot_sensors',
    password: process.env.PGPASSWORD || 'iot_password',
    port: Number(process.env.PGPORT) || 5432
});
exports.default = {
    /**
     * Executa uma query no banco de dados.
     * @param text SQL parametrizado
     * @param params Parâmetros da consulta
     */
    query: (text, params) => pool.query(text, params)
};
