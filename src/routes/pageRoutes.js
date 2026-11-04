import { Router } from "express";
import PageController from "../controllers/pageController.js";

const router = Router();

// Rotas de páginas HTML (EJS)
router.get("/", PageController.renderDashboard);
router.get("/dashboard", (req, res) => res.redirect("/"));
router.get("/treinamentos", PageController.renderTreinamentos);
router.get("/treinamentos/:id", PageController.renderDetalheTreinamento);

export default router;
