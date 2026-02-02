import React, { useEffect, useState } from 'react';
import { FormData, SelectedItem } from '../../Interfaces/Interfaces';
import { useActiveAuxData } from '../../Hooks/useActiveAuxData';
import { createEmptyFormData } from '../../domain/active.factory';
import { mapFormDataToPayload, mapSelectedItemToFormData } from '../../domain/active.adapters';
import { ActiveFields } from './Active/ActiveFields';
import VehicleFields from './Vehicle/VehicleFields';
import { updateNested } from '../../../../../Util/Util';

interface Props {
  selectedItem?: SelectedItem;
  vehicleData: unknown;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const ActiveFormSimple: React.FC<Props> = ({ selectedItem, onClose }) => {
  const { units, departments } = useActiveAuxData();

  const [formData, setFormData] = useState<FormData>(createEmptyFormData());
  const [listItems, setListItems] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedItem) return;
    const mapped = mapSelectedItemToFormData(selectedItem);
    setFormData(mapped);
    setListItems(mapped.active.list_items.list);
  }, [selectedItem]);

  useEffect(() => {
    setFormData(prev =>

      updateNested<FormData, 'active'>('active')('list_items', { list: listItems })(
        prev
      )
    );
  }, [listItems]);

  const handleChange =
    <K extends keyof FormData>(section: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev =>
        updateNested<FormData, K>(section)(name as keyof FormData[K], value as any)(
          prev
        )
      );
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = mapFormDataToPayload(formData);
    console.log('Payload correto 👉', payload);
  };

  return (
    <div className="card shadow-lg border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '83vh' }}>
            <ActiveFields
              formData={formData.active}
              handleChange={handleChange('active')}
              units={units}
              departments={departments}
              listItems={listItems}
              setListItems={setListItems}
            />

            {formData.active.is_vehicle === 1 && (
              <VehicleFields
                formData={formData.vehicle}
                handleChange={handleChange('vehicle')}
              />
            )}
          </div>

          <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-color-gipp text-white px-5 fw-bold">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActiveFormSimple;
