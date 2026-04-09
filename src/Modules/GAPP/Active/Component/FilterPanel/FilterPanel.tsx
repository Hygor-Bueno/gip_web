import React from "react";
import CnpjFilterInput from "./CnpjFilterInput";
import "./FilterPanel.css";

export interface ActiveFilters {
  plate:     string;
  status:    "" | "1" | "0";
  dateFrom:  string;
  dateTo:    string;
  valueMin:  string;
  valueMax:  string;
  address:   string;
  unitName:  string;
  brand:     string;
  cnpj:      string; // stored as raw digits for filtering
}

export const defaultFilters: ActiveFilters = {
  plate: "", status: "", dateFrom: "", dateTo: "",
  valueMin: "", valueMax: "", address: "",
  unitName: "", brand: "", cnpj: "",
};

interface FilterPanelProps {
  filters:       ActiveFilters;
  onChange:      (filters: ActiveFilters) => void;
  onPlateSearch: (plate: string) => void;
  onClear:       () => void;
  resultCount:   number;
  unitNames:     string[];
  brands:        string[];
  cnpjs:         string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters, onChange, onPlateSearch, onClear, resultCount,
  unitNames, brands, cnpjs,
}) => {
  const set = (field: keyof ActiveFilters, value: string) =>
    onChange({ ...filters, [field]: value });

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <div className="filter-panel-icon"><i className="fa fa-filter"></i></div>
          <span>Filtros</span>
          <span className="filter-count">{resultCount} resultado{resultCount !== 1 ? "s" : ""}</span>
        </div>
        <button className="filter-btn-clear" onClick={onClear} title="Limpar filtros">
          <i className="fa fa-times"></i> Limpar
        </button>
      </div>

      <div className="filter-grid">

        {/* Placa */}
        <div className="filter-group filter-group--plate">
          <label className="filter-label"><i className="fa fa-car"></i> Placa</label>
          <div className="filter-plate-row">
            <input
              className="filter-input"
              type="text"
              placeholder="Ex: ABC-1234"
              value={filters.plate}
              onChange={e => set("plate", e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && onPlateSearch(filters.plate)}
            />
            <button
              className="filter-btn-search"
              onClick={() => onPlateSearch(filters.plate)}
              title="Buscar por placa"
            >
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-power-off"></i> Status</label>
          <select
            className="filter-input"
            value={filters.status}
            onChange={e => set("status", e.target.value as ActiveFilters["status"])}
          >
            <option value="">Todos</option>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>

        {/* Data de — de */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-calendar"></i> Data de (compra)</label>
          <input
            className="filter-input"
            type="date"
            value={filters.dateFrom}
            onChange={e => set("dateFrom", e.target.value)}
          />
        </div>

        {/* Data até */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-calendar-check-o"></i> Data até</label>
          <input
            className="filter-input"
            type="date"
            value={filters.dateTo}
            onChange={e => set("dateTo", e.target.value)}
          />
        </div>

        {/* Valor mín. */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-money"></i> Valor mín. (R$)</label>
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="0,00"
            value={filters.valueMin}
            onChange={e => set("valueMin", e.target.value)}
          />
        </div>

        {/* Valor máx. */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-money"></i> Valor máx. (R$)</label>
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="0,00"
            value={filters.valueMax}
            onChange={e => set("valueMax", e.target.value)}
          />
        </div>

        {/* Endereço */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-map-marker"></i> Endereço</label>
          <input
            className="filter-input"
            type="text"
            placeholder="Cidade, logradouro..."
            value={filters.address}
            onChange={e => set("address", e.target.value)}
          />
        </div>

        {/* Unidade — select */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-building"></i> Nome da unidade</label>
          <select
            className="filter-input"
            value={filters.unitName}
            onChange={e => set("unitName", e.target.value)}
          >
            <option value="">Todas</option>
            {unitNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Marca — select */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-tag"></i> Marca</label>
          <select
            className="filter-input"
            value={filters.brand}
            onChange={e => set("brand", e.target.value)}
          >
            <option value="">Todas</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* CNPJ — hybrid */}
        <div className="filter-group">
          <label className="filter-label"><i className="fa fa-id-card"></i> CNPJ</label>
          <CnpjFilterInput
            value={filters.cnpj}
            onChange={raw => set("cnpj", raw)}
            cnpjs={cnpjs}
          />
        </div>

      </div>
    </div>
  );
};

export default FilterPanel;
