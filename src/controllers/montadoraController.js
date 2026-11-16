import { Montadora } from "../models/Montadora.js";
import montadoraRepository from "../repositories/montadoraRepository.js";

const montadoraController = {
    criar: async (req, res) => {
        try {
            const { nome, pais } = req.body || {};
            if (!nome || !pais) {
                return res.status(400).json({
                    message: "Nome e país são obrigatórios",
                    error: "Dados incompletos"
                });
            }
            const montadora = Montadora.criar({ nome, pais });

            const existente = await montadoraRepository.buscarPorNome(montadora.nome);
            if (existente) {
                return res.status(409).json({
                    message: "Não deve ser possível cadastrar montadora com nome duplicado",
                    error: "Montadora já cadastrada com este nome"
                });
            }

            const resultado = await montadoraRepository.criar(montadora);
            return res.status(201).json({
                message: "Montadora criada com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.message.includes("inválido") || error.message.includes("inválida")) {
                return res.status(400).json({
                    message: "Erro de validação ao criar montadora",
                    error: error.message
                });
            }
            return res.status(500).json({
                message: "Erro ao criar montadora",
                error: error.message
            });
        }
    },
    atualizar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID é obrigatório ou inválido",
                    error: "ID inválido"
                });
            }

            const montadoraExistente = await montadoraRepository.buscarPorId(id);
            if (!montadoraExistente) {
                return res.status(404).json({
                    message: "Montadora não encontrada",
                    data: {}
                });
            }

            const { nome, pais } = req.body || {};
            const montadora = Montadora.editar({ nome, pais }, id);
            const resultado = await montadoraRepository.editar(montadora);

            return res.status(200).json({
                message: "Montadora atualizada com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.message.includes("inválido") || error.message.includes("inválida")) {
                return res.status(400).json({
                    message: "Erro de validação ao atualizar montadora",
                    error: error.message
                });
            }
            return res.status(500).json({
                message: "Erro ao atualizar montadora",
                error: error.message
            });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID é obrigatório ou inválido",
                    error: "ID inválido"
                });
            }

            const montadoraExistente = await montadoraRepository.buscarPorId(id);
            if (!montadoraExistente) {
                return res.status(404).json({
                    message: "Montadora não encontrada",
                    data: {}
                });
            }

            const totalVeiculos = await montadoraRepository.contarVeiculosVinculados(id);
            if (totalVeiculos > 0) {
                return res.status(409).json({
                    message: "A montadora estava vinculada à um veículo, não podendo ser excluído",
                    error: "Restrição de chave estrangeira"
                });
            }

            const resultado = await montadoraRepository.deletar(id);

            return res.status(200).json({
                message: "Montadora deletada com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
                return res.status(409).json({
                    message: "A montadora estava vinculada à um veículo, não podendo ser excluído",
                    error: error.message
                });
            }
            return res.status(500).json({
                message: "Erro ao deletar montadora",
                error: error.message
            });
        }
    },
    selecionar: async (req, res) => {
        try {
            const resultado = await montadoraRepository.selecionar();
 
            return res.status(200).json({
                message: "Montadoras selecionadas com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            return res.status(500).json({
                message: "Erro ao selecionar montadoras",
                error: error.message
            });
        }
    }
};

export default montadoraController;
