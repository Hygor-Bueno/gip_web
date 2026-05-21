import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import GtppMainProps from "../../Interfaces/IGtppMainProps";
import { buildPeriodPreset } from "./flowBoardUtils";

interface Props {
  props: GtppMainProps;
  isAdm: boolean;
}

export default function HeaderFilters({ props, isAdm }: Props) {
  const statesTriggerRef = useRef<HTMLButtonElement>(null);
  const [statesPos, setStatesPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!props.openFilter) { setStatesPos(null); return; }
    function compute() {
      const el = statesTriggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const panelW = Math.max(rect.width, 220);
      const margin = 8;
      let left = rect.left;
      if (left + panelW > window.innerWidth - margin) left = window.innerWidth - panelW - margin;
      if (left < margin) left = margin;
      setStatesPos({ top: rect.bottom + 4, left, width: panelW });
    }
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [props.openFilter]);

  useEffect(() => {
    if (!props.openFilter) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (statesTriggerRef.current?.contains(t)) return;
      if ((t as HTMLElement)?.closest?.(".gtpp-states-panel")) return;
      props.handleOpenFilter();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [props.openFilter, props.handleOpenFilter]);

  const hasDateFilter = !!(props.dateFrom || props.dateTo);
  const activeStatesCount = props.states?.filter((s: any) => s.active).length ?? 0;
  const totalStates = props.states?.length ?? 0;

  return (
    <div className="gtpp-filters d-flex flex-column gap-3">
      <div data-tour="gtpp-themes">
        <label className="form-label gtpp-filter-label">Filtrar pelo tema:</label>
        <select
          className="form-select gtpp-theme-select"
          value={props.selectedThemeIds}
          onChange={(e) => props.setSelectedThemeIds(e.target.value)}
        >
          <option value="" hidden>Selecione</option>
          <option value="">Todos</option>
          <option value="0">Sem vínculo</option>
          {props?.themeList?.map((theme) => (
            <option key={theme.id_theme} value={theme.id_theme}>
              {theme.description_theme}
            </option>
          ))}
        </select>
      </div>
      {isAdm && (
        <div data-tour="gtpp-date-range">
          <label className="form-label gtpp-filter-label">Prazo entre:</label>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input
              type="date"
              className="form-control gtpp-date-input"
              value={props.dateFrom}
              max={props.dateTo || undefined}
              onChange={(e) => props.setDateFrom(e.target.value)}
              aria-label="Data inicial do prazo"
            />
            <span className="text-muted">—</span>
            <input
              type="date"
              className="form-control gtpp-date-input"
              value={props.dateTo}
              min={props.dateFrom || undefined}
              onChange={(e) => props.setDateTo(e.target.value)}
              aria-label="Data final do prazo"
            />
            <div className="d-inline-flex gap-1" data-tour="gtpp-date-presets">
              <button
                type="button"
                className="btn btn-sm gtpp-preset-btn"
                onClick={() => { const r = buildPeriodPreset("week"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Semana
              </button>
              <button
                type="button"
                className="btn btn-sm gtpp-preset-btn"
                onClick={() => { const r = buildPeriodPreset("month"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Mês
              </button>
              <button
                type="button"
                className="btn btn-sm gtpp-preset-btn gtpp-preset-btn--alert"
                onClick={() => { const r = buildPeriodPreset("overdue"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Vencidas
              </button>
            </div>
            {hasDateFilter && (
              <button
                type="button"
                className="btn btn-sm gtpp-preset-btn"
                title="Limpar filtro de prazo"
                onClick={() => { props.setDateFrom(""); props.setDateTo(""); }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>
      )}
      {isAdm && (
        <div data-tour="gtpp-collab-filter">
          <label className="form-label gtpp-filter-label">Filtrar por colaborador:</label>
          <button
            type="button"
            className="gtpp-states-trigger form-select text-start d-inline-flex align-items-center justify-content-between"
            onClick={() => props.setOpenFilterGolbal(true)}
            title="Abrir busca de colaboradores"
          >
            <span className="text-truncate">
              <i className="fa-solid fa-users me-2 text-muted"></i>
              Buscar colaboradores…
            </span>
            <i className="fa-solid fa-chevron-right text-muted" style={{ fontSize: "0.7rem" }}></i>
          </button>
        </div>
      )}
      <div data-tour="gtpp-states">
        <label className="form-label gtpp-filter-label">Filtrar pelo estado:</label>
        <button
          ref={statesTriggerRef}
          type="button"
          onClick={props.handleOpenFilter}
          className="gtpp-states-trigger form-select text-start d-inline-flex align-items-center justify-content-between"
          aria-expanded={props.openFilter}
          aria-haspopup="listbox"
        >
          <span className="text-truncate">
            {activeStatesCount === totalStates
              ? "Todos"
              : activeStatesCount === 0
              ? "Nenhum"
              : `${activeStatesCount} de ${totalStates} selecionados`}
          </span>
        </button>
        {props.openFilter && statesPos && ReactDOM.createPortal(
          <div
            className="gtpp-states-panel bg-white rounded border"
            style={{ position: "fixed", top: statesPos.top, left: statesPos.left, minWidth: statesPos.width, zIndex: 1100 }}
          >
            <div className="gtpp-states-panel-header d-flex justify-content-between align-items-center">
              <span>Estados visíveis</span>
              <span className="gtpp-states-panel-count">{activeStatesCount}/{totalStates}</span>
            </div>
            <ul className="gtpp-states-list">
              {props.states?.map((state: any) => (
                <li key={state.id}>
                  <label className="gtpp-states-row">
                    <input
                      type="checkbox"
                      checked={state.active}
                      onChange={() => props.handleCheckboxChange(state.id)}
                    />
                    <span
                      className="gtpp-states-dot"
                      style={{ backgroundColor: state.color || "#adb5bd" }}
                      aria-hidden="true"
                    ></span>
                    <span className="gtpp-states-name">{state.description}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
