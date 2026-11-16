import { Router } from 'express';
import veiculoController from '../controllers/veiculoController.js';

const veiculoRoutes = Router();

veiculoRoutes.post('/', veiculoController.criar);
veiculoRoutes.put('/', veiculoController.atualizar);
veiculoRoutes.put('/:id', veiculoController.atualizar);
veiculoRoutes.delete('/', veiculoController.deletar);
veiculoRoutes.delete('/:id', veiculoController.deletar);
veiculoRoutes.get('/', veiculoController.selecionar);

export default veiculoRoutes;
