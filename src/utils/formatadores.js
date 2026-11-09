/**
 * Funções utilitárias de datas e formatação para o TalentFlow.
 * Separadas do server.js e do Model para manter cada arquivo com responsabilidade única.
 */

/**
 * Retorna o início do dia atual no calendário local (00:00:00.000 UTC).
 */
export function obterInicioDiaLocalEmUTC(dataRef = new Date()) {
  return new Date(
    Date.UTC(dataRef.getFullYear(), dataRef.getMonth(), dataRef.getDate(), 0, 0, 0, 0)
  );
}

/**
 * Converte uma data (YYYY-MM-DD ou Date) para 00:00:00.000 UTC sem deslocamento de fuso.
 */
export function normalizarDataCalendarioUTC(valorData) {
  if (typeof valorData === "string") {
    const match = valorData.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, ano, mes, dia] = match.map(Number);
      return new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    }
  }

  const d = new Date(valorData);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export function formatarData(data) {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatarDataCurta(data) {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export function formatarDataExtenso(data) {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatarDataInput(data) {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}

export function obterStatusTreinamento(data) {
  const hoje = obterInicioDiaLocalEmUTC();
  const dataTreinamento = normalizarDataCalendarioUTC(data);

  if (dataTreinamento.getTime() === hoje.getTime()) {
    return { rotulo: "Hoje", classe: "badge-upcoming", icone: "calendar" };
  }

  if (dataTreinamento.getTime() > hoje.getTime()) {
    return { rotulo: "Agendado", classe: "badge-upcoming", icone: "calendar" };
  }

  return { rotulo: "Realizado", classe: "badge-completed", icone: "check-circle" };
}

export const formatadoresView = {
  formatarData,
  formatarDataCurta,
  formatarDataExtenso,
  formatarDataInput,
  obterStatusTreinamento,
};
