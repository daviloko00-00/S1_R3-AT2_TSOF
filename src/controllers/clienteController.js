import { Cliente } from "../models/Cliente.js";
import clienteRepository from "../repositories/clienteRepository.js";
import { consultarCep } from "../utils/consultarCep.js";
import { limparNumero } from "../utils/limparNumero.js";

const clienteController = {
    criar: async (req, res) => {
        try {
            const { nome, cpf, cep, numero, complemento, email } = req.body || {};

            // CT-019: Realizar cadastro de cliente com dados obrigatórios ausentes
            const camposAusentes = [];
            if (!nome || String(nome).trim() === '') camposAusentes.push('nome');
            if (!cpf || String(cpf).trim() === '') camposAusentes.push('cpf');
            if (!cep || String(cep).trim() === '') camposAusentes.push('cep');
            if (numero === undefined || numero === null || String(numero).trim() === '') camposAusentes.push('numero');

            if (camposAusentes.length > 0) {
                return res.status(400).json({
                    message: 'Campos obrigatórios ausentes',
                    error: `Os seguintes campos são obrigatórios: ${camposAusentes.join(', ')}`,
                    camposAusentes
                });
            }

            const cpfLimpo = limparNumero(cpf);
            const emailInformado = email ? String(email).trim().toLowerCase() : null;

            // CT-028: Realizar cadastro de cliente com e-mail ou CPF já cadastrado
            const clienteComCpf = await clienteRepository.buscarPorCpf(cpfLimpo);
            if (clienteComCpf) {
                return res.status(409).json({
                    message: 'CPF já cadastrado',
                    error: 'O CPF informado já está cadastrado no sistema'
                });
            }

            if (emailInformado) {
                const clienteComEmail = await clienteRepository.buscarPorEmail(emailInformado);
                if (clienteComEmail) {
                    return res.status(409).json({
                        message: 'E-mail já cadastrado',
                        error: 'O e-mail informado já está cadastrado no sistema'
                    });
                }
            }

            const dadosCep = await consultarCep(cep);
            const cliente = Cliente.criar({
                nome,
                cpf: cpfLimpo,
                cep: dadosCep.cep,
                logradouro: dadosCep.logradouro,
                bairro: dadosCep.bairro,
                cidade: dadosCep.cidade,
                uf: dadosCep.uf,
                numero,
                complemento,
                email: emailInformado
            });

            const resultado = await clienteRepository.criar(cliente);

            return res.status(201).json({
                message: 'Cliente criado com sucesso',
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                return res.status(409).json({
                    message: 'Cliente já cadastrado',
                    error: 'O CPF ou e-mail informado já está cadastrado no sistema'
                });
            }
            if (error.message.includes('inválido') || error.message.includes('inválida') || error.message.includes('não encontrado')) {
                return res.status(400).json({
                    message: 'Erro de validação ao criar cliente',
                    error: error.message
                });
            }
            return res.status(500).json({
                message: 'Erro ao criar cliente',
                error: error.message
            });
        }
    },
    atualizar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            // CT-022: Realizar alteração de cliente sem informar ID ou ID inválido
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: 'ID do cliente é obrigatório e deve ser válido',
                    error: 'ID não fornecido ou inválido'
                });
            }

            const clienteExistente = await clienteRepository.buscarPorId(id);
            if (!clienteExistente) {
                return res.status(404).json({
                    message: 'Cliente não encontrado',
                    data: {}
                });
            }

            const { nome, cpf, cep, numero, complemento, email } = req.body || {};
            const emailInformado = email === undefined
                ? (clienteExistente.Email ?? clienteExistente.email ?? null)
                : (email ? String(email).trim().toLowerCase() : null);

            if (emailInformado) {
                const clienteComEmail = await clienteRepository.buscarPorEmail(emailInformado);
                if (clienteComEmail && Number(clienteComEmail.Id ?? clienteComEmail.id) !== id) {
                    return res.status(409).json({
                        message: 'E-mail já cadastrado',
                        error: 'O e-mail informado já está cadastrado para outro cliente'
                    });
                }
            }

            const dadosCep = await consultarCep(cep);
            const cliente = Cliente.editar({
                nome,
                cpf: limparNumero(cpf),
                cep: dadosCep.cep,
                logradouro: dadosCep.logradouro,
                bairro: dadosCep.bairro,
                cidade: dadosCep.cidade,
                uf: dadosCep.uf,
                numero,
                complemento,
                email: emailInformado
            }, id);

            const resultado = await clienteRepository.editar(cliente);
            return res.status(200).json({
                message: 'Cliente atualizado com sucesso',
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                return res.status(409).json({
                    message: 'E-mail já cadastrado',
                    error: 'O e-mail informado já está cadastrado para outro cliente'
                });
            }
            if (error.message.includes('inválido') || error.message.includes('inválida') || error.message.includes('não encontrado')) {
                return res.status(400).json({
                    message: 'Erro de validação ao atualizar cliente',
                    error: error.message
                });
            }
            return res.status(500).json({
                message: 'Erro ao atualizar cliente',
                error: error.message
            });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: 'ID do cliente é obrigatório e deve ser válido',
                    error: 'ID inválido'
                });
            }

            // CT-025: Realizar exclusão de cliente inexistente
            const clienteExistente = await clienteRepository.buscarPorId(id);
            if (!clienteExistente) {
                return res.status(404).json({
                    message: 'Cliente não encontrado',
                    data: {}
                });
            }

            // CT-004: O cliente a ser excluído não pode estar vinculado a um carro
            const totalVeiculos = await clienteRepository.contarVeiculosVinculados(id);
            if (totalVeiculos > 0) {
                return res.status(409).json({
                    message: 'O cliente estava vinculado à um veículo, não podendo ser excluído',
                    error: 'Restrição de chave estrangeira'
                });
            }

            const resultado = await clienteRepository.deletar(id);
            return res.status(200).json({
                message: 'Cliente deletado com sucesso',
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
                return res.status(409).json({
                    message: 'O cliente estava vinculado à um veículo, não podendo ser excluído',
                    error: error.message
                });
            }
            return res.status(500).json({
                message: 'Erro ao deletar cliente',
                error: error.message
            });
        }
    },
    selecionar: async (req, res) => {
        try {
            const resultado = await clienteRepository.selecionar();
            return res.status(200).json({
                message: 'Clientes selecionados com sucesso',
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            return res.status(500).json({
                message: 'Erro ao selecionar clientes',
                error: error.message
            });
        }
    }
};

export default clienteController;
