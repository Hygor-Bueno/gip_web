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
        </div>
      )}
    </div>
  );
};

export default ActiveTable;
