import { useState, useEffect, useCallback, useMemo } from "react";
import { useMyContext } from "../../../../../Context/MainContext";
import {
  ActiveData, ActiveDriverData, ActiveUnitsData, ActiveCompanyData,
  ActiveTypeData, ActiveTypeFuelData, ActiveDepartamentData,
  ActiveVehicleData, ActiveInsuranceData, GappUserData,
} from "../../Adapters/Adapters";
import { Active, ActiveFormValues, ActiveTableData, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";
import { tItemTable } from "../../../../../types/types";

export interface UseActiveDataReturn {
  gappUserId:     number | null;
  gappWorkGroupId: number | null;
  data:           Active[];
  setData:        React.Dispatch<React.SetStateAction<Active[]>>;
  loading:        boolean;
  loadError:      string | null;
  loadAllData:    () => Promise<void>;
  modalData:      ActiveTableData | null;
  setModalData:   React.Dispatch<React.SetStateAction<ActiveTableData | null>>;
  loadingModal:   boolean;
  dataMap:        Map<string, Active>;
  handleSelect:   (item: tItemTable[]) => Promise<void>;
  handleSave:     (updated: { active?: Partial<ActiveFormValues>; vehicle?: Partial<VehicleFormValues>; insurance?: Partial<Insurance> }) => void;
  handleCreate:   (updated: { active?: Partial<ActiveFormValues>; vehicle?: Partial<VehicleFormValues>; insurance?: Partial<Insurance> }) => void;
}

export function useActiveData(): UseActiveDataReturn {
  const { userLog } = useMyContext();

  const [gappUserId,      setGappUserId]      = useState<number | null>(null);
  const [gappWorkGroupId, setGappWorkGroupId] = useState<number | null>(null);
  const [data,            setData]            = useState<Active[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [loadError,       setLoadError]       = useState<string | null>(null);
  const [modalData,       setModalData]       = useState<ActiveTableData | null>(null);
  const [loadingModal,    setLoadingModal]    = useState(false);

  // ── GAPP user resolution ──────────────────────────────────────────────────
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
        ActiveTypeData(), ActiveTypeFuelData(), ActiveDepartamentData(),
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
    } catch {
      setLoadError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const dataMap = useMemo(() => new Map(data.map(a => [String(a.active_id), a])), [data]);

  // ── Select asset and lazy-load vehicle/insurance ──────────────────────────
  const handleSelect = useCallback(async (item: tItemTable[]) => {
    if (!item?.length || !item[0]?.active_id?.value) return;
    const selectedActiveId = String(item[0].active_id.value);
    const activeRecord     = dataMap.get(selectedActiveId);
    const isVehicle        = Number(activeRecord?.is_vehicle) === 1;

    setModalData(prev => prev
      ? { ...prev, active: activeRecord || ({} as any), vehicle: {}, insurance: {} as any }
      : null
    );

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

  const handleSave = useCallback(({ active, vehicle, insurance }: {
    active?: Partial<ActiveFormValues>;
    vehicle?: Partial<VehicleFormValues>;
    insurance?: Partial<Insurance>;
  }) => {
    if (active) {
      setData(prev => prev.map(item =>
        String(item.active_id) === String(active.active_id)
          ? { ...item, ...active } as Active
          : item
      ));
    }
    if (vehicle || insurance) {
      setModalData(prev => prev ? {
        ...prev,
        ...(vehicle   && { vehicle }),
        ...(insurance && { insurance: insurance as Insurance }),
      } : null);
    }
  }, []);

  const handleCreate = useCallback(({ active }: {
    active?: Partial<ActiveFormValues>;
    vehicle?: Partial<VehicleFormValues>;
    insurance?: Partial<Insurance>;
  }) => {
    if (active) setData(prev => [...prev, active as Active | any]);
  }, []);

  return {
    gappUserId, gappWorkGroupId,
    data, setData,
    loading, loadError, loadAllData,
    modalData, setModalData, loadingModal,
    dataMap,
    handleSelect, handleSave, handleCreate,
  };
}
