import React, { useEffect, useState, useCallback } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FormActive from "./FormActive/FormActive";
import ServicesBox from "./ServicesBox/ServicesBox";
import InfoActive from "./InfoActive/InfoActive";
import Releases from "./Releases/Releases";
import FilterPanel from "./FilterPanel/FilterPanel";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { handleNotification } from "../../../../Util/ui/notifications";
import { ActivePutData } from "../Adapters/Adapters";
import { Active, ActiveFormValues, Insurance, VehicleFormValues } from "../Interfaces/Interfaces";
import { tItemTable } from "../../../../types/types";
import { useActiveData } from "./Hooks/useActiveData";
import { useActiveFilters } from "./Hooks/useActiveFilters";
import "./ActiveTable.css";

const ActiveTable: React.FC = () => {
  const {
    gappUserId, gappWorkGroupId,
    data, setData,
    loading, loadError, loadAllData,
    modalData, loadingModal,
    handleSelect, handleSave, handleCreate,
  } = useActiveData();

  const {
    filters, setFilters,
    plateIds,
    filterOpen, setFilterOpen,
    filterBtnRef,
    filteredData, unitNames, brands,
    activeFilterCount, tableList,
    handlePlateSearch, handleClearFilters,
  } = useActiveFilters(data);

  const [selected,      setSelected]      = useState<tItemTable[]>([]);
  const [openServicesBox, setOpenServicesBox] = useState(false);
  const [openModal,     setOpenModal]     = useState(false);
  const [openAdd,       setOpenAdd]       = useState(false);
  const [openInfo,      setOpenInfo]      = useState(false);
  const [openReleases,  setOpenReleases]  = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ activeId: string; newStatus: string; label: string } | null>(null);

  // ── Lock body scroll when any modal is open ──────────────────────────────
  const anyModalOpen = openModal || openAdd || openInfo || openServicesBox || openReleases || !!confirmToggle;
  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModalOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleServicesBox = useCallback(async (item: tItemTable[]) => {
    setSelected(item);
    await handleSelect(item);
    setOpenServicesBox(true);
  }, [handleSelect]);

  const handleInfo              = useCallback(() => { setOpenServicesBox(false); setOpenInfo(true); }, []);
  const handleEdit              = useCallback(() => { setOpenServicesBox(false); setOpenModal(true); }, []);
  const handleBackToServicesBox = useCallback(() => { setOpenModal(false); setOpenServicesBox(true); }, []);
  const handleReleases          = useCallback(() => { setOpenServicesBox(false); setOpenReleases(true); }, []);
  const handleAdd               = useCallback(() => { setOpenServicesBox(false); setOpenAdd(true); }, []);

  const handleToggleStatus = useCallback(() => {
    if (!selected.length || !selected[0]?.active_id?.value) return;
    const activeId  = String(selected[0].active_id.value);
    const current   = data.find(d => String(d.active_id) === activeId);
    const newStatus = String(current?.status_active) === "1" ? "0" : "1";
    const label     = newStatus === "1" ? "ativar" : "inativar";
    setOpenServicesBox(false);
    setConfirmToggle({ activeId, newStatus, label });
  }, [selected, data]);

  const executeToggle = useCallback(async () => {
    if (!confirmToggle) return;
    const { activeId, newStatus } = confirmToggle;
    setConfirmToggle(null);
    try {
      const res = await ActivePutData({ active_id: activeId, status_active: newStatus });
      if (res.error) throw new Error(res.message);
      setData(prev => prev.map(a => String(a.active_id) === activeId ? { ...a, status_active: newStatus } : a));
      handleNotification(
        newStatus === "1" ? "Ativo ativado" : "Ativo inativado",
        `O ativo foi ${newStatus === "1" ? "ativado" : "inativado"} com sucesso.`,
        newStatus === "1" ? "success" : "warning"
      );
    } catch (err: any) {
      handleNotification("Erro ao alterar status", err.message || "Tente novamente.", "danger");
    }
  }, [confirmToggle, setData]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Código", "Marca", "Modelo", "Tipo Ativo", "Unidade", "Valor Compra", "Data Compra"];
    const rows    = (filteredData ?? []).map(a => [a.active_id, a.brand, a.model, a.desc_active_class, a.unit_name, a.value_purchase, a.date_purchase]);
    const csv     = [headers, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob    = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `ativos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  // ── Loading / error / empty states ────────────────────────────────────────
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <span>Carregando...</span>
    </div>
  );
  if (loadError) return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2">
      <i className="fa fa-exclamation-triangle fa-2x" style={{ color: "#dc2626" }}></i>
      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{loadError}</span>
      <button className="btn-export-csv" onClick={loadAllData}>
        <i className="fa fa-refresh"></i> Try again
      </button>
    </div>
  );
  if (!data.length) return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2">
      <i className="fa fa-inbox fa-2x" style={{ color: "#bed989" }}></i>
      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>No data found</span>
      <button className="btn-export-csv" onClick={loadAllData}>
        <i className="fa fa-refresh"></i> Reload
      </button>
    </div>
  );

  return (
    <div className="d-flex flex-column flex-grow-1 p-2" style={{ minWidth: 0, overflow: "hidden" }}>

      {/* Toolbar */}
      <div className="active-toolbar">
        <div className="active-toolbar-title">
          <div className="active-toolbar-title-icon">
            <i className="fa fa-cube text-white"></i>
          </div>
          <div>
            <p className="active-toolbar-title-text">Gestão de Ativos</p>
            <p className="active-toolbar-title-sub">Selecione um item para gerenciar</p>
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button className="btn-export-csv" onClick={() => console.log('Fechar nav menu')} title={false ? "Fechar menu de navegação" : "Abrir menu de navegação"}>
            <i className="fa fa-solid fa-eye"></i>
          </button>
          <button
            ref={filterBtnRef}
            className={`btn-filter-toggle${filterOpen || activeFilterCount > 0 ? " active" : ""}`}
            onClick={() => setFilterOpen(o => !o)}
            title="Filtros"
          >
            <i className="fa fa-filter"></i> Filtros
            {activeFilterCount > 0 && (
              <span className="fp-toggle-badge">{activeFilterCount}</span>
            )}
          </button>
          <button className="btn-export-csv" onClick={handleExportCSV} title="Exportar CSV">
            <i className="fa fa-table"></i> CSV
          </button>
          <button className="btn-add-active" onClick={handleAdd} title="Adicionar novo ativo">
            <span className="btn-add-active-icon"><i className="fa fa-plus text-white"></i></span>
            Novo Ativo
          </button>
        </div>
      </div>

      {/* Floating filter panel */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onPlateSearch={handlePlateSearch}
        onClear={handleClearFilters}
        resultCount={filteredData?.length ?? 0}
        unitNames={unitNames}
        brands={brands}
        anchorRef={filterBtnRef as React.RefObject<HTMLElement>}
      />

      {/* Table */}
      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <CustomTable list={tableList} onConfirmList={handleServicesBox} maxSelection={1} />
      </div>

      {/* Modals */}
      {openInfo && modalData && (
        <InfoActive
          data={modalData}
          onClose={() => setOpenInfo(false)}
          onBack={() => { setOpenInfo(false); setOpenServicesBox(true); }}
        />
      )}

      {openServicesBox && selected.length > 0 && (
        <ServicesBox
          onClose={() => setOpenServicesBox(false)}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onPower={handleReleases}
          onToggleStatus={handleToggleStatus}
          isVehicle={Boolean(modalData?.active?.is_vehicle)}
          statusActive={modalData?.active?.status_active}
          loading={loadingModal}
        />
      )}

      {openModal && selected.length > 0 && modalData && (
        <FormActive
          apiData={modalData}
          openModal={setOpenModal}
          onBack={handleBackToServicesBox}
          onSave={handleSave}
        />
      )}

      {openAdd && modalData && (
        <FormActive
          mode="add"
          gappUserId={gappUserId}
          gappWorkGroupId={gappWorkGroupId}
          apiData={{
            driver:      modalData.driver,
            company:     modalData.company,
            unit:        modalData.unit,
            activeType:  modalData.activeType,
            fuelType:    modalData.fuelType,
            departament: modalData.departament,
          }}
          openModal={setOpenAdd}
          onSave={handleCreate}
        />
      )}

      {openReleases && selected.length > 0 && Boolean(modalData?.active?.is_vehicle) && gappUserId !== null && (
        <Releases
          activeId={String(selected[0]?.active_id?.value)}
          userId={String(gappUserId)}
          isVehicle={true}
          gappWorkGroupId={gappWorkGroupId}
          onClose={() => { setOpenReleases(false); setOpenServicesBox(true); }}
        />
      )}

      {confirmToggle && (
        <ConfirmModal
          title={confirmToggle.label === "ativar" ? "Ativar ativo" : "Inativar ativo"}
          message={`Deseja realmente ${confirmToggle.label} este ativo? Esta ação poderá ser revertida a qualquer momento.`}
          confirmLabel={confirmToggle.label === "ativar" ? "Sim, ativar" : "Sim, inativar"}
          cancelLabel="Cancelar"
          variant={confirmToggle.label === "ativar" ? "warning" : "danger"}
          onConfirm={executeToggle}
          onClose={() => { setConfirmToggle(null); setOpenServicesBox(true); }}
        />
      )}
    </div>
  );
};

export default ActiveTable;
