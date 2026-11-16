import { describe, it, expect } from 'vitest';
import { limparNumero } from '../../utils/limparNumero.js';

describe('Testes Unitários - limparNumero', () => {
    it('deve remover caracteres não numéricos de uma string', () => {
        const resultado = limparNumero('123.456.789-00');
        expect(resultado).toBe('12345678900');
    });

    it('deve retornar string vazia ao receber null ou undefined', () => {
        expect(limparNumero(null)).toBe('');
        expect(limparNumero(undefined)).toBe('');
    });

    it('deve manter apenas números quando receber um número ou texto misto', () => {
        expect(limparNumero('CEP: 13.185-880')).toBe('13185880');
        expect(limparNumero(12345)).toBe('12345');
    });
});

