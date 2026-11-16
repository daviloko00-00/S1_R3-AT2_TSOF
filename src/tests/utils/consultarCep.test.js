import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { consultarCep } from '../../utils/consultarCep.js';

vi.mock('axios');

describe('Testes Unitários com Mock - consultarCep', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar os dados formatados do endereço quando o CEP for válido', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                cep: '13185-880',
                logradouro: 'Rua das Flores',
                bairro: 'Jardim Paulista',
                localidade: 'Campinas',
                uf: 'SP'
            }
        });

        const resultado = await consultarCep('13.185-880');

        expect(axios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/13185880/json/');
        expect(resultado).toEqual({
            cep: '13185880',
            logradouro: 'Rua das Flores',
            bairro: 'Jardim Paulista',
            cidade: 'Campinas',
            uf: 'SP'
        });
    });

    it('deve lançar erro quando o CEP não tiver 8 dígitos', async () => {
        await expect(consultarCep('123')).rejects.toThrow('CEP inválido');
        expect(axios.get).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando a API retornar erro', async () => {
        axios.get.mockResolvedValueOnce({
            data: { erro: true }
        });

        await expect(consultarCep('99999999')).rejects.toThrow('CEP não encontrado');
    });
});

