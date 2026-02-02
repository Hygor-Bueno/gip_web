import React, { useState, useEffect } from 'react';
import {
  ActiveDepartamentData,
  ActiveDriverData,
  ActiveTypeFuelData,
  ActiveUnitsData
} from '../../Hooks/ActiveHook';
import { ActiveFields } from './Active/ActiveFields';
import VehicleFields from './Vehicle/VehicleFields';

interface ActiveFormSimpleProps {
  selectedItem: any;
  onClose: () => void;
  onSaveSuccess?: () => void;
  vehicleData?: any;
}

const ActiveFormSimple: React.FC<ActiveFormSimpleProps> = ({
  selectedItem,
  onClose
}) => {
  const [units, setUnits] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [typeFuel, setTypeFuel] = useState<any[]>([]);
  const [driver, setDriver] = useState<any[]>([]);

  // ✅ LISTA FINAL (vai para o backend)
  const [listItems, setListItems] = useState<string[]>([]);

  // ✅ FORM DATA
  const [formData, setFormData] = useState<any>({
    active: {
      brand: '',
      model: '',
      number_nf: '',
      status_active: '1',
      date_purchase: '',
      value_purchase: '',
      unit_number: '',
      dep_id: '',
      is_vehicle: 1,
      list_items: {
        list: []
      }
    },
    vehicle: {}
  });

  // 🔄 Load selects
  useEffect(() => {
    async function loadData() {
      try {
        const [unitsReq, depReq, driverReq, fuelReq] = await Promise.all([
          ActiveUnitsData(),
          ActiveDepartamentData(),
          ActiveDriverData(),
          ActiveTypeFuelData()
        ]);

        setUnits(unitsReq.data || unitsReq);
        setDepartments(depReq.data || depReq);
        setDriver(driverReq.data || driverReq);
        setTypeFuel(fuelReq.data || fuelReq);
      } catch (error) {
        console.error('Erro ao carregar dados', error);
      }
    }
    loadData();
  }, []);

  // 🔥 SINCRONIZA LISTA COM O FORM
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      active: {
        ...prev.active,
        list_items: {
          list: listItems
        }
      }
    }));
  }, [listItems]);

  // 🧩 Editar item existente
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        active: {
          ...selectedItem.active,
          list_items: {
            list: listItems
          }
        },
        vehicle: selectedItem.vehicle || {}
      });
    }
  }, [selectedItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      active: {
        ...prev.active,
        [name]: value
      }
    }));
  };

  return (
    <div className="card shadow-lg border-0">
      <div className="card-body">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('DADOS ENVIADOS 👉', formData);
          }}
        >
          <div
            className="d-flex flex-column gap-3 overflow-auto"
            style={{ maxHeight: '83vh' }}
          >
            <ActiveFields
              formData={formData.active}
              handleChange={handleChange}
              units={units}
              departments={departments}
              listItems={listItems}
              setListItems={setListItems}
            />

            {formData.active.is_vehicle === 1 && (
              <VehicleFields formData={formData.vehicle} />
            )}
          </div>

          <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-color-gipp text-white px-5 fw-bold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActiveFormSimple;
