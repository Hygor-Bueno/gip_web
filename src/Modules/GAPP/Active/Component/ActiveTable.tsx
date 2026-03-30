import React, { useEffect, useState, useCallback, useMemo } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FormActive from "./FormActive/FormActive";

import { 
  ActiveCompanyData, ActiveData, ActiveDepartamentData, ActiveDriverData, 
  ActiveInsuranceData, ActiveTypeData, ActiveTypeFuelData, ActiveUnitsData, 
  ActiveVehicleData 
} from "../Adapters/Adapters";
import { convertForTable } from "../../../../Util/Utils";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import { Active, ActiveTableData } from "../Interfaces/Interfaces";
import { tItemTable } from "../../../../types/types";

const ActiveTable: React.FC = () => {
  const [data, setData] = useState<Active[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<tItemTable[]>([]);
  const [modalData, setModalData] = useState<ActiveTableData | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

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

    try {
      const vehicleRes = await ActiveVehicleData(selectedActiveId);

      if (vehicleRes.error) {
        throw new Error(vehicleRes.message);
      }
      
      const vehicleId = vehicleRes.data?.[0]?.vehicle_id || "0";

      const insuranceRes = await ActiveInsuranceData(vehicleId);

      setModalData((prev) => prev ? { 
        ...prev, 
        vehicle: vehicleRes.data?.[0] || {}, 
        active: data.find(d => String(d.active_id) === selectedActiveId) || {},
        insurance: insuranceRes.data?.[0] || {} 
      } : null);

    } catch (error) {
      console.error("Erro ao buscar dados do veículo ou seguro:", error);
    }
  }, [data]);

  const handleServicesBox = useCallback(async (item: tItemTable[]) => {
    setOpenModal(true);
    handleSelect(item);
  }, [handleSelect]);

  const tableList = useMemo(() => convertForTable(data, {
    ocultColumns: listColumnsOcult,
    customTags: customTagsActive,
    customValue: customValueActive
  }), [data]);

  if (loading) return <div>Carregando...</div>;
  if (!data.length) return <div>Nenhum dado encontrado</div>;

  return (
    <div className="p-2">
      <CustomTable list={tableList} onConfirmList={handleServicesBox} maxSelection={1} />
      {openModal && selected.length > 0 && modalData && ( <FormActive apiData={modalData} openModal={setOpenModal} /> )}
    </div>
  );
};

export default ActiveTable;