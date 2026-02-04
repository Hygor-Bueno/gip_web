import React, { useEffect, useState, useCallback, useMemo } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FormActive from "./FormActive/FormActive";

import {
  ActiveCompanyData,
  ActiveData,
  ActiveDepartamentData,
  ActiveDriverData,
  ActiveTypeData,
  ActiveTypeFuelData,
  ActiveUnitsData,
  ActiveVehicleData
} from "../Hooks/ActiveHook";

import { convertForTable } from "../../../../Util/Util";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import { ActiveFormValues, ActiveType, Company, Departament, Driver, FuelType, Unit, VehicleFormValues } from "./FormActive/FormInterfaces/FormActiveInterface";

// Tipagem simplificada e mais específica
interface ActiveTableData {
  active: ActiveFormValues;
  vehicle: VehicleFormValues;
  driver: Driver[];
  company: Company[];
  unit: Unit[];
  activeType: ActiveType[];
  fuelType: FuelType[];
  departament: Departament[];
}

const ActiveTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [modalData, setModalData] = useState<ActiveTableData | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  // Carregamento inicial de dados
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
          ActiveDepartamentData(),
        ]);

        if (activeRes.error) throw new Error(activeRes.message);
        if (driverRes.error) throw new Error(driverRes.message);
        if (unitRes.error) throw new Error(unitRes.message);
        if (companyRes.error) throw new Error(companyRes.message);
        if (typeRes.error) throw new Error(typeRes.message);
        if (fuelRes.error) throw new Error(fuelRes.message);
        if (depRes.error) throw new Error(depRes.message);

        setData(activeRes.data || []);
        setModalData({
          active: {},
          vehicle: {},
          driver: driverRes.data || [],
          company: companyRes.data || [],
          unit: unitRes.data || [],
          activeType: typeRes.data || [],
          fuelType: fuelRes.data || [],
          departament: depRes.data || []
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleSelect = useCallback(async (item: any) => {
    setSelected(item);
    setOpenModal(true);

    if (!item || !item[0]?.active_id?.value) return;

    try {
      const vehicleRes = await ActiveVehicleData(item[0].active_id.value);
      if (vehicleRes.error) throw new Error(vehicleRes.message);

      setModalData((prev) => prev ? { ...prev, vehicle: vehicleRes.data[0] || {}, active: data.find(d => d.active_id === item[0].active_id.value) || {} } : null);
    } catch (error) {
      console.error("Erro ao buscar dados do veículo:", error);
    }
  }, [data]);

  const tableList = useMemo(() => convertForTable(data, {
    ocultColumns: listColumnsOcult,
    customTags: customTagsActive,
    customValue: customValueActive
  }), [data]);

  if (loading) return <div>Carregando...</div>;
  if (!data.length) return <div>Nenhum dado encontrado</div>;

  return (
    <div className="p-2">
      <CustomTable
        list={tableList}
        onConfirmList={handleSelect}
        maxSelection={1}
      />

      {openModal && selected && modalData && (
        <FormActive apiData={modalData} openModal={setOpenModal} />
      )}
    </div>
  );
};

export default ActiveTable;
