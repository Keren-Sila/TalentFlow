import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pageRoutes from "./src/routes/pageRoutes.js";
import treinamentoRoutes from "./src/routes/treinamentoRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração do Template Engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Middlewares para leitura de JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "src", "public")));

// Funções auxiliares globais para as views EJS
app.locals.formatarData = (data) => {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

app.locals.formatarDataExtenso = (data) => {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

app.locals.formatarDataInput = (data) => {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

app.locals.obterStatusTreinamento = (data) => {
  const hoje = new Date();
  const dataTreinamento = new Date(data);
  if (dataTreinamento >= hoje) {
    return {
      rotulo: "Agendado",
      classe: "badge-upcoming",
      icone: "calendar",
    };
  }
  return {
    rotulo: "Realizado",
    classe: "badge-completed",
    icone: "check-circle",
  };
};

// Rotas da API REST (JSON)
app.use("/api", treinamentoRoutes);

// Rotas das Páginas Web (HTML/EJS)
app.use("/", pageRoutes);

// Tratamento de rotas não encontradas (404)
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

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado no servidor:", err);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno no servidor.",
      erro: err.message,
    });
  }

  return res.status(500).send("Erro interno no servidor. Tente novamente mais tarde.");
});

export default app;
