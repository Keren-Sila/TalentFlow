import prisma from "../config/prisma.js";

/**
 * Retorna o início do dia de hoje no calendário local (Brasil),
 * representado como 00:00:00.000 UTC para comparar de forma exata
 * com as datas salvas no formato YYYY-MM-DD (00:00:00.000 UTC).
 */
export function obterInicioDiaLocalEmUTC(dataRef = new Date()) {
  return new Date(
    Date.UTC(dataRef.getFullYear(), dataRef.getMonth(), dataRef.getDate(), 0, 0, 0, 0)
  );
}

/**
 * Converte uma string YYYY-MM-DD (ou ISO) em um objeto Date normalizado em 00:00:00.000 UTC
 * sem sofrer deslocamento de fuso horário.
 */
export function normalizarDataCalendarioUTC(valorData) {
  if (typeof valorData === "string") {
    const match = valorData.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const ano = Number(match[1]);
      const mes = Number(match[2]);
      const dia = Number(match[3]);
      return new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    }
  }
  const d = new Date(valorData);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

class Treinamento {
  /**
   * Lista todos os treinamentos com suporte opcional a busca e filtro de status
   * @param {Object} filtros - { busca, status, ordenar }
   */
  static async listarTodos(filtros = {}) {
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

    let orderBy = { data: "asc" };
    if (ordenar === "data_desc") {
      orderBy = { data: "desc" };
    } else if (ordenar === "titulo_asc") {
      orderBy = { titulo: "asc" };
    } else if (ordenar === "carga_desc") {
      orderBy = { cargaHoraria: "desc" };
    } else if (ordenar === "recentes") {
      orderBy = { createdAt: "desc" };
    }

    return await prisma.treinamento.findMany({
      where,
      orderBy,
    });
  }

  /**
   * Busca um treinamento pelo ID
   * @param {number} id
   */
  static async buscarPorId(id) {
    return await prisma.treinamento.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Cria um novo treinamento no banco de dados
   * @param {Object} dados - { titulo, instrutor, data, cargaHoraria, descricao }
   */
  static async criar(dados) {
    const descricaoLimpa =
      typeof dados.descricao === "string" && dados.descricao.trim() !== ""
        ? dados.descricao.trim()
        : null;

    return await prisma.treinamento.create({
      data: {
        titulo: String(dados.titulo).trim(),
        instrutor: String(dados.instrutor).trim(),
        data: normalizarDataCalendarioUTC(dados.data),
        cargaHoraria: Number(dados.cargaHoraria),
        descricao: descricaoLimpa,
      },
    });
  }

  /**
   * Atualiza um treinamento existente pelo ID
   * @param {number} id
   * @param {Object} dados - { titulo, instrutor, data, cargaHoraria, descricao }
   */
  static async atualizar(id, dados) {
    const descricaoLimpa =
      typeof dados.descricao === "string" && dados.descricao.trim() !== ""
        ? dados.descricao.trim()
        : null;

    return await prisma.treinamento.update({
      where: { id: Number(id) },
      data: {
        titulo: String(dados.titulo).trim(),
        instrutor: String(dados.instrutor).trim(),
        data: normalizarDataCalendarioUTC(dados.data),
        cargaHoraria: Number(dados.cargaHoraria),
        descricao: descricaoLimpa,
      },
    });
  }

  /**
   * Exclui um treinamento pelo ID
   * @param {number} id
   */
  static async excluir(id) {
    return await prisma.treinamento.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * Obtém indicadores consolidados e estatísticas reais para o Dashboard
   */
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

    // Agrupa instrutores reais a partir dos treinamentos cadastrados no banco
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

    const instrutoresReais = Array.from(mapaInstrutores.values());

    return {
      totalTreinamentos,
      totalHoras,
      proximosCount: proximosLista.length,
      realizadosCount: realizadosLista.length,
      proximosTreinamentos: proximosLista.slice(0, 5),
      ultimosRealizados: realizadosLista.slice(0, 5),
      todosTreinamentos: todos,
      instrutoresReais,
    };
  }
}

export default Treinamento;
