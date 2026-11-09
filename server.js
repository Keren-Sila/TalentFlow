import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pageRoutes from "./src/routes/pageRoutes.js";
import treinamentoRoutes from "./src/routes/treinamentoRoutes.js";
import { formatadoresView } from "./src/utils/formatadores.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Middlewares para JSON, formulários e arquivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "public")));

// Disponibiliza funções de formatação de datas e status para as views EJS
Object.assign(app.locals, formatadoresView);

// Rotas da API (JSON) e Rotas de Páginas (HTML/EJS)
app.use("/api", treinamentoRoutes);
app.use("/", pageRoutes);

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      sucesso: false,
      mensagem: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
    });
  }

  return res.status(404).render("treinamento-detalhe", {
    tituloPagina: "Página Não Encontrada",
    paginaAtiva: "",
    treinamento: null,
    erro: "A página que você tentou acessar não existe no TalentFlow.",
  });
});

// Middleware global de tratamento de erros (500)
app.use((err, req, res, next) => {
  console.error("Erro interno no servidor:", err);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno no servidor.",
    });
  }

  return res.status(500).send("Erro interno no servidor. Tente novamente mais tarde.");
});

export default app;