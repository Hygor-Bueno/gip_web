import React, { useEffect, useState, useCallback, useMemo } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FormActive from "./FormActive/FormActive";
import ServicesBox from "./ServicesBox/ServicesBox";
import InfoActive from "./InfoActive/InfoActive";
import Releases from "./Releases/Releases";
import { useMyContext } from "../../../../Context/MainContext";

import {
  ActiveCompanyData, ActiveData, ActiveDepartamentData, ActiveDriverData,
  ActiveInsuranceData, ActivePutData, ActiveTypeData, ActiveTypeFuelData, ActiveUnitsData,
  ActiveVehicleData, GappUserData
} from "../Adapters/Adapters";
import { convertForTable } from "../../../../Util/Utils";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import { Active, ActiveFormValues, ActiveTableData, Insurance, VehicleFormValues } from "../Interfaces/Interfaces";
import { tItemTable } from "../../../../types/types";
import "./ActiveTable.css";

const ActiveTable: React.FC = () => {
  const { userLog } = useMyContext();
  const [gappUserId,       setGappUserId]       = useState<number | null>(null);
  const [gappWorkGroupId,  setGappWorkGroupId]  = useState<number | null>(null);
  const [data, setData] = useState<Active[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<tItemTable[]>([]);
  const [modalData, setModalData] = useState<ActiveTableData | null>(null);
  const [openServicesBox, setOpenServicesBox] = useState<boolean>(false);
  const [openModal,       setOpenModal]       = useState<boolean>(false);
  const [openAdd,         setOpenAdd]         = useState<boolean>(false);
  const [openInfo,        setOpenInfo]        = useState<boolean>(false);
  const [openReleases,    setOpenReleases]    = useState<boolean>(false);

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

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [
          activeRes,
          driverRes,
          unitRes,
          companyRes,
          typeRes,
          fuelRes,
          depRes
        ] = await Promise.all([
          ActiveData(),
          ActiveDriverData(),
          ActiveUnitsData(),
          ActiveCompanyData(),
          ActiveTypeData(),
          ActiveTypeFuelData(),
          ActiveDepartamentData()
        ]);
        
        setData(activeRes.data || []);

        setModalData({
          active: {} as any,
          vehicle: {} as any,
          driver: driverRes.data || [],
          company: companyRes.data || [],
          unit: unitRes.data || [],
          activeType: typeRes.data || [],
          fuelType: fuelRes.data || [],
          departament: depRes.data || [],
          insurance: {} as any, 
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleSelect = useCallback(async (item: tItemTable[]) => {
    setSelected(item);
    if (!item?.length || !item[0]?.active_id?.value) return;

    const selectedActiveId = String(item[0].active_id.value);
    const activeRecord = data.find(d => String(d.active_id) === selectedActiveId);
    const isVehicle = Number(activeRecord?.is_vehicle) === 1;

    try {
      setModalData((prev) => prev ? {
        ...prev,
        active:    activeRecord || ({} as any),
        vehicle:   {},
        insurance: {} as any,
      } : null);

      if (isVehicle) {
        const vehicleRes = await ActiveVehicleData(selectedActiveId);
        if (vehicleRes.error) throw new Error(vehicleRes.message);

        const vehicleId   = vehicleRes.data?.[0]?.vehicle_id || "0";
        const insuranceRes = await ActiveInsuranceData(vehicleId);

        setModalData((prev) => prev ? {
          ...prev,
          vehicle:   vehicleRes.data?.[0] || {},
          insurance: insuranceRes.data?.[0] || {} as any,
        } : null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do veículo ou seguro:", error);
    }
  }, [data]);

  const handleServicesBox = useCallback(async (item: tItemTable[]) => {
    setOpenServicesBox(true);
    handleSelect(item);
  }, [handleSelect]);

  const handleInfo = useCallback(() => {
    setOpenServicesBox(false);
    setOpenInfo(true);
  }, []);

  const handleEdit = useCallback(() => {
    setOpenServicesBox(false);
    setOpenModal(true);
  }, []);

  const handleBackToServicesBox = useCallback(() => {
    setOpenModal(false);
    setOpenServicesBox(true);
  }, []);

  const handleReleases = useCallback(() => {
    setOpenServicesBox(false);
    setOpenReleases(true);
  }, []);

  const handleAdd = useCallback(() => {
    setOpenServicesBox(false);
    setOpenAdd(true);
  }, []);

  const handleCreate = useCallback(({ active }: {
    active?: Partial<ActiveFormValues>;
    vehicle?: Partial<VehicleFormValues>;
    insurance?: Partial<Insurance>;
  }) => {
    if (active) {
      setData((prev) => [...prev, active as Active | any]);
    }
  }, []);

  const tableList = useMemo(() => convertForTable(data, {
    ocultColumns: listColumnsOcult,
    customTags: customTagsActive,
    customValue: customValueActive
  }), [data]);

  const handleToggleStatus = useCallback(async () => {
    if (!selected.length || !selected[0]?.active_id?.value) return;
    const activeId   = String(selected[0].active_id.value);
    const current    = data.find(d => String(d.active_id) === activeId);
    const newStatus  = String(current?.status_active) === "1" ? "0" : "1";
    if (!window.confirm(`Deseja realmente ${newStatus === "1" ? "ativar" : "inativar"} este ativo?`)) return;

    try {
      const res = await ActivePutData({ active_id: activeId, status_active: newStatus });
      if (res.error) throw new Error(res.message);
      setData(prev => prev.map(a =>
        String(a.active_id) === activeId ? { ...a, status_active: newStatus } : a
      ));
      setOpenServicesBox(false);
    } catch (err: any) {
      alert("Erro ao alterar status: " + err.message);
    }
  }, [selected, data]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Código", "Marca", "Modelo", "Tipo Ativo", "Unidade", "Valor Compra", "Data Compra"];
    const rows = data.map(a => [
      a.active_id,
      a.brand,
      a.model,
      a.desc_active_class,
      a.unit_name,
      a.value_purchase,
      a.date_purchase,
    ]);
    const csv  = [headers, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ativos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleSave = useCallback(({ active, vehicle, insurance }: {
    active?: Partial<ActiveFormValues>;
    vehicle?: Partial<VehicleFormValues>;
    insurance?: Partial<Insurance>;
  }) => {
    if (active) {
      setData((prev) =>
        prev.map((item) =>
          String(item.active_id) === String(active.active_id)
            ? { ...item, ...active } as Active
            : item
        )
      );
    }

    if (vehicle || insurance) {
      setModalData((prev) => prev ? {
        ...prev,
        ...(vehicle   && { vehicle }),
        ...(insurance && { insurance: insurance as Insurance }),
      } : null);
    }
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!data.length) return <div>Nenhum dado encontrado</div>;

  return (
    <div className="d-flex flex-column flex-grow-1 p-2" style={{ minWidth: 0, overflow: "hidden" }}>
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
        <div className="d-flex gap-2">
          <button className="btn-export-csv" onClick={handleExportCSV} title="Exportar CSV">
            <i className="fa fa-table"></i> CSV
          </button>
          <button className="btn-add-active" onClick={handleAdd} title="Adicionar novo ativo">
            <span className="btn-add-active-icon">
              <i className="fa fa-plus text-white"></i>
            </span>
            Novo Ativo
          </button>
        </div>
      </div>

      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <CustomTable 
          list={tableList} 
          onConfirmList={handleServicesBox} 
          maxSelection={1} 
        />
      </div>

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

      {openReleases && selected.length > 0 && Boolean(modalData?.active?.is_vehicle) && (
        <Releases
          activeId={String(selected[0]?.active_id?.value)}
          userId={String(userLog?.id)}
          isVehicle={true}
          onClose={() => { setOpenReleases(false); setOpenServicesBox(true); }}
        />
      )}
    </div>
  );
};

export default ActiveTable;