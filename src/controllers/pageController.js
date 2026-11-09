import Treinamento from "../models/Treinamento.js";

const INDICADORES_VAZIOS = Object.freeze({
  totalTreinamentos: 0,
  totalHoras: 0,
  proximosCount: 0,
  realizadosCount: 0,
  proximosTreinamentos: [],
  ultimosRealizados: [],
  todosTreinamentos: [],
  instrutoresReais: [],
});

function renderizarDetalhe(res, status, tituloPagina, treinamento = null, erro = null) {
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
    let statusHttp = 200;
    let indicadores = INDICADORES_VAZIOS;
    let erro = null;

    try {
      indicadores = await Treinamento.obterIndicadores();
    } catch (error) {
      console.error("Erro ao carregar o Dashboard:", error);
      statusHttp = 500;
      erro = "Não foi possível carregar os indicadores do banco de dados.";
    }

    return res.status(statusHttp).render("dashboard", {
      tituloPagina: "Dashboard",
      paginaAtiva: "dashboard",
      indicadores,
      erro,
    });
  }

  // GET /treinamentos
  static async renderTreinamentos(req, res) {
    const { busca = "", status = "todos", ordenar = "data_asc" } = req.query;
    const paginaAtiva =
      status === "proximos"
        ? "agendados"
        : status === "realizados"
          ? "realizados"
          : "treinamentos";

    let statusHttp = 200;
    let treinamentos = [];
    let indicadores = INDICADORES_VAZIOS;
    let erro = null;

    try {
      [treinamentos, indicadores] = await Promise.all([
        Treinamento.listarTodos({
          busca,
          status: status === "todos" ? undefined : status,
          ordenar,
        }),
        Treinamento.obterIndicadores(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar página de treinamentos:", error);
      statusHttp = 500;
      erro = "Erro ao carregar a lista de treinamentos.";
    }

    return res.status(statusHttp).render("treinamentos", {
      tituloPagina: "Gestão de Treinamentos",
      paginaAtiva,
      treinamentos,
      indicadores,
      filtros: { busca, status, ordenar },
      erro,
    });
  }

  // GET /treinamentos/:id
  static async renderDetalheTreinamento(req, res) {
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

    try {
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
