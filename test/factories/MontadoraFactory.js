import { connection } from "../../src/configs/Database.js";

export class MontadoraFactory {
    static async create(nome = 'Fiat', pais = 'Itália') {
        if (typeof nome === 'object' && nome !== null) {
            pais = nome.pais || 'Itália';
            nome = nome.nome || 'Fiat';
        }

        const [result] = await connection.execute(
            `INSERT INTO montadoras (Nome, Pais) VALUES (?,?);`,
            [nome, pais]
        );
        return {
            id: result.insertId,
            nome,
            pais
        };
    }
}
