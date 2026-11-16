import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const raizProjeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Prepara o banco exclusivo de testes antes da suíte de integração.
 *
 * O script recria apenas o banco cujo nome termina em "_test", evitando que
 * uma configuração incorreta apague os dados do banco de desenvolvimento.
 */
export async function setup() {
    dotenv.config({
        path: path.join(raizProjeto, '.env.test'),
        override: true,
        quiet: true
    });

    const database = process.env.DB_DATABASE;

    if (!database || !/_test$/i.test(database)) {
        throw new Error(
            `Banco de testes inválido: DB_DATABASE="${database}". O nome deve terminar com "_test".`
        );
    }

    const arquivoSql = path.join(raizProjeto, 'docs', 'sql-test.sql');
    const scriptSql = (await fs.readFile(arquivoSql, 'utf8'))
        .replaceAll('loja_motors_test', database);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        await connection.query(scriptSql);
    } finally {
        await connection.end();
    }
}
