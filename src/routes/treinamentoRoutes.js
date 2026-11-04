import { Router } from "express";
import TreinamentoController from "../controllers/treinamentoController.js";

const router = Router();

// Rotas da API REST para o CRUD de Treinamentos
router.get("/treinamentos", TreinamentoController.listar);
router.get("/treinamentos/:id", TreinamentoController.buscarPorId);
router.post("/treinamentos", TreinamentoController.criar);
router.put("/treinamentos/:id", TreinamentoController.atualizar);
router.delete("/treinamentos/:id", TreinamentoController.excluir);

export default router;
