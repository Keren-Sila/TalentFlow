import prisma from "../config/prisma.js";
import {
  normalizarDataCalendarioUTC,
  obterInicioDiaLocalEmUTC,
} from "../utils/formatadores.js";

function prepararDadosParaBanco(dados) {
  const descricaoLimpa =
    typeof dados.descricao === "string" && dados.descricao.trim() !== ""
      ? dados.descricao.trim()
      : null;

  return {
    titulo: String(dados.titulo).trim(),
    instrutor: String(dados.instrutor).trim(),
    data: normalizarDataCalendarioUTC(dados.data),
    cargaHoraria: Number(dados.cargaHoraria),
    descricao: descricaoLimpa,
  };
}

class Treinamento {
  static listarTodos(filtros = {}) {
    const { busca, status, ordenar } = filtros;
    const where = {};

    if (busca && typeof busca === "string" && busca.trim() !== "") {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo } },
        { instrutor: { contains: termo } },
        { descricao: { contains: termo } },
      ];
    }

    const hoje = obterInicioDiaLocalEmUTC();
    if (status === "proximos") {
      where.data = { gte: hoje };
    } else if (status === "realizados") {
      where.data = { lt: hoje };
    }

    const opcoesOrdenacao = {
      data_asc: { data: "asc" },
      data_desc: { data: "desc" },
      titulo_asc: { titulo: "asc" },
      carga_desc: { cargaHoraria: "desc" },
      recentes: { createdAt: "desc" },
    };

    return prisma.treinamento.findMany({
      where,
      orderBy: opcoesOrdenacao[ordenar] || { data: "asc" },
    });
  }

  static buscarPorId(id) {
    return prisma.treinamento.findUnique({
      where: { id: Number(id) },
    });
  }

  static criar(dados) {
    return prisma.treinamento.create({
      data: prepararDadosParaBanco(dados),
    });
  }

  static atualizar(id, dados) {
    return prisma.treinamento.update({
      where: { id: Number(id) },
      data: prepararDadosParaBanco(dados),
    });
  }

  static excluir(id) {
    return prisma.treinamento.delete({
      where: { id: Number(id) },
    });
  }

  static async obterIndicadores() {
    const todos = await prisma.treinamento.findMany({
      orderBy: { data: "asc" },
    });

    const hoje = obterInicioDiaLocalEmUTC();
    const totalTreinamentos = todos.length;
    const totalHoras = todos.reduce((acc, item) => acc + (item.cargaHoraria || 0), 0);

    const proximosLista = todos.filter(
      (item) => normalizarDataCalendarioUTC(item.data).getTime() >= hoje.getTime()
    );

    const realizadosLista = todos
      .filter((item) => normalizarDataCalendarioUTC(item.data).getTime() < hoje.getTime())
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    const mapaInstrutores = new Map();
    for (const item of todos) {
      const nomeInstrutor = item.instrutor.trim();
      const estaAgendado = normalizarDataCalendarioUTC(item.data).getTime() >= hoje.getTime();

      if (!mapaInstrutores.has(nomeInstrutor)) {
        mapaInstrutores.set(nomeInstrutor, {
          nome: nomeInstrutor,
          totalTreinamentos: 0,
          totalHoras: 0,
          temAgendado: false,
          ultimoTreinamentoId: item.id,
        });
      }

      const reg = mapaInstrutores.get(nomeInstrutor);
      reg.totalTreinamentos += 1;
      reg.totalHoras += item.cargaHoraria || 0;
      if (estaAgendado) reg.temAgendado = true;
      reg.ultimoTreinamentoId = item.id;
    }

    return {
      totalTreinamentos,
      totalHoras,
      proximosCount: proximosLista.length,
      realizadosCount: realizadosLista.length,
      proximosTreinamentos: proximosLista.slice(0, 5),
      ultimosRealizados: realizadosLista.slice(0, 5),
      todosTreinamentos: todos,
      instrutoresReais: Array.from(mapaInstrutores.values()),
    };
  }
}

export default Treinamento;
