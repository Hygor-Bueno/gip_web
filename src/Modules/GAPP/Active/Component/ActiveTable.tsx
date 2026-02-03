<<<<<<< HEAD
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CustomTable from '../../../../Components/CustomTable';
import { ActiveData, ActiveVehicleData } from '../Hooks/ActiveHook';
import { convertForTable } from '../../../../Util/Util';
import {
  customTagsActive,
  customValueActive,
  listColumnsOcult
} from '../ConfigurationTable/ConfigurationTable';
import { SelectedItem } from '../Interfaces/Interfaces';
import ActiveFormSimple from './CustomForm/CustomForm';

interface TableItem {
  [key: string]: { value?: unknown };
}

const ActiveTable: React.FC = () => {
  const [data, setData] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [vehicleData, setVehicleData] = useState<unknown>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTableData = useCallback(async () => {
    setLoading(true);
    try {
      const req = await ActiveData();
      setData(req.data || []);
    } finally {
      setLoading(false);
    }
  }, []);
=======
import React, { useEffect, useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import { ActiveData, ActiveVehicleData } from "../Hooks/ActiveHook";
import { convertForTable } from "../../../../Util/Util";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import FormActive from "./FormActive/FormActive";


const ActiveTable: React.FC = () => {
    const [data, setData] = useState<[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [vehicleData, setVehicleData] = useState<any>({});
    const [activeData, setActiveData] = useState<any>({});
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const req = await ActiveData();
                if (req["error"]) throw new Error(req.message);
                setData(req.data || []);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
            } finally {
                setLoading(false);
            }
        };
>>>>>>> 883313221d1f5e1728a9f22ae3d501134b395f72

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSelect = useCallback((items: TableItem[]) => {
    if (!items.length) return;

    const item = items[0] as unknown as SelectedItem;
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const activeId = selectedItem?.active_id?.value;

  useEffect(() => {
    if (!activeId) return;

    const loadVehicleData = async () => {
      const req = await ActiveVehicleData(activeId);
      setVehicleData(req.data || null);
    };

<<<<<<< HEAD
    loadVehicleData();
  }, [activeId]);

  

  const handleReload = useCallback(async () => {
    await loadTableData();
  }, [loadTableData]);

  const tableList = useMemo(() => {
    return convertForTable(data, {
      ocultColumns: listColumnsOcult,
      customTags: customTagsActive,
      customValue: customValueActive
    });
  }, [data]);

  if (loading) return <div>Carregando...</div>;
  if (!data.length) return <div>Nenhum dado encontrado</div>;

  return (
    <div className="p-2">
      <CustomTable
        list={tableList}
        onConfirmList={handleSelect}
        maxSelection={1}
      />

      {isModalOpen && selectedItem && (
        <div className="modal-backdrop bg-light p-3">
          <ActiveFormSimple
            selectedItem={selectedItem}
            vehicleData={vehicleData}
            onClose={() => setIsModalOpen(false)}
            onSaveSuccess={handleReload}
          />
=======
    useEffect(() => {
        if (!selected) return;
        const loadVehicleData = async () => {
            try {
                const req = await ActiveVehicleData(selected[0].active_id.value);
                if (req["error"]) throw new Error(req.message);
                setVehicleData(req.data[0]);
            } catch (error) {
                console.error("Erro ao buscar dados do veículo", error);
            }
        };
        const loadActiveData = async () => {
            console.log(data.filter((item: any) => item.active_id === selected[0].active_id.value)[0]);
            setActiveData(data.filter((item: any) => item.active_id === selected[0].active_id.value)[0]);
        };
        loadVehicleData();
        loadActiveData();
    }, [selected]);

    if (loading) return <div>Carregando...</div>;
    if (!data || data.length === 0) return <div>Nenhum dado encontrado</div>;
    return (
        <div className="p-2">
            <CustomTable
                list={convertForTable(data, {
                    ocultColumns: listColumnsOcult,
                    customTags: customTagsActive,
                    customValue: customValueActive
                })}
                onConfirmList={handleSelect}
                maxSelection={1}
            />

            {openModal && selected && (
                <FormActive apiData={{ active: activeData, vehicle: vehicleData }} />
            )}
>>>>>>> 883313221d1f5e1728a9f22ae3d501134b395f72
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
export default ActiveTable;
=======
export default ActiveTable;
>>>>>>> 883313221d1f5e1728a9f22ae3d501134b395f72
