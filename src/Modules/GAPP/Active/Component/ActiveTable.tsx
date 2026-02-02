import React, { useEffect, useState } from 'react';
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
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [vehicleData, setVehicleData] = useState<unknown>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const req = await ActiveData();
        setData(req.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (items: TableItem[]) => {
    const item = items[0] as unknown as SelectedItem;
    setSelected(item);
    setOpenModal(true);
  };

  useEffect(() => {
    if (!selected?.active_id?.value) return;
    (async () => {
      // @ts-ignore
      const req = await ActiveVehicleData(selected.active_id.value);
      setVehicleData(req.data || null);
    })();
  }, [selected]);

  const handleReload = async () => {
    setLoading(true);
    const req = await ActiveData();
    setData(req.data || []);
    setLoading(false);
  };

  if (loading) return <div>Carregando...</div>;
  if (!data.length) return <div>Nenhum dado encontrado</div>;

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
        <div className="modal-backdrop bg-light p-3">
          <ActiveFormSimple
            selectedItem={selected}
            vehicleData={vehicleData}
            onClose={() => setOpenModal(false)}
            onSaveSuccess={handleReload}
          />
        </div>
      )}
    </div>
  );
};

export default ActiveTable;
