import React, { useMemo } from "react";
import CustomTable from "../../../../../Components/CustomTable";
import { tItemTable } from "../../../../../types/types";
import { ActiveForMovement, MovementFormState } from "../../Interfaces/MovementInterfaces";

interface Props {
  form:               MovementFormState;
  setForm:            React.Dispatch<React.SetStateAction<MovementFormState>>;
  filteredActives:    ActiveForMovement[];
  activeFilterCount:  number;
  filterOpen:         boolean;
  setFilterOpen:      (open: boolean | ((o: boolean) => boolean)) => void;
  filterBtnRef:       React.RefObject<HTMLButtonElement>;
  filterPanelRef:     React.RefObject<HTMLDivElement>;
  search:             string;
  setSearch:          (v: string) => void;
  plateInput:         string;
  setPlateInput:      (v: string) => void;
  handleClearFilters: () => void;
  selectedActives:    ActiveForMovement[];
  toggleActive:       (active: ActiveForMovement) => void;
  handleAdvance:      () => void;
}

export default function Phase0Selection({
  form, setForm,
  filteredActives, activeFilterCount,
  filterOpen, setFilterOpen, filterBtnRef, filterPanelRef,
  search, setSearch,
  plateInput, setPlateInput,
  handleClearFilters,
  selectedActives, toggleActive,
  handleAdvance,
}: Props) {

  const tableList: tItemTable[] = useMemo(() =>
    filteredActives.map(a => ({
      active_id:         { tag: "Cód.",     value: String(a.active_id) },
      brand:             { tag: "Marca",    value: a.brand ?? "—" },
      model:             { tag: "Modelo",   value: a.model ?? "—" },
      desc_active_class: { tag: "Classe",   value: a.desc_active_class ?? "—" },
      license_plates:    { tag: "Placa",    value: a.license_plates ?? "—" },
      unit_name:         { tag: "Unidade",  value: a.unit_name ?? "—" },
    })),
  [filteredActives]);

  const selectedTableItems: tItemTable[] = useMemo(() =>
    tableList.filter(row =>
      selectedActives.some(a => String(a.active_id) === row.active_id.value)
    ),
  [tableList, selectedActives]);

  function handleRowClick(item: tItemTable) {
    const active = filteredActives.find(a => String(a.active_id) === item.active_id.value);
    if (active) toggleActive(active);
  }

  function handleConfirm() {
    handleAdvance();
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="mvform-phase0-header">
        <div className="mvform-type-toggle">
          <button
            className={`mvform-type-btn${form.type_movimentation === "internal" ? " active" : ""}`}
            onClick={() => setForm(f => ({ ...f, type_movimentation: "internal" }))}
          >
            <i className="fa fa-building" /> Interna
          </button>
          <button
            className={`mvform-type-btn${form.type_movimentation === "external" ? " active" : ""}`}
            onClick={() => setForm(f => ({ ...f, type_movimentation: "external" }))}
          >
            <i className="fa fa-external-link" /> Externa
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <span className="mvform-result-count">
          {filteredActives.length} ativo{filteredActives.length !== 1 ? "s" : ""}
        </span>

        <button
          ref={filterBtnRef}
          className={`mvform-btn-filter${filterOpen || activeFilterCount > 0 ? " active" : ""}`}
          onClick={() => setFilterOpen(o => !o)}
        >
          <i className="fa fa-filter" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="mvform-filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ── Floating filter panel ── */}
      {filterOpen && (
        <div className="mvform-fp-backdrop">
          <div className="mvform-fp-panel" ref={filterPanelRef}>

            <div className="mvform-fp-header">
              <div className="mvform-fp-title">
                <div className="mvform-fp-icon"><i className="fa fa-filter" /></div>
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="mvform-fp-badge">{activeFilterCount}</span>
                )}
                <span className="mvform-fp-count">
                  {filteredActives.length} resultado{filteredActives.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mvform-fp-header-actions">
                {activeFilterCount > 0 && (
                  <button className="mvform-fp-btn-clear" onClick={handleClearFilters}>
                    <i className="fa fa-times" /> Limpar
                  </button>
                )}
                <button className="mvform-fp-btn-close" onClick={() => setFilterOpen(false)}>
                  <i className="fa fa-chevron-up" />
                </button>
              </div>
            </div>

            <div className="mvform-fp-grid">

              {/* Text search */}
              <div className="mvform-fp-group mvform-fp-group--full">
                <label className="mvform-fp-label">
                  <i className="fa fa-search" /> Busca geral
                </label>
                <div className="mvform-fp-search-wrap">
                  <input
                    className="mvform-fp-input"
                    type="text"
                    placeholder="Código, marca, modelo ou unidade..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="mvform-fp-search-clear" onClick={() => setSearch("")}>
                      <i className="fa fa-times" />
                    </button>
                  )}
                </div>
              </div>

              {/* Plate — client-side, no API call */}
              <div className="mvform-fp-group mvform-fp-group--full">
                <label className="mvform-fp-label">
                  <i className="fa fa-car" /> Placa
                </label>
                <div className="mvform-fp-plate-row">
                  <input
                    className="mvform-fp-input mvform-fp-input--plate"
                    type="text"
                    placeholder="Ex: ABC1234 ou ABC-1234"
                    value={plateInput}
                    maxLength={8}
                    onChange={e => setPlateInput(e.target.value.toUpperCase())}
                  />
                  {plateInput && (
                    <button
                      className="mvform-fp-btn-clear-plate"
                      onClick={() => setPlateInput("")}
                      title="Limpar filtro de placa"
                    >
                      <i className="fa fa-times" />
                    </button>
                  )}
                </div>
                {plateInput && (
                  <span className={`mvform-fp-plate-result${filteredActives.length === 0 ? " none" : ""}`}>
                    <i className={`fa ${filteredActives.length > 0 ? "fa-check-circle" : "fa-exclamation-circle"}`} />
                    {filteredActives.length > 0
                      ? `${filteredActives.length} ativo${filteredActives.length !== 1 ? "s" : ""} encontrado${filteredActives.length !== 1 ? "s" : ""}`
                      : "Nenhum ativo encontrado para esta placa"}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* External notice */}
      {form.type_movimentation === "external" && (
        <div className="mvform-notice">
          <i className="fa fa-info-circle" />
          Movimentação externa: selecione apenas 1 ativo por vez.
        </div>
      )}

      {/* ── Table + Footer wrapper ── */}
      <div className="mvform-body">

        <CustomTable
          list={tableList}
          onConfirmList={handleConfirm}
          selectedItems={selectedTableItems}
          selectionKey="active_id"
          selectionList={selectedTableItems}
          hideSelectAll
          onRowClick={handleRowClick}
        />

      </div>
    </>
  );
}
