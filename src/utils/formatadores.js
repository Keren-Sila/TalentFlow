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
 * Rejeita datas inexistentes no calendário (como 2026-02-31), retornando Invalid Date
 * em vez de avançar silenciosamente para o mês seguinte.
 */
export function normalizarDataCalendarioUTC(valorData) {
  if (!valorData) return new Date(NaN);

  if (typeof valorData === "string") {
    const match = valorData.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
    if (!match) return new Date(NaN);

    const [, ano, mes, dia] = match.map(Number);
    const dataUTC = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));

    if (
      dataUTC.getUTCFullYear() !== ano ||
      dataUTC.getUTCMonth() !== mes - 1 ||
      dataUTC.getUTCDate() !== dia
    ) {
      return new Date(NaN);
    }

    return dataUTC;
  }

  if (valorData instanceof Date) {
    if (Number.isNaN(valorData.getTime())) return new Date(NaN);
    return new Date(
      Date.UTC(
        valorData.getUTCFullYear(),
        valorData.getUTCMonth(),
        valorData.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
  }

  return new Date(NaN);
}

export function formatarData(data) {
  const d = normalizarDataCalendarioUTC(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatarDataCurta(data) {
  const d = normalizarDataCalendarioUTC(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export function formatarDataExtenso(data) {
  const d = normalizarDataCalendarioUTC(data);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatarDataInput(data) {
  const d = normalizarDataCalendarioUTC(data);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}

export function obterStatusTreinamento(data) {
  const hoje = obterInicioDiaLocalEmUTC();
  const dataTreinamento = normalizarDataCalendarioUTC(data);

  if (Number.isNaN(dataTreinamento.getTime())) {
    return { rotulo: "Data inválida", classe: "badge-completed", icone: "alert-circle" };
  }

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
