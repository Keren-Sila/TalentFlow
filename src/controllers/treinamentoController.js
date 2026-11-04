import Treinamento from "../models/Treinamento.js";

/**
 * Valida os dados de entrada de um treinamento
 */
function validarDadosTreinamento(dados) {
  const erros = [];

  if (!dados.titulo || String(dados.titulo).trim().length < 3) {
    erros.push("O título é obrigatório e deve ter pelo menos 3 caracteres.");
  } else if (String(dados.titulo).trim().length > 150) {
    erros.push("O título deve ter no máximo 150 caracteres.");
  }

  if (!dados.instrutor || String(dados.instrutor).trim().length < 2) {
    erros.push("O nome do instrutor é obrigatório e deve ter pelo menos 2 caracteres.");
  } else if (String(dados.instrutor).trim().length > 120) {
    erros.push("O nome do instrutor deve ter no máximo 120 caracteres.");
  }

  if (!dados.data) {
    erros.push("A data do treinamento é obrigatória.");
  } else {
    const dataConvertida = new Date(dados.data);
    if (Number.isNaN(dataConvertida.getTime())) {
      erros.push("A data informada é inválida.");
    }
  }

  const carga = Number(dados.cargaHoraria);
  if (
    dados.cargaHoraria === undefined ||
    dados.cargaHoraria === null ||
    dados.cargaHoraria === "" ||
    Number.isNaN(carga) ||
    !Number.isInteger(carga) ||
    carga <= 0
  ) {
    erros.push("A carga horária é obrigatória e deve ser um número inteiro maior que zero.");
  } else if (carga > 1000) {
    erros.push("A carga horária não pode ultrapassar 1000 horas.");
  }

  return erros;
}

class TreinamentoController {
  /**
   * GET /api/treinamentos
   * Lista todos os treinamentos (com filtros opcionais via query string)
   */
  static async listar(req, res) {
    try {
      const { busca, status, ordenar } = req.query;
      const treinamentos = await Treinamento.listarTodos({ busca, status, ordenar });

      return res.status(200).json({
        sucesso: true,
        total: treinamentos.length,
        dados: treinamentos,
      });
    } catch (error) {
      console.error("Erro ao listar treinamentos:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao listar os treinamentos.",
        erro: error.message,
      });
    }
  }

  /**
   * GET /api/treinamentos/:id
   * Consulta um treinamento específico pelo ID
   */
  static async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID do treinamento inválido.",
        });
      }

      const treinamento = await Treinamento.buscarPorId(id);
      if (!treinamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Treinamento não encontrado.",
        });
      }

      return res.status(200).json({
        sucesso: true,
        dados: treinamento,
      });
    } catch (error) {
      console.error("Erro ao buscar treinamento por ID:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao consultar o treinamento.",
        erro: error.message,
      });
    }
  }

  /**
   * POST /api/treinamentos
   * Cadastra um novo treinamento
   */
  static async criar(req, res) {
    try {
      const { titulo, instrutor, data, cargaHoraria, descricao } = req.body;
      const erros = validarDadosTreinamento({ titulo, instrutor, data, cargaHoraria });

      if (erros.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: erros[0],
          erros,
        });
      }

      const novoTreinamento = await Treinamento.criar({
        titulo,
        instrutor,
        data,
        cargaHoraria,
        descricao,
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Treinamento cadastrado com sucesso!",
        dados: novoTreinamento,
      });
    } catch (error) {
      console.error("Erro ao cadastrar treinamento:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao cadastrar o treinamento.",
        erro: error.message,
      });
    }
  }

  /**
   * PUT /api/treinamentos/:id
   * Atualiza um treinamento existente
   */
  static async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID do treinamento inválido.",
        });
      }

      const existente = await Treinamento.buscarPorId(id);
      if (!existente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Treinamento não encontrado para atualização.",
        });
      }

      const { titulo, instrutor, data, cargaHoraria, descricao } = req.body;
      const erros = validarDadosTreinamento({ titulo, instrutor, data, cargaHoraria });

      if (erros.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: erros[0],
          erros,
        });
      }

      const treinamentoAtualizado = await Treinamento.atualizar(id, {
        titulo,
        instrutor,
        data,
        cargaHoraria,
        descricao,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Treinamento atualizado com sucesso!",
        dados: treinamentoAtualizado,
      });
    } catch (error) {
      console.error("Erro ao atualizar treinamento:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao atualizar o treinamento.",
        erro: error.message,
      });
    }
  }

  /**
   * DELETE /api/treinamentos/:id
   * Exclui um treinamento existente
   */
  static async excluir(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "ID do treinamento inválido.",
        });
      }

      const existente = await Treinamento.buscarPorId(id);
      if (!existente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Treinamento não encontrado para exclusão.",
        });
      }

      await Treinamento.excluir(id);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Treinamento excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir treinamento:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao excluir o treinamento.",
        erro: error.message,
      });
    }
  }
}

export default TreinamentoController;
