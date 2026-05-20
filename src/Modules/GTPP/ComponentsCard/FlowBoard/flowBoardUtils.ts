export type PeriodPreset = "week" | "month" | "overdue";

export function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function buildPeriodPreset(kind: PeriodPreset): { from: string; to: string } {
  const today = new Date();
  if (kind === "week") {
    const day = today.getDay();
    const monday = new Date(today); monday.setDate(today.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return { from: isoDate(monday), to: isoDate(sunday) };
  }
  if (kind === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: isoDate(first), to: isoDate(last) };
  }
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  return { from: "", to: isoDate(yesterday) };
}

/**
 * Estados "terminais" onde a tarefa foi encerrada e não tem mais valor
 * de auditoria (não conta atraso, não entra no dashboard). Case-insensitive.
 */
export function isTerminalState(stateDescription?: string): boolean {
  const s = (stateDescription || "").trim().toLowerCase();
  return s === "cancelado" || s === "cancelada";
}

export function computeAdminKpis(
  tasks: Array<{ final_date?: string; percent?: number; user_id?: number; state_description?: string }>
) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);
  // Tarefas canceladas não entram em nenhum indicador do dashboard.
  const relevant = tasks.filter((t) => !isTerminalState(t.state_description));
  let overdue = 0;
  let dueSoon = 0;
  let orphan = 0;
  let percentSum = 0;
  let percentCount = 0;
  relevant.forEach((t) => {
    const pct = Number(t.percent ?? 0);
    if (!t.user_id) orphan++;
    percentSum += pct;
    percentCount++;
    if (!t.final_date || pct >= 100) return;
    const d = new Date(t.final_date); d.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return;
    if (d < today) overdue++;
    else if (d <= in7Days) dueSoon++;
  });
  return {
    total: relevant.length,
    overdue,
    dueSoon,
    orphan,
    avgPercent: percentCount ? Math.round(percentSum / percentCount) : 0,
  };
}
