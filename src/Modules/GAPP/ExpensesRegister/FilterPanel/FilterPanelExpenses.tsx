import React, { useEffect, useRef } from "react";
import "../../Active/Component/FilterPanel/FilterPanel.css";

export interface IFormExpenses {
  date_start:     string;
  date_end:       string;
  license_plates: string;
  unit_id:        string;
  exp_type_id_fk: string;
}

interface FilterPanelExpensesProps {
  open:              boolean;
  formData:          IFormExpenses;
  onChange:          (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPlateChange:     (value: string) => void;
  onApply:           () => void;
  onClear:           () => void;
  onClose:           () => void;
  resultCount:       number;
  activeFilterCount: number;
  units:             { label: string; value: string }[];
  expensesType:      { label: string; value: string }[];
  anchorRef:         React.RefObject<HTMLElement>;
}

const FilterPanelExpenses: React.FC<FilterPanelExpensesProps> = ({
  open, formData, onChange, onPlateChange, onApply, onClear, onClose,
  resultCount, activeFilterCount, units, expensesType, anchorRef,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Outside-click closes the panel (ignores clicks on the anchor button)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current  && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div className="fp-backdrop">
      <div className="fp-panel" ref={panelRef}>

        {/* Header */}
        <div className="fp-header">
          <div className="fp-title">
            <div className="fp-icon"><i className="fa fa-filter" /></div>
            <span>Filtros</span>
            {activeFilterCount > 0 && <span className="fp-badge">{activeFilterCount}</span>}
            <span className="fp-count">{resultCount} resultado{resultCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="fp-header-actions">
            <button className="fp-btn-clear" type="button" onClick={onClear} title="Limpar filtros">
              <i className="fa fa-times" /> Limpar
            </button>
            <button className="fp-btn-close" type="button" onClick={onClose} title="Fechar">
              <i className="fa fa-chevron-up" />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="fp-grid">

          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-calendar" /> Data Inicial</label>
            <input className="fp-input" type="date" name="date_start" value={formData.date_start} onChange={onChange} />
          </div>

          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-calendar" /> Data Final</label>
            <input className="fp-input" type="date" name="date_end" value={formData.date_end} onChange={onChange} />
          </div>

          <div className="fp-group fp-group--plate">
            <label className="fp-label"><i className="fa fa-car" /> Placa</label>
            <div className="fp-plate-row">
              <input
                className="fp-input"
                type="text"
                name="license_plates"
                placeholder="Ex: ABC-1234"
                value={formData.license_plates}
                onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onApply()}
              />
              <button className="fp-btn-search" type="button" onClick={onApply} title="Buscar">
                <i className="fa fa-search" />
              </button>
            </div>
          </div>

          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-building" /> Unidade</label>
            <select className="fp-input" name="unit_id" value={formData.unit_id} onChange={onChange}>
              <option value="">Todas</option>
              {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-tag" /> Tipo de Despesa</label>
            <select className="fp-input" name="exp_type_id_fk" value={formData.exp_type_id_fk} onChange={onChange}>
              <option value="">Todos</option>
              {expensesType.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="fp-group" style={{ gridColumn: "span 2" }}>
            <button
              className="fp-btn-search"
              type="button"
              onClick={onApply}
              style={{ width: "100%", height: 34 }}
            >
              Buscar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FilterPanelExpenses;
