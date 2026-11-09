import Treinamento from "../models/Treinamento.js";

function validarDataCalendario(valorData) {
  if (!valorData || typeof valorData !== "string") return false;

  const match = valorData.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (!match) return false;

  const [, ano, mes, dia] = match.map(Number);
  if (ano < 2000 || ano > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;

  const dataUTC = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    dataUTC.getUTCFullYear() === ano &&
    dataUTC.getUTCMonth() === mes - 1 &&
    dataUTC.getUTCDate() === dia
  );
}

function validarDadosTreinamento(dados = {}) {
  const erros = [];
  const titulo = typeof dados.titulo === "string" ? dados.titulo.trim() : "";
  const instrutor = typeof dados.instrutor === "string" ? dados.instrutor.trim() : "";
  const carga = Number(dados.cargaHoraria);

  if (titulo.length < 3 || titulo.length > 150) {
    erros.push("O título é obrigatório e deve ter entre 3 e 150 caracteres.");
  }

  if (instrutor.length < 2 || instrutor.length > 120) {
    erros.push("O nome do instrutor é obrigatório e deve ter entre 2 e 120 caracteres.");
  }

  if (!validarDataCalendario(String(dados.data || ""))) {
    erros.push("A data informada é inválida. Utilize o formato AAAA-MM-DD.");
  }

  if (!Number.isInteger(carga) || carga <= 0 || carga > 1000) {
    erros.push("A carga horária deve ser um número inteiro entre 1 e 1000 horas.");
  }

  if (dados.descricao != null && typeof dados.descricao !== "string") {
    erros.push("A descrição deve ser um texto válido.");
  } else if (typeof dados.descricao === "string" && dados.descricao.trim().length > 2000) {
    erros.push("A descrição deve ter no máximo 2000 caracteres.");
  }

  return erros;
}

async function buscarTreinamentoOuResponder(req, res, acao = "") {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      sucesso: false,
      mensagem: "ID do treinamento inválido. Informe um número inteiro positivo.",
    });
    return null;
  }

  const treinamento = await Treinamento.buscarPorId(id);
  if (!treinamento) {
    const sufixo = acao ? ` para ${acao}` : "";
    res.status(404).json({
      sucesso: false,
      mensagem: `Treinamento não encontrado${sufixo}.`,
    });
    return null;
  }

  return treinamento;
}

function responderErroInterno(res, mensagem, error) {
  console.error(mensagem, error);
  return res.status(500).json({ sucesso: false, mensagem });
}

class TreinamentoController {
  // GET /api/treinamentos
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
      return responderErroInterno(res, "Erro interno ao listar os treinamentos.", error);
    }
  }

  // GET /api/treinamentos/:id
  static async buscarPorId(req, res) {
    try {
      const treinamento = await buscarTreinamentoOuResponder(req, res);
      if (!treinamento) return;

      return res.status(200).json({ sucesso: true, dados: treinamento });
    } catch (error) {
      return responderErroInterno(res, "Erro interno ao consultar o treinamento.", error);
    }
  }

  // POST /api/treinamentos
  static async criar(req, res) {
    try {
      const erros = validarDadosTreinamento(req.body);
      if (erros.length > 0) {
        return res.status(400).json({ sucesso: false, mensagem: erros[0], erros });
      }

      const novoTreinamento = await Treinamento.criar(req.body);
      return res.status(201).json({
        sucesso: true,
        mensagem: "Treinamento cadastrado com sucesso!",
        dados: novoTreinamento,
      });
    } catch (error) {
      return responderErroInterno(res, "Erro interno ao cadastrar o treinamento.", error);
    }
  }

  // PUT /api/treinamentos/:id
  static async atualizar(req, res) {
    try {
      const existente = await buscarTreinamentoOuResponder(req, res, "atualização");
      if (!existente) return;

      const erros = validarDadosTreinamento(req.body);
      if (erros.length > 0) {
        return res.status(400).json({ sucesso: false, mensagem: erros[0], erros });
      }

      const treinamentoAtualizado = await Treinamento.atualizar(existente.id, req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: "Treinamento atualizado com sucesso!",
        dados: treinamentoAtualizado,
      });
    } catch (error) {
      return responderErroInterno(res, "Erro interno ao atualizar o treinamento.", error);
    }
  }

  // DELETE /api/treinamentos/:id
  static async excluir(req, res) {
    try {
      const existente = await buscarTreinamentoOuResponder(req, res, "exclusão");
      if (!existente) return;

      await Treinamento.excluir(existente.id);
      return res.status(200).json({
        sucesso: true,
        mensagem: "Treinamento excluído com sucesso!",
      });
    } catch (error) {
      return responderErroInterno(res, "Erro interno ao excluir o treinamento.", error);
    }
  }
}

export default TreinamentoController;
