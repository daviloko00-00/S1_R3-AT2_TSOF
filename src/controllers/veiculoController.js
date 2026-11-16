import { Veiculo } from "../models/Veiculo.js";
import veiculoRepository from "../repositories/veiculoRepository.js";

const veiculoController = {
    criar: async (req, res) => {
        try {
            const { idMontadora, idCliente, modelo, placa, ano, cor, valor } = req.body || {};
            const veiculo = Veiculo.criar({ idMontadora, idCliente, modelo, placa, ano, cor, valor });
            const resultado = await veiculoRepository.criar(veiculo);
            return res.status(201).json({
                message: "Veículo criado com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.message.includes("inválido") || error.message.includes("inválida") || error.errno === 1452 || error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({
                    message: "Erro de validação ao criar veículo",
                    error: error.message
                });
            }
            return res.status(500).json({
                message: "Erro ao criar veículo",
                error: error.message
            });
        }
    },
    atualizar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID do veículo é obrigatório e deve ser válido",
                    error: "ID inválido"
                });
            }

            // CT-023: Realizar alteração de veículo inexistente
            const veiculoExistente = await veiculoRepository.buscarPorId(id);
            if (!veiculoExistente) {
                return res.status(404).json({
                    message: "Veículo não encontrado",
                    data: {}
                });
            }

            const { idMontadora, idCliente, modelo, placa, ano, cor, valor } = req.body || {};
            const veiculo = Veiculo.editar({ idMontadora, idCliente, modelo, placa, ano, cor, valor }, id);
            const resultado = await veiculoRepository.editar(veiculo);
            return res.status(200).json({
                message: "Veículo atualizado com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            if (error.message.includes("inválido") || error.message.includes("inválida") || error.errno === 1452 || error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({
                    message: "Erro de validação ao atualizar veículo",
                    error: error.message
                });
            }
            return res.status(500).json({
                message: "Erro ao atualizar veículo",
                error: error.message
            });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = Number(req.params.id || req.query.id);
            if (!id || isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID do veículo é obrigatório e deve ser válido",
                    error: "ID inválido"
                });
            }

            // CT-008 / CT-026: Realizar exclusão de veículo inexistente
            const veiculoExistente = await veiculoRepository.buscarPorId(id);
            if (!veiculoExistente) {
                return res.status(404).json({
                    message: "Veículo não encontrado",
                    data: {}
                });
            }

            const resultado = await veiculoRepository.deletar(id);
            return res.status(200).json({
                message: "Veículo deletado com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            return res.status(500).json({
                message: "Erro ao deletar veículo",
                error: error.message
            });
        }
    },
    selecionar: async (req, res) => {
        try {
            const resultado = await veiculoRepository.selecionar();
            return res.status(200).json({
                message: "Veículos selecionados com sucesso",
                data: resultado
            });
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') console.error(error);
            return res.status(500).json({
                message: "Erro ao selecionar veículos",
                error: error.message
            });
        }
    }
};

export default veiculoController;
