import { describe, it, expect, vi, beforeEach } from 'vitest';
import veiculoController from '../../controllers/veiculoController.js';
import veiculoRepository from '../../repositories/veiculoRepository.js';

vi.mock('../../repositories/veiculoRepository.js');

function mockResponse() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('Testes Unitários com Mocks - veiculoController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar um veículo com sucesso quando os dados forem válidos', async () => {
        const req = {
            body: {
                idMontadora: 1,
                idCliente: 2,
                modelo: 'Civic',
                placa: 'ABC1234',
                ano: 2022,
                cor: 'Preto',
                valor: 90000.00
            }
        };
        const res = mockResponse();

        veiculoRepository.criar.mockResolvedValueOnce({ insertId: 50 });

        await veiculoController.criar(req, res);

        expect(veiculoRepository.criar).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 ao tentar criar veículo com dados inválidos', async () => {
        const req = {
            body: {
                modelo: ''
            }
        };
        const res = mockResponse();

        await veiculoController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(veiculoRepository.criar).not.toHaveBeenCalled();
    });

    it('deve retornar 404 ao tentar atualizar veículo inexistente', async () => {
        const req = {
            params: { id: '9999' },
            body: {
                idMontadora: 1,
                idCliente: 2,
                modelo: 'Civic',
                placa: 'ABC1234',
                ano: 2022,
                cor: 'Preto',
                valor: 90000.00
            }
        };
        const res = mockResponse();

        veiculoRepository.buscarPorId.mockResolvedValueOnce(null);

        await veiculoController.atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(veiculoRepository.editar).not.toHaveBeenCalled();
    });

    it('deve deletar veículo existente com sucesso retornando 200', async () => {
        const req = {
            params: { id: '10' }
        };
        const res = mockResponse();

        veiculoRepository.buscarPorId.mockResolvedValueOnce({ id: 10, Modelo: 'Civic' });
        veiculoRepository.deletar.mockResolvedValueOnce({ affectedRows: 1 });

        await veiculoController.deletar(req, res);

        expect(veiculoRepository.buscarPorId).toHaveBeenCalledWith(10);
        expect(veiculoRepository.deletar).toHaveBeenCalledWith(10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve listar veículos retornando status 200', async () => {
        const req = {};
        const res = mockResponse();

        const lista = [{ id: 1, modelo: 'Civic' }, { id: 2, modelo: 'Corolla' }];
        veiculoRepository.selecionar.mockResolvedValueOnce(lista);

        await veiculoController.selecionar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Veículos selecionados com sucesso',
            data: lista
        });
    });

    it('deve atualizar um veículo com sucesso', async () => {
        const req = {
            params: { id: '6' },
            body: {
                idMontadora: 1,
                idCliente: 2,
                modelo: 'Civic Touring',
                placa: 'ABC1234',
                ano: 2023,
                cor: 'Cinza',
                valor: 120000.00
            }
        };
        const res = mockResponse();

        veiculoRepository.buscarPorId.mockResolvedValueOnce({ Id: 6, Modelo: 'Civic' });
        veiculoRepository.editar.mockResolvedValueOnce({ affectedRows: 1 });

        await veiculoController.atualizar(req, res);

        expect(veiculoRepository.editar).toHaveBeenCalledWith(expect.objectContaining({
            id: 6,
            modelo: 'Civic Touring'
        }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 ao tentar deletar veículo inexistente', async () => {
        const req = {
            params: { id: '9999' }
        };
        const res = mockResponse();

        veiculoRepository.buscarPorId.mockResolvedValueOnce(null);

        await veiculoController.deletar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(veiculoRepository.deletar).not.toHaveBeenCalled();
    });

    it('deve retornar 400 ao tentar atualizar veículo com ID inválido', async () => {
        const req = {
            params: { id: '0' },
            body: {}
        };
        const res = mockResponse();

        await veiculoController.atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(veiculoRepository.editar).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando o repositório informar referência inexistente', async () => {
        const erro = new Error('Cannot add or update a child row');
        erro.code = 'ER_NO_REFERENCED_ROW_2';
        erro.errno = 1452;

        const req = {
            body: {
                idMontadora: 999,
                idCliente: 999,
                modelo: 'Civic',
                placa: 'ABC1234',
                ano: 2022,
                cor: 'Preto',
                valor: 90000.00
            }
        };
        const res = mockResponse();

        veiculoRepository.criar.mockRejectedValueOnce(erro);

        await veiculoController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

