import { describe, it, expect } from 'vitest';
import { Veiculo } from '../../models/Veiculo.js';

describe('Testes Unitários - Model Veiculo', () => {
    const dadosValidos = {
        idMontadora: 1,
        idCliente: 2,
        modelo: 'Corolla',
        placa: 'ABC1234',
        ano: 2022,
        cor: 'Preto',
        valor: 120000.00
    };

    it('deve instanciar um Veiculo com dados válidos', () => {
        const veiculo = new Veiculo(
            dadosValidos.idMontadora,
            dadosValidos.idCliente,
            dadosValidos.modelo,
            dadosValidos.placa,
            dadosValidos.ano,
            dadosValidos.cor,
            dadosValidos.valor,
            1
        );

        expect(veiculo.id).toBe(1);
        expect(veiculo.modelo).toBe('Corolla');
        expect(veiculo.placa).toBe('ABC1234');
        expect(veiculo.ano).toBe(2022);
        expect(veiculo.valor).toBe(120000.00);
    });

    it('deve criar veículo via método estático criar', () => {
        const veiculo = Veiculo.criar(dadosValidos);
        expect(veiculo.id).toBeNull();
        expect(veiculo.modelo).toBe('Corolla');
    });

    it('deve editar veículo via método estático editar', () => {
        const veiculo = Veiculo.editar(dadosValidos, 15);
        expect(veiculo.id).toBe(15);
    });

    it('deve lançar erro se idMontadora ou idCliente forem inválidos', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, idMontadora: null })).toThrow('ID da montadora inválido');
        expect(() => Veiculo.criar({ ...dadosValidos, idCliente: 0 })).toThrow('ID do cliente inválido');
    });

    it('deve lançar erro se modelo for muito curto ou ausente', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, modelo: 'A' })).toThrow('Modelo inválido');
        expect(() => Veiculo.criar({ ...dadosValidos, modelo: '' })).toThrow('Modelo inválido');
    });

    it('deve lançar erro se a placa for inválida', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, placa: '12' })).toThrow('Placa inválida');
    });

    it('deve lançar erro se a cor for inválida', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, cor: 'A' })).toThrow('Cor inválida');
    });

    it('deve lançar erro se o ID for menor ou igual a zero', () => {
        expect(() => Veiculo.editar(dadosValidos, 0)).toThrow('ID inválido');
        expect(() => Veiculo.editar(dadosValidos, -1)).toThrow('ID inválido');
    });

    it('deve lançar erro se o ano for inválido', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, ano: 1800 })).toThrow('Ano inválido');
        expect(() => Veiculo.criar({ ...dadosValidos, ano: null })).toThrow('Ano inválido');
    });

    it('deve lançar erro se o valor for menor ou igual a zero', () => {
        expect(() => Veiculo.criar({ ...dadosValidos, valor: 0 })).toThrow('Valor inválido');
        expect(() => Veiculo.criar({ ...dadosValidos, valor: -50 })).toThrow('Valor inválido');
    });
});

