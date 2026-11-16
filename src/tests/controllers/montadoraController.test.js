import { describe, it, expect, vi, beforeEach } from 'vitest';
import montadoraController from '../../controllers/montadoraController.js';
import montadoraRepository from '../../repositories/montadoraRepository.js';

vi.mock('../../repositories/montadoraRepository.js');

function mockResponse() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('Testes Unitários com Mocks - montadoraController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar uma montadora com sucesso quando os dados forem válidos', async () => {
        const req = {
            body: { nome: 'Toyota', pais: 'Japão' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorNome.mockResolvedValueOnce(null);
        montadoraRepository.criar.mockResolvedValueOnce({ insertId: 1 });

        await montadoraController.criar(req, res);

        expect(montadoraRepository.buscarPorNome).toHaveBeenCalledWith('Toyota');
        expect(montadoraRepository.criar).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Montadora criada com sucesso'
        }));
    });

    it('deve retornar 409 ao tentar criar montadora com nome duplicado', async () => {
        const req = {
            body: { nome: 'Toyota', pais: 'Japão' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorNome.mockResolvedValueOnce({ id: 1, nome: 'Toyota' });

        await montadoraController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(montadoraRepository.criar).not.toHaveBeenCalled();
    });

    it('deve retornar 400 ao tentar criar montadora sem campos obrigatórios', async () => {
        const req = {
            body: { nome: '' }
        };
        const res = mockResponse();

        await montadoraController.criar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve listar montadoras com status 200', async () => {
        const req = {};
        const res = mockResponse();

        const lista = [{ id: 1, nome: 'Fiat' }, { id: 2, nome: 'Ford' }];
        montadoraRepository.selecionar.mockResolvedValueOnce(lista);

        await montadoraController.selecionar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Montadoras selecionadas com sucesso',
            data: lista
        });
    });

    it('deve retornar 404 ao atualizar montadora inexistente', async () => {
        const req = {
            params: { id: '999' },
            body: { nome: 'Inexistente', pais: 'País' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorId.mockResolvedValueOnce(null);

        await montadoraController.atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 409 ao tentar deletar montadora vinculada a veículos', async () => {
        const req = {
            params: { id: '1' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorId.mockResolvedValueOnce({ id: 1, nome: 'Fiat' });
        montadoraRepository.contarVeiculosVinculados.mockResolvedValueOnce(2);

        await montadoraController.deletar(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(montadoraRepository.deletar).not.toHaveBeenCalled();
    });

    it('deve atualizar uma montadora com sucesso', async () => {
        const req = {
            params: { id: '3' },
            body: { nome: 'Fiat Atualizada', pais: 'Itália' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorId.mockResolvedValueOnce({ Id: 3, Nome: 'Fiat' });
        montadoraRepository.editar.mockResolvedValueOnce({ affectedRows: 1 });

        await montadoraController.atualizar(req, res);

        expect(montadoraRepository.editar).toHaveBeenCalledWith(expect.objectContaining({
            id: 3,
            nome: 'Fiat Atualizada'
        }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve deletar uma montadora sem veículos vinculados com sucesso', async () => {
        const req = {
            params: { id: '4' }
        };
        const res = mockResponse();

        montadoraRepository.buscarPorId.mockResolvedValueOnce({ Id: 4, Nome: 'Ford' });
        montadoraRepository.contarVeiculosVinculados.mockResolvedValueOnce(0);
        montadoraRepository.deletar.mockResolvedValueOnce({ affectedRows: 1 });

        await montadoraController.deletar(req, res);

        expect(montadoraRepository.deletar).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 400 quando o ID da montadora for inválido', async () => {
        const req = {
            params: { id: '0' }
        };
        const res = mockResponse();

        await montadoraController.deletar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(montadoraRepository.deletar).not.toHaveBeenCalled();
    });
});

