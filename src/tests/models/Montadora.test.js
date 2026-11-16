import { describe, it, expect } from 'vitest';
import { Montadora } from '../../models/Montadora.js';

describe('Testes Unitários - Model Montadora', () => {
    it('deve instanciar uma Montadora com dados válidos', () => {
        const montadora = new Montadora('Fiat', 'Itália', 1);

        expect(montadora.id).toBe(1);
        expect(montadora.nome).toBe('Fiat');
        expect(montadora.pais).toBe('Itália');
    });

    it('deve permitir criar montadora através do método estático criar', () => {
        const montadora = Montadora.criar({ nome: 'Honda', pais: 'Japão' });

        expect(montadora.id).toBeNull();
        expect(montadora.nome).toBe('Honda');
        expect(montadora.pais).toBe('Japão');
    });

    it('deve permitir editar montadora através do método estático editar', () => {
        const montadora = Montadora.editar({ nome: 'Honda Atualizada', pais: 'Japão' }, 5);

        expect(montadora.id).toBe(5);
        expect(montadora.nome).toBe('Honda Atualizada');
    });

    it('deve lançar erro se o nome for inválido (menor que 3 caracteres ou nulo)', () => {
        expect(() => new Montadora('ab', 'Brasil')).toThrow('Nome inválido');
        expect(() => new Montadora('', 'Brasil')).toThrow('Nome inválido');
        expect(() => new Montadora(null, 'Brasil')).toThrow('Nome inválido');
    });

    it('deve lançar erro se o país for inválido (menor que 2 caracteres ou nulo)', () => {
        expect(() => new Montadora('Toyota', 'A')).toThrow('País inválido');
        expect(() => new Montadora('Toyota', '')).toThrow('País inválido');
        expect(() => new Montadora('Toyota', null)).toThrow('País inválido');
    });

    it('deve lançar erro se o ID for menor ou igual a zero', () => {
        expect(() => new Montadora('Toyota', 'Japão', 0)).toThrow('ID inválido');
        expect(() => new Montadora('Toyota', 'Japão', -1)).toThrow('ID inválido');
    });
});

