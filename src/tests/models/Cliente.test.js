import { describe, it, expect } from 'vitest';
import { Cliente } from '../../models/Cliente.js';

describe('Testes Unitários - Model Cliente', () => {
    const dadosValidos = {
        nome: 'João Silva',
        cpf: '12345678901',
        cep: '13185880',
        logradouro: 'Rua Principal',
        bairro: 'Centro',
        cidade: 'Campinas',
        uf: 'SP',
        numero: '100',
        complemento: 'Apto 1',
        email: 'joao.silva@teste.com'
    };

    it('deve instanciar um Cliente com dados válidos', () => {
        const cliente = new Cliente(
            dadosValidos.nome,
            dadosValidos.cpf,
            dadosValidos.cep,
            dadosValidos.logradouro,
            dadosValidos.bairro,
            dadosValidos.cidade,
            dadosValidos.uf,
            dadosValidos.numero,
            dadosValidos.complemento,
            10,
            dadosValidos.email
        );

        expect(cliente.id).toBe(10);
        expect(cliente.nome).toBe('João Silva');
        expect(cliente.cpf).toBe('12345678901');
        expect(cliente.cep).toBe('13185880');
        expect(cliente.uf).toBe('SP');
        expect(cliente.email).toBe('joao.silva@teste.com');
    });

    it('deve criar cliente via método estático criar', () => {
        const cliente = Cliente.criar(dadosValidos);
        expect(cliente.id).toBeNull();
        expect(cliente.nome).toBe('João Silva');
    });

    it('deve editar cliente via método estático editar', () => {
        const cliente = Cliente.editar(dadosValidos, 20);
        expect(cliente.id).toBe(20);
    });

    it('deve lançar erro se o nome for muito curto ou ausente', () => {
        expect(() => Cliente.criar({ ...dadosValidos, nome: 'Oi' })).toThrow('Nome inválido');
        expect(() => Cliente.criar({ ...dadosValidos, nome: '' })).toThrow('Nome inválido');
    });

    it('deve lançar erro se o CPF for ausente', () => {
        expect(() => Cliente.criar({ ...dadosValidos, cpf: '' })).toThrow('CPF inválido');
    });

    it('deve lançar erro se o ID for menor ou igual a zero', () => {
        expect(() => Cliente.editar(dadosValidos, 0)).toThrow('ID inválido');
        expect(() => Cliente.editar(dadosValidos, -5)).toThrow('ID inválido');
    });

    it('deve lançar erro se o CEP for inválido', () => {
        expect(() => Cliente.criar({ ...dadosValidos, cep: '123' })).toThrow('CEP inválido');
    });

    it('deve lançar erro se a UF não tiver 2 caracteres', () => {
        expect(() => Cliente.criar({ ...dadosValidos, uf: 'S' })).toThrow('UF inválida');
        expect(() => Cliente.criar({ ...dadosValidos, uf: 'SAO' })).toThrow('UF inválida');
    });

    it('deve lançar erro se logradouro, bairro ou cidade estiverem vazios', () => {
        expect(() => Cliente.criar({ ...dadosValidos, logradouro: '' })).toThrow('Logradouro inválido');
        expect(() => Cliente.criar({ ...dadosValidos, bairro: '' })).toThrow('Bairro inválido');
        expect(() => Cliente.criar({ ...dadosValidos, cidade: '' })).toThrow('Cidade inválido');
    });

    it('deve normalizar o e-mail e aceitar clientes sem e-mail', () => {
        const clienteComEmail = Cliente.criar({ ...dadosValidos, email: '  JOAO.SILVA@TESTE.COM  ' });
        expect(clienteComEmail.email).toBe('joao.silva@teste.com');

        const clienteSemEmail = Cliente.criar({ ...dadosValidos, email: null });
        expect(clienteSemEmail.email).toBeNull();
    });

    it('deve lançar erro se o e-mail for inválido', () => {
        expect(() => Cliente.criar({ ...dadosValidos, email: 'email-invalido' })).toThrow('E-mail inválido');
    });
});

