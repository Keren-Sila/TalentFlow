import Treinamento from "../models/Treinamento.js";

const INDICADORES_VAZIOS = {
  totalTreinamentos: 0,
  totalHoras: 0,
  proximosCount: 0,
  realizadosCount: 0,
  proximosTreinamentos: [],
  ultimosRealizados: [],
  todosTreinamentos: [],
  instrutoresReais: [],
};

class PageController {
  // GET /
  static async renderDashboard(req, res) {
    try {
      const indicadores = await Treinamento.obterIndicadores();

      return res.render("dashboard", {
        tituloPagina: "Dashboard",
        paginaAtiva: "dashboard",
        indicadores,
        erro: null,
      });
    } catch (error) {
      console.error("Erro ao carregar o Dashboard:", error);
      return res.status(500).render("dashboard", {
        tituloPagina: "Dashboard",
        paginaAtiva: "dashboard",
        indicadores: INDICADORES_VAZIOS,
        erro: "Não foi possível carregar os indicadores do banco de dados.",
      });
    }
  }

  // GET /treinamentos
  static async renderTreinamentos(req, res) {
    const { busca = "", status = "todos", ordenar = "data_asc" } = req.query;

    try {
      const treinamentos = await Treinamento.listarTodos({
        busca,
        status: status === "todos" ? undefined : status,
        ordenar,
      });

      const indicadores = await Treinamento.obterIndicadores();
      const abaAtiva =
        status === "proximos"
          ? "agendados"
          : status === "realizados"
            ? "realizados"
            : "treinamentos";

      return res.render("treinamentos", {
        tituloPagina: "Gestão de Treinamentos",
        paginaAtiva: abaAtiva,
        treinamentos,
        indicadores,
        filtros: { busca, status, ordenar },
        erro: null,
      });
    } catch (error) {
      console.error("Erro ao carregar página de treinamentos:", error);
      return res.status(500).render("treinamentos", {
        tituloPagina: "Gestão de Treinamentos",
        paginaAtiva: "treinamentos",
        treinamentos: [],
        indicadores: INDICADORES_VAZIOS,
        filtros: { busca, status, ordenar },
        erro: "Erro ao carregar a lista de treinamentos.",
      });
    }
  }

  // GET /treinamentos/:id
  static async renderDetalheTreinamento(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).render("treinamento-detalhe", {
          tituloPagina: "Treinamento Inválido",
          paginaAtiva: "treinamentos",
          treinamento: null,
          erro: "O identificador informado para o treinamento é inválido.",
        });
      }

      const treinamento = await Treinamento.buscarPorId(id);
      if (!treinamento) {
        return res.status(404).render("treinamento-detalhe", {
          tituloPagina: "Treinamento Não Encontrado",
          paginaAtiva: "treinamentos",
          treinamento: null,
          erro: "O treinamento solicitado não foi encontrado ou já foi removido.",
        });
      }

      return res.render("treinamento-detalhe", {
        tituloPagina: `${treinamento.titulo} — Detalhes`,
        paginaAtiva: "treinamentos",
        treinamento,
        erro: null,
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes do treinamento:", error);
      return res.status(500).render("treinamento-detalhe", {
        tituloPagina: "Erro ao Carregar Detalhes",
        paginaAtiva: "treinamentos",
        treinamento: null,
        erro: "Ocorreu um erro interno ao buscar as informações deste treinamento.",
      });
    }
  }
}

export default PageController;
