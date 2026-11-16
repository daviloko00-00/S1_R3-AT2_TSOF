import { connection } from "../../src/configs/Database.js";
import { ClientFactory } from "./ClienteFactory.js";
import { MontadoraFactory } from "./MontadoraFactory.js";

export class VeiculosFactory {
    static async create(dadosOrModelo, placa, ano, cor, valor, idCliente, idMontadora) {
        let modelo = dadosOrModelo;
        if (typeof dadosOrModelo === 'object' && dadosOrModelo !== null) {
            modelo = dadosOrModelo.modelo || dadosOrModelo.nome || 'Uno';
            placa = dadosOrModelo.placa || 'ABC1234';
            ano = dadosOrModelo.ano || 2020;
            cor = dadosOrModelo.cor || 'Branco';
            valor = dadosOrModelo.valor || 30000.00;
            idCliente = dadosOrModelo.idCliente || dadosOrModelo.clienteId;
            idMontadora = dadosOrModelo.idMontadora || dadosOrModelo.montadoraId;
        }

        if (!idCliente) {
            const cliente = await ClientFactory.create();
            idCliente = cliente.id;
        }
        if (!idMontadora) {
            const montadora = await MontadoraFactory.create();
            idMontadora = montadora.id;
        }

        placa = placa || 'ABC1234';
        ano = ano || 2020;
        cor = cor || 'Branco';
        valor = valor || 30000.00;
        modelo = modelo || 'Uno';

        const [result] = await connection.execute(
            `INSERT INTO veiculos (Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora) VALUES (?,?,?,?,?,?,?);`,
            [modelo, placa, ano, cor, valor, idCliente, idMontadora]
        );

        return {
            id: result.insertId,
            modelo,
            placa,
            ano,
            cor,
            valor,
            idCliente,
            idMontadora
        };
    }
}
