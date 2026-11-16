import { describe, it, expect, vi, beforeEach } from 'vitest';
import clienteController from '../../controllers/clienteController.js';
import clienteRepository from '../../repositories/clienteRepository.js';
import * as consultarCepModule from '../../utils/consultarCep.js';

vi.mock('../../repositories/clienteRepository.js');
vi.mock('../../utils/consultarCep.js');

function mockResponse() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('Testes Unitários com Mocks - clienteController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar um cliente com sucesso chamando o mock do ViaCep e do repositório', async () => {
        const req = {
            body: {
                nome: 'Carlos Drummond',
                cpf: '123.456.789-00',
                cep: '13185-880',
                numero: '123',
                complemento: 'Bloco A'
            }
        };
        const res = mockResponse();

        clienteRepository.buscarPorCpf.mockResolvedValueOnce(null);
        vi.spyOn(consultarCepModule, 'consultarCep').mockResolvedValueOnce({
            cep: '13185880',
            logradouro: 'Rua Poeta',
            bairro: 'Jardins',
            cidade: 'Itabira',
            uf: 'MG'
        });
        clienteRepository.criar.mockResolvedValueOnce({ insertId: 10 });

        await clienteController.criar(req, res);

        expect(clienteRepository.buscarPorCpf).toHaveBeenCalledWith('12345678900');
        expect(consultarCepModule.consultarCep).toHaveBeenCalledWith('13185-880');
        expect(clienteRepository.criar).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 quando faltarem campos obrigatórios', async () => {
        const req = {
            body: {
                nome: 'Incompleto'
            }
        };
        const res = mockResponse();

        await clienteController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(clienteRepository.criar).not.toHaveBeenCalled();
    });

    it('deve retornar 409 quando o CPF já estiver cadastrado', async () => {
        const req = {
            body: {
                nome: 'Carlos Repetido',
                cpf: '123.456.789-00',
                cep: '13185-880',
                numero: '123'
            }
        };
        const res = mockResponse();

        clienteRepository.buscarPorCpf.mockResolvedValueOnce({ id: 1, CPF: '12345678900' });

        await clienteController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(clienteRepository.criar).not.toHaveBeenCalled();
    });

    it('deve retornar 409 quando o e-mail já estiver cadastrado para outro cliente', async () => {
        const req = {
            body: {
                nome: 'Cliente com E-mail Repetido',
                cpf: '22233344455',
                cep: '13185-880',
                numero: '10',
                email: 'repetido@teste.com'
            }
        };
        const res = mockResponse();

        clienteRepository.buscarPorCpf.mockResolvedValueOnce(null);
        clienteRepository.buscarPorEmail.mockResolvedValueOnce({ Id: 2, Email: 'repetido@teste.com' });

        await clienteController.criar(req, res);

        expect(clienteRepository.buscarPorEmail).toHaveBeenCalledWith('repetido@teste.com');
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'E-mail já cadastrado'
        }));
        expect(clienteRepository.criar).not.toHaveBeenCalled();
    });

    it('deve retornar 404 ao tentar atualizar cliente inexistente', async () => {
        const req = {
            params: { id: '999' },
            body: {
                nome: 'Novo Nome',
                cpf: '12345678901',
                cep: '13185880',
                numero: '10'
            }
        };
        const res = mockResponse();

        clienteRepository.buscarPorId.mockResolvedValueOnce(null);

        await clienteController.atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 409 ao tentar deletar cliente com veículos vinculados', async () => {
        const req = {
            params: { id: '5' }
        };
        const res = mockResponse();

        clienteRepository.buscarPorId.mockResolvedValueOnce({ id: 5, Nome: 'Cliente com Carro' });
        clienteRepository.contarVeiculosVinculados.mockResolvedValueOnce(1);

        await clienteController.deletar(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(clienteRepository.deletar).not.toHaveBeenCalled();
    });

    it('deve atualizar um cliente com sucesso', async () => {
        const req = {
            params: { id: '7' },
            body: {
                nome: 'Cliente Atualizado',
                cpf: '12345678901',
                cep: '13185-880',
                numero: '50',
                email: 'atualizado@teste.com'
            }
        };
        const res = mockResponse();

        clienteRepository.buscarPorId.mockResolvedValueOnce({ Id: 7, Email: 'antigo@teste.com' });
        clienteRepository.buscarPorEmail.mockResolvedValueOnce(null);
        vi.spyOn(consultarCepModule, 'consultarCep').mockResolvedValueOnce({
            cep: '13185880',
            logradouro: 'Rua Nova',
            bairro: 'Centro',
            cidade: 'Hortolândia',
            uf: 'SP'
        });
        clienteRepository.editar.mockResolvedValueOnce({ affectedRows: 1 });

        await clienteController.atualizar(req, res);

        expect(clienteRepository.editar).toHaveBeenCalledWith(expect.objectContaining({
            id: 7,
            email: 'atualizado@teste.com'
        }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve deletar um cliente sem veículos vinculados com sucesso', async () => {
        const req = {
            params: { id: '8' }
        };
        const res = mockResponse();

        clienteRepository.buscarPorId.mockResolvedValueOnce({ Id: 8, Nome: 'Cliente Livre' });
        clienteRepository.contarVeiculosVinculados.mockResolvedValueOnce(0);
        clienteRepository.deletar.mockResolvedValueOnce({ affectedRows: 1 });

        await clienteController.deletar(req, res);

        expect(clienteRepository.deletar).toHaveBeenCalledWith(8);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 400 quando o ID do cliente for inválido', async () => {
        const req = {
            params: { id: '0' }
        };
        const res = mockResponse();

        await clienteController.deletar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(clienteRepository.deletar).not.toHaveBeenCalled();
    });

    it('deve listar clientes com status 200', async () => {
        const req = {};
        const res = mockResponse();
        const lista = [{ Id: 1, Nome: 'Cliente 1' }, { Id: 2, Nome: 'Cliente 2' }];

        clienteRepository.selecionar.mockResolvedValueOnce(lista);

        await clienteController.selecionar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Clientes selecionados com sucesso',
            data: lista
        });
    });
});

