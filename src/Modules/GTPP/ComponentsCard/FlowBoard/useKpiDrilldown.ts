import { useEffect, useState } from "react";
import { useConnection } from "../../../../Context/ConnContext";
import { ensureEmployees, EmployeeInfo, getCachedEmployees, isEmployeesLoaded } from "../../Class/userLookupCache";
import { isTerminalState } from "./flowBoardUtils";

export type DrillKey = "total" | "overdue" | "dueSoon" | "orphan" | "lowPercent";

export const drillMeta: Record<DrillKey, { title: string; icon: string; alert?: boolean }> = {
  total: { title: "Todas as tarefas", icon: "fa-list" },
  overdue: { title: "Atrasadas", icon: "fa-triangle-exclamation", alert: true },
  dueSoon: { title: "Vencem em 7 dias", icon: "fa-clock", alert: true },
  orphan: { title: "Sem responsável", icon: "fa-user-slash" },
  lowPercent: { title: "Tarefas por % de conclusão", icon: "fa-percent" },
};

export function useKpiDrilldown(isAdm: boolean) {
  const [drillKpis, setDrillKpis] = useState<DrillKey[]>([]);

  function toggleDrill(key: DrillKey) {
    setDrillKpis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  useEffect(() => {
    if (!isAdm && drillKpis.length > 0) setDrillKpis([]);
  }, [isAdm]);

  const { fetchData } = useConnection();
  const [userMap, setUserMap] = useState<Map<number, EmployeeInfo>>(() => getCachedEmployees());
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  useEffect(() => {
    if (drillKpis.length === 0) return;
    if (isEmployeesLoaded()) { setUserMap(getCachedEmployees()); return; }
    setLoadingUsers(true);
    ensureEmployees(fetchData).then((map) => {
      setUserMap(new Map(map));
    }).finally(() => setLoadingUsers(false));
  }, [drillKpis.length, fetchData]);

  return { drillKpis, toggleDrill, userMap, loadingUsers };
}

export function tasksForKpi<T extends { final_date?: string; percent?: number; user_id?: number; state_description?: string }>(
  kpi: DrillKey,
  source: T[]
): T[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);
  const filtered = source.filter((t) => {
    // Tarefas canceladas não aparecem em nenhum drill-down do dashboard.
    if (isTerminalState(t.state_description)) return false;
    const pct = Number(t.percent ?? 0);
    if (kpi === "total") return true;
    if (kpi === "orphan") return !t.user_id;
    if (kpi === "lowPercent") return pct < 100;
    if (pct >= 100) return false;
    if (!t.final_date) return false;
    const d = new Date(t.final_date); d.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return false;
    if (kpi === "overdue") return d < today;
    if (kpi === "dueSoon") return d >= today && d <= in7Days;
    return false;
  });
  if (kpi === "lowPercent") {
    filtered.sort((a, b) => (Number(a.percent ?? 0)) - (Number(b.percent ?? 0)));
  } else if (kpi === "overdue" || kpi === "dueSoon") {
    filtered.sort((a, b) => new Date(a.final_date || "").getTime() - new Date(b.final_date || "").getTime());
  }
  return filtered;
}
