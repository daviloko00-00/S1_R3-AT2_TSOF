import { connection } from '../configs/Database.js';

const clienteRepository = {
    criar: async (cliente) => {
        const sql = `
            INSERT INTO clientes
                (Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento, Email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            cliente.nome,
            cliente.cpf,
            cliente.cep,
            cliente.logradouro,
            cliente.bairro,
            cliente.cidade,
            cliente.uf,
            cliente.numero,
            cliente.complemento,
            cliente.email
        ];
        const [rows] = await connection.execute(sql, values);
        return rows;
    },
    editar: async (cliente) => {
        const sql = `
            UPDATE clientes
            SET Nome = ?, CPF = ?, CEP = ?, Logradouro = ?, Bairro = ?, Cidade = ?, UF = ?, Numero = ?, Complemento = ?, Email = ?
            WHERE Id = ?;
        `;
        const values = [
            cliente.nome,
            cliente.cpf,
            cliente.cep,
            cliente.logradouro,
            cliente.bairro,
            cliente.cidade,
            cliente.uf,
            cliente.numero,
            cliente.complemento,
            cliente.email,
            cliente.id
        ];
        const [rows] = await connection.execute(sql, values);
        return rows;
    },
    deletar: async (id) => {
        const sql = 'DELETE FROM clientes WHERE Id = ?;';
        const [rows] = await connection.execute(sql, [id]);
        return rows;
    },
    selecionar: async () => {
        const sql = 'SELECT * FROM clientes ORDER BY Nome;';
        const [rows] = await connection.execute(sql);
        return rows;
    },
    buscarPorId: async (id) => {
        const sql = 'SELECT * FROM clientes WHERE Id = ?;';
        const [rows] = await connection.execute(sql, [id]);
        return rows[0];
    },
    buscarPorCpf: async (cpf) => {
        const sql = 'SELECT * FROM clientes WHERE CPF = ?;';
        const [rows] = await connection.execute(sql, [cpf]);
        return rows[0];
    },
    buscarPorEmail: async (email) => {
        const sql = 'SELECT * FROM clientes WHERE LOWER(Email) = LOWER(?);';
        const [rows] = await connection.execute(sql, [email]);
        return rows[0];
    },
    contarVeiculosVinculados: async (idCliente) => {
        const sql = 'SELECT COUNT(*) as total FROM veiculos WHERE IdCliente = ?;';
        const [rows] = await connection.execute(sql, [idCliente]);
        return rows[0].total;
    }
};

export default clienteRepository;
