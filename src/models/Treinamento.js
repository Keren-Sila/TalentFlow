import prisma from "../config/prisma.js";
import {
  normalizarDataCalendarioUTC,
  obterInicioDiaLocalEmUTC,
} from "../utils/formatadores.js";

const ORDENACAO_PADRAO = {
  data_asc: { data: "asc" },
  data_desc: { data: "desc" },
  titulo_asc: { titulo: "asc" },
  carga_desc: { cargaHoraria: "desc" },
  recentes: { createdAt: "desc" },
};

function prepararDadosParaBanco(dados) {
  const dataNormalizada = normalizarDataCalendarioUTC(dados.data);
  if (Number.isNaN(dataNormalizada.getTime())) {
    throw new Error("Data inválida para persistência no banco de dados.");
  }

  const descricao =
    typeof dados.descricao === "string" && dados.descricao.trim() !== ""
      ? dados.descricao.trim()
      : null;

  return {
    titulo: String(dados.titulo).trim(),
    instrutor: String(dados.instrutor).trim(),
    data: dataNormalizada,
    cargaHoraria: Number(dados.cargaHoraria),
    descricao,
  };
}

class Treinamento {
  static listarTodos(filtros = {}) {
    const { busca, status, ordenar } = filtros;
    const where = {};

    if (typeof busca === "string" && busca.trim() !== "") {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo } },
        { instrutor: { contains: termo } },
        { descricao: { contains: termo } },
      ];
    }

    const hoje = obterInicioDiaLocalEmUTC();
    if (status === "proximos") where.data = { gte: hoje };
    if (status === "realizados") where.data = { lt: hoje };

    return prisma.treinamento.findMany({
      where,
      orderBy: ORDENACAO_PADRAO[ordenar] || ORDENACAO_PADRAO.data_asc,
    });
  }

  static buscarPorId(id) {
    return prisma.treinamento.findUnique({ where: { id: Number(id) } });
  }

  static criar(dados) {
    return prisma.treinamento.create({ data: prepararDadosParaBanco(dados) });
  }

  static atualizar(id, dados) {
    return prisma.treinamento.update({
      where: { id: Number(id) },
      data: prepararDadosParaBanco(dados),
    });
  }

  static excluir(id) {
    return prisma.treinamento.delete({ where: { id: Number(id) } });
  }

  static async obterIndicadores() {
    const todos = await prisma.treinamento.findMany({ orderBy: { data: "asc" } });
    const hoje = obterInicioDiaLocalEmUTC().getTime();

    const proximosLista = [];
    const realizadosLista = [];
    const mapaInstrutores = new Map();
    let totalHoras = 0;

    for (const item of todos) {
      const carga = item.cargaHoraria || 0;
      const agendado = normalizarDataCalendarioUTC(item.data).getTime() >= hoje;
      totalHoras += carga;

      if (agendado) {
        proximosLista.push(item);
      } else {
        realizadosLista.push(item);
      }

      const nome = item.instrutor.trim();
      const atual = mapaInstrutores.get(nome) || {
        nome,
        totalTreinamentos: 0,
        totalHoras: 0,
        temAgendado: false,
        ultimoTreinamentoId: item.id,
      };

      atual.totalTreinamentos += 1;
      atual.totalHoras += carga;
      atual.temAgendado = atual.temAgendado || agendado;
      atual.ultimoTreinamentoId = item.id;
      mapaInstrutores.set(nome, atual);
    }

    realizadosLista.sort((a, b) => new Date(b.data) - new Date(a.data));

    return {
      totalTreinamentos: todos.length,
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
