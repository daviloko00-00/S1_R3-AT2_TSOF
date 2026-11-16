import app from '../src/app.js';
import request from 'supertest';
import axios from 'axios';

import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
    expect
} from 'vitest';

import { clearDatabase } from './utils/clearDatabase.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { ClientFactory } from './factories/ClienteFactory.js';
import { VeiculosFactory } from './factories/VeiculosFactory.js';

/*
================================================================================
SUÍTE DE TESTES DE INTEGRAÇÃO - ACORDO COM DOCUMENTAÇÃO (CT-001 A CT-028)
================================================================================

A API externa de CEP é a única dependência simulada. O restante do fluxo
(rotas, controllers, models, repositories e MySQL) é exercitado de verdade no
banco de testes configurado em .env.test e recriado por test/globalSetup.js.
*/

vi.mock('axios');

const ENDERECO_VIA_CEP = {
    cep: '13185-880',
    logradouro: 'Rua das Palmeiras',
    bairro: 'Centro',
    localidade: 'Hortolândia',
    uf: 'SP'
};

beforeEach(() => {
    axios.get.mockResolvedValue({
        data: { ...ENDERECO_VIA_CEP }
    });
});

async function listarClientes() {
    const response = await request(app).get('/clientes');
    return response.body.data;
}

async function listarMontadoras() {
    const response = await request(app).get('/montadoras');
    return response.body.data;
}

async function listarVeiculos() {
    const response = await request(app).get('/veiculos');
    return response.body.data;
}

describe('Testes de Integração - API de Montadoras', () => {

    beforeEach(async () => {
        await MontadoraFactory.create('Toyota', 'Japão');
        await MontadoraFactory.create('Honda', 'Japão');
        await MontadoraFactory.create('Ford', 'USA');
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    /*
    CT-009
    Título: Realizar cadastro de Montadoras
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para criação da montadora
    */
    it('CT-009 - Deve criar uma montadora com sucesso', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Hyundai',
                pais: 'Coreia'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Montadora criada com sucesso');

        const montadoras = await listarMontadoras();
        expect(montadoras).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Nome: 'Hyundai',
                Pais: 'Coreia'
            })
        ]));
    });

    /*
    CT-010
    Título: Realizar alteração de montadoras
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para alteração da montadora
    */
    it('CT-010 - Deve alterar uma montadora com sucesso', async () => {
        const montadora = await MontadoraFactory.create('Volkswagen', 'Alemanha');

        const response = await request(app)
            .put(`/montadoras/?id=${montadora.id}`)
            .send({
                nome: 'Volkswagen Atualizada',
                pais: 'Alemanha'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Montadora atualizada com sucesso');

        const montadoras = await listarMontadoras();
        expect(montadoras).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Id: montadora.id,
                Nome: 'Volkswagen Atualizada',
                Pais: 'Alemanha'
            })
        ]));
    });

    /*
    CT-011
    Título: Realizar exclusão de Montadora
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão da montadora
    */
    it('CT-011 - Deve excluir uma montadora com sucesso', async () => {
        const montadora = await MontadoraFactory.create('Chevrolet', 'USA');

        const response = await request(app)
            .delete(`/montadoras/${montadora.id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Montadora deletada com sucesso');

        const montadoras = await listarMontadoras();
        expect(montadoras.some(item => item.Id === montadora.id)).toBe(false);
    });

    /*
    CT-012
    Título: Realizar exclusão de Montadora vinculada a um veículo
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão da montadora
    Resultado encontrado: A montadora estava vinculada à um veículo, não podendo ser excluída
    Status: FALHA
    */
    it('CT-012 - Não deve excluir uma montadora vinculada a um veículo', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        await VeiculosFactory.create({
            modelo: 'Uno',
            montadoraId: montadora.id
        });

        const response = await request(app)
            .delete(`/montadoras/${montadora.id}`);

        expect(response.status).toBe(409);
        expect(response.body.message).toMatch(/vinculada/i);

        const montadoras = await listarMontadoras();
        expect(montadoras.some(item => item.Id === montadora.id)).toBe(true);
    });

    /*
    CT-017
    Título: Realizar consulta de Montadora
    Resultado esperado: O sistema deve responder a requisição com a listagem das montadoras
    */
    it('CT-017 - Deve listar as montadoras cadastradas', async () => {
        const response = await request(app)
            .get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Montadoras selecionadas com sucesso');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(3);
        expect(response.body.data.map(item => item.Nome)).toEqual(
            expect.arrayContaining(['Toyota', 'Honda', 'Ford'])
        );
    });

    /*
    CT-018
    Título: Realizar consulta de Montadoras vazia
    Resultado esperado: O sistema deve responder a requisição com a listagem das montadoras
    Resultado encontrado: Há resposta de um array vazio pois não tem montadoras registradas
    */
    it('CT-018 - Deve retornar resposta vazia quando não houver montadoras cadastradas', async () => {
        await clearDatabase();

        const response = await request(app)
            .get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    /*
    CT-021
    Título: Realizar cadastro de montadora com nome duplicado
    Resultado esperado: O sistema deve impedir o cadastro duplicado e retornar uma mensagem informando a duplicidade.
    */
    it('CT-021 - Não deve permitir o cadastro de uma montadora com nome duplicado', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'toyota',
                pais: 'Japão'
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toMatch(/duplicado/i);
    });

    /*
    CT-024
    Título: Realizar alteração de montadora com dados inválidos
    Resultado esperado: O sistema deve rejeitar a alteração e retornar mensagem de validação dos dados.
    */
    it('CT-024 - Não deve alterar uma montadora quando os dados forem inválidos', async () => {
        const montadora = await MontadoraFactory.create('BMW', 'Alemanha');

        const response = await request(app)
            .put(`/montadoras/?id=${montadora.id}`)
            .send({
                nome: '',
                pais: ''
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/validação/i);
        expect(response.body.error).toMatch(/inválido/i);
    });

    /*
    CT-027
    Título: Realizar exclusão de montadora inexistente
    Resultado esperado: O sistema deve rejeitar a exclusão e informar que a montadora não foi encontrada.
    */
    it('CT-027 - Não deve excluir uma montadora inexistente', async () => {
        const idInexistente = 999999;

        const response = await request(app)
            .delete(`/montadoras/${idInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Montadora não encontrada');
    });

});

describe('Testes de Integração - API de Clientes', () => {

    beforeEach(async () => {
        await ClientFactory.create(
            'Carlos Alberto',
            '11122233344',
            '13185880',
            'Rua das Palmeiras',
            'Centro',
            'Hortolândia',
            'SP',
            '100'
        );
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    /*
    CT-001
    Título: Realizar cadastro de Cliente
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para criação do cliente
    Resultado encontrado: O cliente é criado no sistema e salvo no banco de dados
    */
    it('CT-001 - Deve criar um cliente com sucesso', async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Florisvaldo Junior',
                cpf: '123.456.789-01',
                cep: '13185-880',
                numero: 123,
                complemento: 'Apenas um teste!',
                email: 'florisvaldo@teste.com'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Cliente criado com sucesso');

        const clientes = await listarClientes();
        expect(clientes).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Nome: 'Florisvaldo Junior',
                CPF: '12345678901',
                CEP: '13185880',
                Logradouro: ENDERECO_VIA_CEP.logradouro,
                Bairro: ENDERECO_VIA_CEP.bairro,
                Cidade: ENDERECO_VIA_CEP.localidade,
                UF: ENDERECO_VIA_CEP.uf,
                Numero: '123',
                Complemento: 'Apenas um teste!',
                Email: 'florisvaldo@teste.com'
            })
        ]));
    });

    /*
    CT-002
    Título: Realizar alteração de cliente
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para alteração do cliente
    Resultado encontrado: O cliente é alterado no sistema e salvo no banco de dados
    */
    it('CT-002 - Deve alterar um cliente com sucesso', async () => {
        const cliente = await ClientFactory.create(
            'Mariana Silva',
            '98765432100',
            '13185880',
            'Rua Antiga',
            'Centro',
            'Hortolândia',
            'SP',
            '50'
        );

        const response = await request(app)
            .put(`/clientes/?id=${cliente.id}`)
            .send({
                nome: 'Mariana Silva Souza',
                cpf: '98765432100',
                cep: '13185-880',
                numero: '150',
                complemento: 'Bloco B',
                email: 'mariana@teste.com'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cliente atualizado com sucesso');

        const clientes = await listarClientes();
        expect(clientes).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Id: cliente.id,
                Nome: 'Mariana Silva Souza',
                Numero: '150',
                Complemento: 'Bloco B',
                Email: 'mariana@teste.com'
            })
        ]));
    });

    /*
    CT-003
    Título: Realizar exclusão de cliente
    Pré-condições: O cliente a ser excluído não pode estar vinculado à um carro
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão do cliente
    Resultado encontrado: O cliente é excluído no sistema e salvo no banco de dados
    */
    it('CT-003 - Deve excluir um cliente com sucesso', async () => {
        const cliente = await ClientFactory.create(
            'José Pereira',
            '55566677788',
            '13185880'
        );

        const response = await request(app)
            .delete(`/clientes/${cliente.id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cliente deletado com sucesso');

        const clientes = await listarClientes();
        expect(clientes.some(item => item.Id === cliente.id)).toBe(false);
    });

    /*
    CT-004
    Título: Realizar exclusão de cliente vinculado a um veículo
    Pré-condições: O cliente a ser excluído não pode estar vinculado à um carro
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão do cliente
    Resultado encontrado: O cliente estava vinculado à um veículo, não podendo ser excluído
    Status: FALHA
    */
    it('CT-004 - Não deve excluir um cliente vinculado a um veículo', async () => {
        const cliente = await ClientFactory.create(
            'Fernanda Lima',
            '33344455566',
            '13185880'
        );

        await VeiculosFactory.create({
            modelo: 'Civic',
            clienteId: cliente.id
        });

        const response = await request(app)
            .delete(`/clientes/${cliente.id}`);

        expect(response.status).toBe(409);
        expect(response.body.message).toMatch(/vinculado/i);

        const clientes = await listarClientes();
        expect(clientes.some(item => item.Id === cliente.id)).toBe(true);
    });

    /*
    CT-015
    Título: Realizar consulta de Clientes
    Resultado esperado: O sistema deve responder a requisição com a listagem dos clientes
    Resultado encontrado: Os clientes são listados
    */
    it('CT-015 - Deve listar os clientes cadastrados', async () => {
        const response = await request(app)
            .get('/clientes');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Clientes selecionados com sucesso');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ Nome: 'Carlos Alberto' })
        ]));
    });

    /*
    CT-016
    Título: Realizar consulta de Clientes vazia
    Resultado esperado: O sistema deve responder a requisição com a listagem dos clientes
    Resultado encontrado: Há resposta de um array vazio pois não tem clientes registrados
    */
    it('CT-016 - Deve retornar resposta vazia quando não houver clientes cadastrados', async () => {
        await clearDatabase();

        const response = await request(app)
            .get('/clientes');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    /*
    CT-019
    Título: Realizar cadastro de cliente com dados obrigatórios ausentes
    Pré-condições: O usuário deve acessar o endpoint de cadastro de clientes e possuir dados incompletos.
    Resultado esperado: O sistema deve rejeitar o cadastro e informar quais campos obrigatórios estão ausentes.
    */
    it('CT-019 - Deve rejeitar cadastro de cliente com dados obrigatórios ausentes', async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Cliente Incompleto'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('obrigatórios');
        expect(response.body.camposAusentes).toEqual(
            expect.arrayContaining(['cpf', 'cep', 'numero'])
        );
    });

    /*
    CT-022
    Título: Realizar alteração de cliente sem informar ID
    Pré-condições: Deve existir um cliente cadastrado no sistema.
    Resultado esperado: O sistema deve rejeitar a alteração e informar que o cliente não foi encontrado ou que o ID é obrigatório.
    */
    it('CT-022 - Deve rejeitar alteração de cliente sem informar ID ou com ID inválido', async () => {
        const response = await request(app)
            .put('/clientes')
            .send({
                nome: 'Nome Sem ID',
                cpf: '12345678901',
                cep: '13185880',
                numero: '10'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/ID/i);
    });

    /*
    CT-025
    Título: Realizar exclusão de cliente inexistente
    Pré-condições: Não deve existir cliente cadastrado com o ID informado.
    Resultado esperado: O sistema deve rejeitar a exclusão e informar que o cliente não foi encontrado.
    */
    it('CT-025 - Deve rejeitar exclusão de cliente inexistente', async () => {
        const idInexistente = 999999;

        const response = await request(app)
            .delete(`/clientes/${idInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Cliente não encontrado');
    });

    /*
    CT-028
    Título: Realizar cadastro de cliente com e-mail já cadastrado
    Pré-condições: Deve existir um cliente cadastrado com o e-mail informado.
    Resultado esperado: O sistema deve impedir o cadastro duplicado e retornar mensagem informando que o e-mail já está cadastrado.
    */
    it('CT-028 - Não deve permitir cadastro duplicado de cliente com mesmo e-mail', async () => {
        const primeiroCadastro = await request(app)
            .post('/clientes')
            .send({
                nome: 'Cliente Original',
                cpf: '88877766655',
                cep: '13185-880',
                numero: '200',
                email: 'duplicado@teste.com'
            });

        expect(primeiroCadastro.status).toBe(201);

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Cliente Duplicado',
                cpf: '77766655544',
                cep: '13185-880',
                numero: '201',
                email: 'DUPLICADO@TESTE.COM'
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('E-mail já cadastrado');

        const clientes = await listarClientes();
        expect(clientes.filter(item => item.Email === 'duplicado@teste.com')).toHaveLength(1);
    });

    /*
    Complemento do CT-028: duplicidade de CPF também deve ser impedida.
    */
    it('CT-028 - Não deve permitir cadastro duplicado de cliente com mesmo CPF', async () => {
        const primeiroCadastro = await request(app)
            .post('/clientes')
            .send({
                nome: 'Cliente CPF Original',
                cpf: '88877766655',
                cep: '13185-880',
                numero: '200'
            });

        expect(primeiroCadastro.status).toBe(201);

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Cliente CPF Duplicado',
                cpf: '888.777.666-55',
                cep: '13185-880',
                numero: '201'
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('CPF já cadastrado');
    });

});

describe('Testes de Integração - API de Veículos', () => {

    let montadoraPadrao;
    let clientePadrao;

    beforeEach(async () => {
        montadoraPadrao = await MontadoraFactory.create('Chevrolet', 'USA');
        clientePadrao = await ClientFactory.create('Ana Paula', '99988877766', '13185880');
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    /*
    CT-005
    Título: Realizar cadastro de Veículo
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para criação do veículo
    Resultado encontrado: O veículo é criado no sistema e salvo no banco de dados
    */
    it('CT-005 - Deve criar um veículo com sucesso', async () => {
        const response = await request(app)
            .post('/veiculos')
            .send({
                idMontadora: montadoraPadrao.id,
                idCliente: clientePadrao.id,
                modelo: 'Onix',
                placa: 'BRA2E19',
                ano: 2022,
                cor: 'Prata',
                valor: 65000.00
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Veículo criado com sucesso');

        const veiculos = await listarVeiculos();
        expect(veiculos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                IdMontadora: montadoraPadrao.id,
                IdCliente: clientePadrao.id,
                Montadora: 'Chevrolet',
                Cliente: 'Ana Paula',
                Modelo: 'Onix',
                Placa: 'BRA2E19',
                Ano: 2022,
                Cor: 'Prata'
            })
        ]));
    });

    /*
    CT-006
    Título: Realizar alteração de veículo
    Resultado esperado: O sistema deve utilizar todos os dados fornecidos para alteração do veículo
    Resultado encontrado: O veículo é alterado no sistema e salvo no banco de dados
    */
    it('CT-006 - Deve alterar um veículo com sucesso', async () => {
        const veiculo = await VeiculosFactory.create({
            modelo: 'Cruze',
            placa: 'CRZ1234',
            ano: 2021,
            cor: 'Branco',
            valor: 90000.00,
            montadoraId: montadoraPadrao.id,
            clienteId: clientePadrao.id
        });

        const response = await request(app)
            .put(`/veiculos/?id=${veiculo.id}`)
            .send({
                idMontadora: montadoraPadrao.id,
                idCliente: clientePadrao.id,
                modelo: 'Cruze Turbo',
                placa: 'CRZ1234',
                ano: 2022,
                cor: 'Preto',
                valor: 98000.00
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Veículo atualizado com sucesso');

        const veiculos = await listarVeiculos();
        expect(veiculos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Id: veiculo.id,
                Modelo: 'Cruze Turbo',
                Ano: 2022,
                Cor: 'Preto'
            })
        ]));
    });

    /*
    CT-007
    Título: Realizar exclusão de veículo
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão veículo
    Resultado encontrado: O veículo é excluído no sistema e salvo no banco de dados
    */
    it('CT-007 - Deve excluir um veículo com sucesso', async () => {
        const veiculo = await VeiculosFactory.create({
            modelo: 'Tracker',
            montadoraId: montadoraPadrao.id,
            clienteId: clientePadrao.id
        });

        const response = await request(app)
            .delete(`/veiculos/${veiculo.id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Veículo deletado com sucesso');

        const veiculos = await listarVeiculos();
        expect(veiculos.some(item => item.Id === veiculo.id)).toBe(false);
    });

    /*
    CT-008
    Título: Realizar exclusão de veículo inexistente
    Resultado esperado: O sistema deve utilizar os dados fornecidos para exclusão do cliente/veículo
    Resultado encontrado: Veículo não existente
    Status: FALHA
    */
    it('CT-008 - Deve rejeitar exclusão de veículo não existente', async () => {
        const idInexistente = 999999;

        const response = await request(app)
            .delete(`/veiculos/${idInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Veículo não encontrado');
    });

    /*
    CT-013
    Título: Realizar consulta de Veículo
    Resultado esperado: O sistema deve responder a requisição com a listagem dos veículos
    Resultado encontrado: Os veículos são listados
    */
    it('CT-013 - Deve listar os veículos cadastrados', async () => {
        await VeiculosFactory.create({
            modelo: 'Spin',
            montadoraId: montadoraPadrao.id,
            clienteId: clientePadrao.id
        });

        const response = await request(app)
            .get('/veiculos');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Veículos selecionados com sucesso');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({
                Modelo: 'Spin',
                Montadora: 'Chevrolet',
                Cliente: 'Ana Paula'
            })
        ]));
    });

    /*
    CT-014
    Título: Realizar consulta de Veículo vazia
    Resultado esperado: O sistema deve responder a requisição com a listagem dos veículos
    Resultado encontrado: Há resposta de um array vazio pois não tem veículos registrados
    */
    it('CT-014 - Deve retornar resposta vazia quando não houver veículos cadastrados', async () => {
        await clearDatabase();

        const response = await request(app)
            .get('/veiculos');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    /*
    CT-020
    Título: Realizar cadastro de veículo com dados inválidos
    Resultado esperado: O sistema deve rejeitar o cadastro e retornar mensagem de validação dos dados.
    */
    it('CT-020 - Deve rejeitar cadastro de veículo com dados inválidos', async () => {
        const response = await request(app)
            .post('/veiculos')
            .send({
                idMontadora: montadoraPadrao.id,
                idCliente: clientePadrao.id,
                modelo: '',
                placa: '123',
                ano: 1800,
                cor: '',
                valor: -100
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/validação/i);
        expect(response.body.error).toMatch(/Modelo inválido/i);
    });

    /*
    CT-023
    Título: Realizar alteração de veículo inexistente
    Resultado esperado: O sistema deve rejeitar a alteração e retornar mensagem informando que o veículo não foi encontrado.
    */
    it('CT-023 - Deve rejeitar alteração de veículo inexistente', async () => {
        const idInexistente = 999999;

        const response = await request(app)
            .put(`/veiculos/?id=${idInexistente}`)
            .send({
                idMontadora: montadoraPadrao.id,
                idCliente: clientePadrao.id,
                modelo: 'Modelo Teste',
                placa: 'XYZ9876',
                ano: 2022,
                cor: 'Preto',
                valor: 50000.00
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Veículo não encontrado');
    });

    /*
    CT-026
    Título: Realizar exclusão de veículo inexistente
    Resultado esperado: O sistema deve rejeitar a exclusão e informar que o veículo não foi encontrado.
    */
    it('CT-026 - Deve rejeitar exclusão de veículo com ID inexistente', async () => {
        const idInexistente = 999999;

        const response = await request(app)
            .delete(`/veiculos/${idInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Veículo não encontrado');
    });

});
