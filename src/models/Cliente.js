export class Cliente {
    #id;
    #nome;
    #cpf;
    #cep;
    #logradouro;
    #bairro;
    #cidade;
    #uf;
    #numero;
    #complemento;
    #email;
    #dataCad;

    constructor(pNome, pCpf, pCep, pLogradouro, pBairro, pCidade, pUf, pNumero, pComplemento = null, pId = null, pEmail = null) {
        this.nome = pNome;
        this.cpf = pCpf;
        this.cep = pCep;
        this.logradouro = pLogradouro;
        this.bairro = pBairro;
        this.cidade = pCidade;
        this.uf = pUf;
        this.numero = pNumero;
        this.complemento = pComplemento;
        this.id = pId;
        this.email = pEmail;
    }

    get id() {
        return this.#id;
    }

    get nome() {
        return this.#nome;
    }

    get cpf() {
        return this.#cpf;
    }

    get cep() {
        return this.#cep;
    }

    get logradouro() {
        return this.#logradouro;
    }

    get bairro() {
        return this.#bairro;
    }

    get cidade() {
        return this.#cidade;
    }

    get uf() {
        return this.#uf;
    }

    get numero() {
        return this.#numero;
    }

    get complemento() {
        return this.#complemento;
    }

    get email() {
        return this.#email;
    }

    get dataCad() {
        return this.#dataCad;
    }

    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    set nome(value) {
        this.#validarNome(value);
        this.#nome = value;
    }

    set cpf(value) {
        this.#validarCpf(value);
        this.#cpf = value;
    }

    set cep(value) {
        this.#validarCep(value);
        this.#cep = value;
    }

    set logradouro(value) {
        this.#validarCampoObrigatorio(value, 'Logradouro');
        this.#logradouro = value;
    }

    set bairro(value) {
        this.#validarCampoObrigatorio(value, 'Bairro');
        this.#bairro = value;
    }

    set cidade(value) {
        this.#validarCampoObrigatorio(value, 'Cidade');
        this.#cidade = value;
    }

    set uf(value) {
        this.#validarUf(value);
        this.#uf = value;
    }

    set numero(value) {
        this.#validarCampoObrigatorio(value, 'Número');
        this.#numero = value;
    }

    set complemento(value) {
        this.#complemento = value ?? null;
    }

    set email(value) {
        this.#validarEmail(value);
        this.#email = value ? String(value).trim().toLowerCase() : null;
    }

    #validarId(value) {
        if (value !== null && value !== undefined && value <= 0) {
            throw new Error('ID inválido');
        }
    }

    #validarNome(value) {
        if (!value || value.trim().length < 3 || value.trim().length > 100) {
            throw new Error('Nome inválido');
        }
    }

    #validarCpf(value) {
        if (!value) {
            throw new Error('CPF inválido');
        }
    }

    #validarCep(value) {
        if (!value || String(value).trim().length !== 8) {
            throw new Error('CEP inválido');
        }
    }

    #validarUf(value) {
        if (!value || String(value).trim().length !== 2) {
            throw new Error('UF inválida');
        }
    }

    #validarEmail(value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return;
        }

        const email = String(value).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('E-mail inválido');
        }
    }

    #validarCampoObrigatorio(value, campo) {
        if (!value || String(value).trim().length === 0) {
            throw new Error(`${campo} inválido`);
        }
    }

    static criar(dados) {
        return new Cliente(
            dados.nome,
            dados.cpf,
            dados.cep,
            dados.logradouro,
            dados.bairro,
            dados.cidade,
            dados.uf,
            dados.numero,
            dados.complemento,
            null,
            dados.email
        );
    }

    static editar(dados, id) {
        return new Cliente(
            dados.nome,
            dados.cpf,
            dados.cep,
            dados.logradouro,
            dados.bairro,
            dados.cidade,
            dados.uf,
            dados.numero,
            dados.complemento,
            id,
            dados.email
        );
    }
}