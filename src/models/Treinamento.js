import prisma from "../config/prisma.js";

class Treinamento {
  /**
   * Lista todos os treinamentos com suporte opcional a busca e filtro de status
   * @param {Object} filtros - { busca, status, ordenar }
   */
  static async listarTodos(filtros = {}) {
    const { busca, status, ordenar } = filtros;
    const where = {};

    if (busca && busca.trim() !== "") {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo } },
        { instrutor: { contains: termo } },
        { descricao: { contains: termo } },
      ];
    }

    const agora = new Date();
    if (status === "proximos") {
      where.data = { gte: agora };
    } else if (status === "realizados") {
      where.data = { lt: agora };
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
    return await prisma.treinamento.create({
      data: {
        titulo: dados.titulo.trim(),
        instrutor: dados.instrutor.trim(),
        data: new Date(dados.data),
        cargaHoraria: Number(dados.cargaHoraria),
        descricao: dados.descricao ? dados.descricao.trim() : null,
      },
    });
  }

  /**
   * Atualiza um treinamento existente pelo ID
   * @param {number} id
   * @param {Object} dados - { titulo, instrutor, data, cargaHoraria, descricao }
   */
  static async atualizar(id, dados) {
    return await prisma.treinamento.update({
      where: { id: Number(id) },
      data: {
        titulo: dados.titulo.trim(),
        instrutor: dados.instrutor.trim(),
        data: new Date(dados.data),
        cargaHoraria: Number(dados.cargaHoraria),
        descricao: dados.descricao ? dados.descricao.trim() : null,
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
   * Obtém indicadores consolidados para o Dashboard
   */
  static async obterIndicadores() {
    const todos = await prisma.treinamento.findMany({
      orderBy: { data: "asc" },
    });

    const agora = new Date();
    const totalTreinamentos = todos.length;
    const totalHoras = todos.reduce((acc, item) => acc + (item.cargaHoraria || 0), 0);
    const proximosLista = todos.filter((item) => new Date(item.data) >= agora);
    const realizadosLista = todos
      .filter((item) => new Date(item.data) < agora)
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    return {
      totalTreinamentos,
      totalHoras,
      proximosCount: proximosLista.length,
      realizadosCount: realizadosLista.length,
      proximosTreinamentos: proximosLista.slice(0, 5),
      ultimosRealizados: realizadosLista.slice(0, 5),
      todosTreinamentos: todos,
    };
  }
}

export default Treinamento;
