import { connection } from "../../src/configs/Database.js";

export class ClientFactory {
    static async create(
        nome = 'Florisvaldo Junior',
        CPF = '12345678901',
        CEP = '13185880',
        logradouro = 'Rua da Amizade',
        bairro = 'Jardim Brasil',
        cidade = 'Hortolândia',
        UF = 'SP',
        numero = '123',
        complemento = 'Apenas um teste!',
        email = null
    ) {
        if (typeof nome === 'object' && nome !== null) {
            CPF = nome.CPF || nome.cpf || '12345678901';
            CEP = nome.CEP || nome.cep || '13185880';
            logradouro = nome.logradouro || 'Rua da Amizade';
            bairro = nome.bairro || 'Jardim Brasil';
            cidade = nome.cidade || 'Hortolândia';
            UF = nome.UF || nome.uf || 'SP';
            numero = nome.numero || '123';
            complemento = nome.complemento || 'Apenas um teste!';
            email = nome.email ?? null;
            nome = nome.nome || 'Florisvaldo Junior';
        }

        const [result] = await connection.execute(
            `INSERT INTO clientes (Nome, Cpf, Cep, Logradouro, Bairro, Cidade, UF, Numero, Complemento, Email) VALUES (?,?,?,?,?,?,?,?,?,?);`,
            [
                nome,
                CPF,
                CEP,
                logradouro,
                bairro,
                cidade,
                UF,
                numero,
                complemento,
                email
            ]
        );

        return {
            id: result.insertId,
            nome,
            CPF,
            CEP,
            logradouro,
            bairro,
            cidade,
            UF,
            numero,
            complemento,
            email
        };
    }
}

export { ClientFactory as ClienteFactory };
