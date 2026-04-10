import React, { useEffect, useRef, useState } from "react";
import "./FilterPanel.css";

export interface ActiveFilters {
  plate:    string;
  status:   "" | "1" | "0";
  valueMin: string;
  valueMax: string;
  unitName: string;
  brand:    string;
}

export const defaultFilters: ActiveFilters = {
  plate: "", status: "", valueMin: "", valueMax: "", unitName: "", brand: "",
};

interface FilterPanelProps {
  open:          boolean;
  onClose:       () => void;
  filters:       ActiveFilters;
  onChange:      (f: ActiveFilters) => void;
  onPlateSearch: (plate: string) => void;
  onClear:       () => void;
  resultCount:   number;
  unitNames:     string[];
  brands:        string[];
  anchorRef:     React.RefObject<HTMLElement>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  open, onClose, filters, onChange, onPlateSearch, onClear,
  resultCount, unitNames, brands, anchorRef,
}) => {
  const panelRef    = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const set = (field: keyof ActiveFilters, value: string) =>
    onChangeRef.current({ ...filters, [field]: value });

  // Debounce valueMin / valueMax — only propagate 350ms after typing stops
  const [localMin, setLocalMin] = useState(filters.valueMin);
  const [localMax, setLocalMax] = useState(filters.valueMax);

  useEffect(() => { setLocalMin(filters.valueMin); }, [filters.valueMin]);
  useEffect(() => { setLocalMax(filters.valueMax); }, [filters.valueMax]);

  useEffect(() => {
    const t = setTimeout(() => onChangeRef.current({ ...filters, valueMin: localMin }), 350);
    return () => clearTimeout(t);
  }, [localMin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => onChangeRef.current({ ...filters, valueMax: localMax }), 350);
    return () => clearTimeout(t);
  }, [localMax]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const activeCount = Object.entries(filters).filter(([k, v]) => v !== "" && k !== "plate").length
    + (filters.plate ? 1 : 0);

  return (
    <div className="fp-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fp-panel" ref={panelRef}>

        {/* Header */}
        <div className="fp-header">
          <div className="fp-title">
            <div className="fp-icon"><i className="fa fa-filter"></i></div>
            <span>Filtros</span>
            {activeCount > 0 && <span className="fp-badge">{activeCount}</span>}
            <span className="fp-count">{resultCount} resultado{resultCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="fp-header-actions">
            <button className="fp-btn-clear" onClick={onClear} title="Limpar filtros">
              <i className="fa fa-times"></i> Limpar
            </button>
            <button className="fp-btn-close" onClick={onClose} title="Fechar">
              <i className="fa fa-chevron-up"></i>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="fp-grid">

          {/* Placa */}
          <div className="fp-group fp-group--plate">
            <label className="fp-label"><i className="fa fa-car"></i> Placa</label>
            <div className="fp-plate-row">
              <input
                className="fp-input"
                type="text"
                placeholder="Ex: ABC-1234"
                value={filters.plate}
                onChange={e => set("plate", e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && onPlateSearch(filters.plate)}
              />
              <button className="fp-btn-search" onClick={() => onPlateSearch(filters.plate)} title="Buscar">
                <i className="fa fa-search"></i>
              </button>
            </div>
          </div>

          {/* Valor mín */}
          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-money"></i> Min value (R$)</label>
            <input className="fp-input" type="number" min="0" placeholder="0.00"
              value={localMin} onChange={e => setLocalMin(e.target.value)} />
          </div>

          {/* Valor máx */}
          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-money"></i> Max value (R$)</label>
            <input className="fp-input" type="number" min="0" placeholder="0.00"
              value={localMax} onChange={e => setLocalMax(e.target.value)} />
          </div>

          {/* Min > Max warning */}
          {localMin && localMax && Number(localMin) > Number(localMax) && (
            <div className="fp-group" style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: "0.72rem", color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                <i className="fa fa-exclamation-circle"></i> Minimum value is greater than maximum
              </span>
            </div>
          )}

          {/* Status */}
          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-power-off"></i> Status</label>
            <select className="fp-input" value={filters.status} onChange={e => set("status", e.target.value as ActiveFilters["status"])}>
              <option value="">Todos</option>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>

          {/* Unidade */}
          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-building"></i> Unidade</label>
            <select className="fp-input" value={filters.unitName} onChange={e => set("unitName", e.target.value)}>
              <option value="">Todas</option>
              {unitNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Marca */}
          <div className="fp-group">
            <label className="fp-label"><i className="fa fa-tag"></i> Marca</label>
            <select className="fp-input" value={filters.brand} onChange={e => set("brand", e.target.value)}>
              <option value="">Todas</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
