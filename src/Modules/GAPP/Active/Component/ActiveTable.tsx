import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FormActive from "./FormActive/FormActive";
import ServicesBox from "./ServicesBox/ServicesBox";
import InfoActive from "./InfoActive/InfoActive";
import Releases from "./Releases/Releases";
import FilterPanel, { ActiveFilters, defaultFilters } from "./FilterPanel/FilterPanel";
import { normalizeBrand } from "./FilterPanel/brandNormalization";
import { useMyContext } from "../../../../Context/MainContext";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { handleNotification } from "../../../../Util/ui/notifications";

import {
  ActiveCompanyData, ActiveData, ActiveDepartamentData, ActiveDriverData,
  ActiveInsuranceData, ActivePutData, ActiveTypeData, ActiveTypeFuelData, ActiveUnitsData,
  ActiveVehicleByPlate, ActiveVehicleData, GappUserData
} from "../Adapters/Adapters";
import { convertForTable, distinct } from "../../../../Util/Utils";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import { Active, ActiveFormValues, ActiveTableData, Insurance, VehicleFormValues } from "../Interfaces/Interfaces";
import { tItemTable } from "../../../../types/types";
import "./ActiveTable.css";

const FILTER_KEY = "gapp_active_filters";

const ActiveTable: React.FC = () => {
  const { userLog } = useMyContext();
  const [gappUserId,       setGappUserId]       = useState<number | null>(null);
  const [gappWorkGroupId,  setGappWorkGroupId]  = useState<number | null>(null);
  const [data,             setData]             = useState<Active[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [loadError,        setLoadError]        = useState<string | null>(null);
  const [selected,         setSelected]         = useState<tItemTable[]>([]);
  const [modalData,        setModalData]        = useState<ActiveTableData | null>(null);
  const [openServicesBox,  setOpenServicesBox]  = useState<boolean>(false);
  const [openModal,        setOpenModal]        = useState<boolean>(false);
  const [openAdd,          setOpenAdd]          = useState<boolean>(false);
  const [openInfo,         setOpenInfo]         = useState<boolean>(false);
  const [openReleases,     setOpenReleases]     = useState<boolean>(false);
  const [confirmToggle,    setConfirmToggle]    = useState<{ activeId: string; newStatus: string; label: string } | null>(null);
  const [loadingModal,     setLoadingModal]     = useState<boolean>(false);

  // ── Filters — persisted in localStorage (cleared by Ctrl+F5) ─────────────
  const [filters, setFilters] = useState<ActiveFilters>(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY);
      return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });
  const [plateIds,    setPlateIds]    = useState<Set<string>>(new Set());
  const [filterOpen,  setFilterOpen]  = useState(() =>
    Object.values(filters).some(v => v !== "")
  );
  const filterBtnRef  = useRef<HTMLButtonElement>(null);

  // Persist filters to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); } catch { /* quota exceeded */ }
  }, [filters]);

  // Re-run plate search on mount if a plate was saved in localStorage
  useEffect(() => {
    if (filters.plate) handlePlateSearch(filters.plate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GAPP user resolution ─────────────────────────────────────────────────
  useEffect(() => {
    if (userLog?.id) {
      GappUserData(userLog.id).then(res => {
        if (!res.error && res.data?.length) {
          setGappUserId(res.data[0].user_id);
          setGappWorkGroupId(res.data[0].group_id_fk ?? null);
        }
      });
    }
  }, [userLog?.id]);

  // ── Initial data load ────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [activeRes, driverRes, unitRes, companyRes, typeRes, fuelRes, depRes] = await Promise.all([
        ActiveData(), ActiveDriverData(), ActiveUnitsData(), ActiveCompanyData(),
        ActiveTypeData(), ActiveTypeFuelData(), ActiveDepartamentData()
      ]);
      setData(activeRes.data || []);
      setModalData({
        active:      {} as any,
        vehicle:     {} as any,
        driver:      driverRes.data  || [],
        company:     companyRes.data || [],
        unit:        unitRes.data    || [],
        activeType:  typeRes.data    || [],
        fuelType:    fuelRes.data    || [],
        departament: depRes.data     || [],
        insurance:   {} as any,
      });
    } catch (error) {
      setLoadError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // ── Plate search ─────────────────────────────────────────────────────────
  const handlePlateSearch = useCallback(async (plate: string) => {
    if (!plate.trim()) { setPlateIds(new Set()); return; }
    try {
      const res = await ActiveVehicleByPlate(plate.trim());
      if (res.error || !res.data?.length) {
        handleNotification("Placa não encontrada", "Nenhum veículo encontrado para a placa informada.", "warning");
        setPlateIds(new Set());
        return;
      }
      const ids = new Set<string>(res.data.map((v: any) => String(v.active_id_fk)));
      setPlateIds(ids);
    } catch {
      setPlateIds(new Set());
    }
  }, []);

  // ── Clear all filters ────────────────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPlateIds(new Set());
    try { localStorage.removeItem(FILTER_KEY); } catch { /* ignore */ }
  }, []);

  // ── Lock body scroll when any modal is open ───────────────────────────────
  const anyModalOpen = openModal || openAdd || openInfo || openServicesBox || openReleases || !!confirmToggle;
  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModalOpen]);

  // ── Pre-normalize expensive fields once when data changes ────────────────
  const enrichedData = useMemo(() =>
    (data ?? []).map(a => ({
      raw:    a,
      id:     String(a.active_id),
      status: String(a.status_active),
      value:  Number(a.value_purchase),
      unit:   (a.unit_name ?? "").trim().toUpperCase(),
      brand:  normalizeBrand((a.brand ?? "").split("-")[0]),
    })),
  [data]);

  // ── Single-pass filter against pre-normalized fields ──────────────────────
  const filteredData = useMemo(() => {
    const minVal = filters.valueMin ? Number(filters.valueMin) : null;
    const maxVal = filters.valueMax ? Number(filters.valueMax) : null;

    return enrichedData
      .filter(a => {
        if (plateIds.size > 0 && !plateIds.has(a.id))          return false;
        if (filters.status   && a.status !== filters.status)    return false;
        if (minVal !== null  && a.value  <  minVal)             return false;
        if (maxVal !== null  && a.value  >  maxVal)             return false;
        if (filters.unitName && a.unit   !== filters.unitName.trim().toUpperCase())  return false;
        if (filters.brand    && a.brand  !== filters.brand)     return false;
        return true;
      })
      .map(a => a.raw);
  }, [enrichedData, filters, plateIds]);

  const dataMap   = useMemo(() => new Map(data.map(a => [String(a.active_id), a])), [data]);
  const unitNames = useMemo(() => distinct(data.map(a => a.unit_name)), [data]); // original casing for display
  const brands    = useMemo(() => distinct(enrichedData.map(a => a.brand)), [enrichedData]);

  const activeFilterCount = useMemo(() =>
    Object.entries(filters).filter(([k, v]) => k !== "plate" && v !== "").length
    + (plateIds.size > 0 ? 1 : 0),
  [filters, plateIds]);

  const tableList = useMemo(() => convertForTable(filteredData ?? [], {
    ocultColumns: listColumnsOcult,
    customTags:   customTagsActive,
    customValue:  customValueActive,
  }), [filteredData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = useCallback(async (item: tItemTable[]) => {
    setSelected(item);
    if (!item?.length || !item[0]?.active_id?.value) return;
    const selectedActiveId = String(item[0].active_id.value);
    const activeRecord     = dataMap.get(selectedActiveId);
    const isVehicle        = Number(activeRecord?.is_vehicle) === 1;

    setModalData(prev => prev ? { ...prev, active: activeRecord || ({} as any), vehicle: {}, insurance: {} as any } : null);

    if (isVehicle) {
      setLoadingModal(true);
      try {
        const vehicleRes   = await ActiveVehicleData(selectedActiveId);
        if (vehicleRes.error) throw new Error(vehicleRes.message);
        const vehicleId    = vehicleRes.data?.[0]?.vehicle_id || "0";
        const insuranceRes = await ActiveInsuranceData(vehicleId);
        setModalData(prev => prev ? {
          ...prev,
          vehicle:   vehicleRes.data?.[0]  || {},
          insurance: insuranceRes.data?.[0] || {} as any,
        } : null);
      } catch (error) {
        console.error("Erro ao buscar dados do veículo ou seguro:", error);
      } finally {
        setLoadingModal(false);
      }
    }
  }, [dataMap]);

  const handleServicesBox       = useCallback(async (item: tItemTable[]) => { await handleSelect(item); setOpenServicesBox(true); }, [handleSelect]);
  const handleInfo              = useCallback(() => { setOpenServicesBox(false); setOpenInfo(true); }, []);
  const handleEdit              = useCallback(() => { setOpenServicesBox(false); setOpenModal(true); }, []);
  const handleBackToServicesBox = useCallback(() => { setOpenModal(false); setOpenServicesBox(true); }, []);
  const handleReleases          = useCallback(() => { setOpenServicesBox(false); setOpenReleases(true); }, []);
  const handleAdd               = useCallback(() => { setOpenServicesBox(false); setOpenAdd(true); }, []);

  const handleCreate = useCallback(({ active }: { active?: Partial<ActiveFormValues>; vehicle?: Partial<VehicleFormValues>; insurance?: Partial<Insurance> }) => {
    if (active) setData(prev => [...prev, active as Active | any]);
  }, []);

  const handleToggleStatus = useCallback(() => {
    if (!selected.length || !selected[0]?.active_id?.value) return;
    const activeId  = String(selected[0].active_id.value);
    const current   = data.find(d => String(d.active_id) === activeId);
    const newStatus = String(current?.status_active) === "1" ? "0" : "1";
    const label     = newStatus === "1" ? "ativar" : "inativar";
    setOpenServicesBox(false); // fecha ServicesBox antes de abrir o modal
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
  }, [confirmToggle]);

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

  const handleSave = useCallback(({ active, vehicle, insurance }: { active?: Partial<ActiveFormValues>; vehicle?: Partial<VehicleFormValues>; insurance?: Partial<Insurance> }) => {
    if (active) {
      setData(prev => prev.map(item => String(item.active_id) === String(active.active_id) ? { ...item, ...active } as Active : item));
    }
    if (vehicle || insurance) {
      setModalData(prev => prev ? { ...prev, ...(vehicle && { vehicle }), ...(insurance && { insurance: insurance as Insurance }) } : null);
    }
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center h-100"><span>Carregando...</span></div>;
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
        <InfoActive data={modalData} onClose={() => setOpenInfo(false)} onBack={() => { setOpenInfo(false); setOpenServicesBox(true); }} />
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
        <FormActive apiData={modalData} openModal={setOpenModal} onBack={handleBackToServicesBox} onSave={handleSave} />
      )}

      {openAdd && modalData && (
        <FormActive
          mode="add"
          gappUserId={gappUserId}
          gappWorkGroupId={gappWorkGroupId}
          apiData={{ driver: modalData.driver, company: modalData.company, unit: modalData.unit, activeType: modalData.activeType, fuelType: modalData.fuelType, departament: modalData.departament }}
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
