import React, { useMemo } from "react";
import { computeAdminKpis } from "./flowBoardUtils";
import { DrillKey } from "./useKpiDrilldown";

type KpiCard = { key: DrillKey; label: string; value: string | number; icon: string; alert?: boolean };

interface Props {
  isAdm: boolean;
  tasks: Array<{ final_date?: string; percent?: number; user_id?: number }>;
  drillKpis: DrillKey[];
  toggleDrill: (key: DrillKey) => void;
}

export default function AdminKpiPanel({ isAdm, tasks, drillKpis, toggleDrill }: Props) {
  const k = useMemo(() => computeAdminKpis(tasks), [tasks]);
  if (!isAdm) return null;
  const cards: KpiCard[] = [
    { key: "total", label: "Total", value: k.total, icon: "fa-list" },
    { key: "overdue", label: "Atrasadas", value: k.overdue, icon: "fa-triangle-exclamation", alert: k.overdue > 0 },
    { key: "dueSoon", label: "Vencem em 7d", value: k.dueSoon, icon: "fa-clock", alert: k.dueSoon > 0 },
    { key: "orphan", label: "Sem responsável", value: k.orphan, icon: "fa-user-slash" },
    { key: "lowPercent", label: "% média", value: `${k.avgPercent}%`, icon: "fa-percent" },
  ];
  return (
    <div className="gtpp-kpi-panel w-100 d-flex gap-2 flex-wrap mt-2" data-tour="gtpp-admin-kpis">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => toggleDrill(c.key)}
          className={`gtpp-kpi-card${c.alert ? " gtpp-kpi-card--alert" : ""}${drillKpis.includes(c.key) ? " gtpp-kpi-card--active" : ""}`}
          aria-label={`Ver ${c.label}`}
        >
          <i className={`fa-solid ${c.icon} gtpp-kpi-icon`}></i>
          <div className="gtpp-kpi-body">
            <span className="gtpp-kpi-value">{c.value}</span>
            <span className="gtpp-kpi-label">{c.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
