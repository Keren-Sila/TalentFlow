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

function renderizarDetalhe(res, status, tituloPagina, treinamento, erro = null) {
  return res.status(status).render("treinamento-detalhe", {
    tituloPagina,
    paginaAtiva: "treinamentos",
    treinamento,
    erro,
  });
}

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
    const abaAtiva =
      status === "proximos"
        ? "agendados"
        : status === "realizados"
          ? "realizados"
          : "treinamentos";

    try {
      const [treinamentos, indicadores] = await Promise.all([
        Treinamento.listarTodos({
          busca,
          status: status === "todos" ? undefined : status,
          ordenar,
        }),
        Treinamento.obterIndicadores(),
      ]);

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
        paginaAtiva: abaAtiva,
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
        return renderizarDetalhe(
          res,
          400,
          "Treinamento Inválido",
          null,
          "O identificador informado para o treinamento é inválido."
        );
      }

      const treinamento = await Treinamento.buscarPorId(id);
      if (!treinamento) {
        return renderizarDetalhe(
          res,
          404,
          "Treinamento Não Encontrado",
          null,
          "O treinamento solicitado não foi encontrado ou já foi removido."
        );
      }

      return renderizarDetalhe(res, 200, `${treinamento.titulo} — Detalhes`, treinamento);
    } catch (error) {
      console.error("Erro ao carregar detalhes do treinamento:", error);
      return renderizarDetalhe(
        res,
        500,
        "Erro ao Carregar Detalhes",
        null,
        "Ocorreu um erro interno ao buscar as informações deste treinamento."
      );
    }
  }
}

export default PageController;
