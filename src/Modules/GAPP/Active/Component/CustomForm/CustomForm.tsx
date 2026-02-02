import React, { useState, useEffect } from 'react';
import {
  ActiveDepartamentData,
  ActiveDriverData,
  ActiveTypeFuelData,
  ActiveUnitsData
} from '../../Hooks/ActiveHook';
import { ActiveFields } from './Active/ActiveFields';
import VehicleFields from './Vehicle/VehicleFields';
import { removeStringSpecialChars } from '../../../../../Util/Util';

interface ActiveFormSimpleProps {
  selectedItem: any;
  vehicleData: any;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const ActiveFormSimple: React.FC<ActiveFormSimpleProps> = ({
  selectedItem,
  vehicleData,
  onClose
}) => {

  const [units, setUnits] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [typeFuel, setTypeFuel] = useState<any[]>([]);
  const [driver, setDriver] = useState<any[]>([]);

  const [listItems, setListItems] = useState<string[]>([]);

  const [formData, setFormData] = useState<any>({
    active: {
      active_id: '',
      brand: '',
      model: '',
      number_nf: '',
      status_active: '',
      date_purchase: '',
      value_purchase: '',
      change_date: '',
      used_in: 0,
      is_vehicle: 1,
      units_id_fk: 0,
      id_active_class_fk: 0,
      user_id_fk: 0,
      work_group_fk: 0,
      photo: null,
      place_purchase: {
        city: '',
        state: '',
        store: '',
        number: '',
        zip_code: '',
        complement: '',
        neighborhood: '',
        public_place: ''
      },
      list_items: {
        list: []
      }
    },
    vehicle: {
      license_plates: '',
      year: new Date().getFullYear(),
      year_model: new Date().getFullYear(),
      chassi: '',
      color: '',
      renavam: '',
      fuel_type: '',
      power: 0,
      capacity: 0,
      shielding: 0,
      fuel_type_id_fk: 0
    }
  });

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

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      active: {
        ...prev.active,
        list_items: { list: listItems }
      }
    }));
  }, [listItems]);

  useEffect(() => {
    if (!selectedItem) return;

    const parsedListItems =
      selectedItem.list_items?.value?.list?.map(
        (item: any) => item.description ?? String(item)
      ) || [];

    setListItems(parsedListItems);

    setFormData({
      active: {
        active_id: selectedItem.active_id?.value ?? '',
        brand: selectedItem.brand?.value ?? '',
        model: selectedItem.model?.value ?? '',
        number_nf: selectedItem.number_nf?.value ?? '',
        status_active: selectedItem.status_active?.value ?? '',
        date_purchase: selectedItem.date_purchase?.value ?? '',
        value_purchase: selectedItem.value_purchase?.value ?? '',
        change_date: selectedItem.change_date?.value ?? '',
        used_in: selectedItem.used_in?.value ?? 0,
        is_vehicle: selectedItem.is_vehicle?.value ?? 1,
        units_id_fk: selectedItem.units_id_fk?.value ?? 0,
        id_active_class_fk: selectedItem.id_active_class_fk?.value ?? 0,
        user_id_fk: selectedItem.user_id_fk?.value ?? 0,
        work_group_fk: selectedItem.work_group_fk?.value ?? 0,
        photo: null,
        place_purchase: selectedItem.place_purchase?.value ?? {
          city: '',
          state: '',
          store: '',
          number: '',
          zip_code: '',
          complement: '',
          neighborhood: '',
          public_place: ''
        },
        list_items: selectedItem.list_items?.value || { list: [] },
      },
      vehicle: {
        license_plates: selectedItem.vehicle?.license_plates ?? '',
        year: selectedItem.vehicle?.year ?? new Date().getFullYear(),
        year_model: selectedItem.vehicle?.year_model ?? new Date().getFullYear(),
        chassi: selectedItem.vehicle?.chassi ?? '',
        color: selectedItem.vehicle?.color ?? '',
        renavam: selectedItem.vehicle?.renavam ?? '',
        fuel_type: selectedItem.vehicle?.fuel_type ?? '',
        power: selectedItem.vehicle?.power ?? 0,
        capacity: selectedItem.vehicle?.capacity ?? 0,
        shielding: selectedItem.vehicle?.shielding ?? 0,
        fuel_type_id_fk: selectedItem.vehicle?.fuel_type_id_fk ?? 0
      }
    });
  }, [selectedItem]);

  // 🔄 Handle changes Active
  const handleActiveChange = (
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

  // 🔄 Handle changes Vehicle
  const handleVehicleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [name]: value
      }
    }));
  };

  // 🔄 Handle place purchase
  const handlePlaceChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      active: {
        ...prev.active,
        place_purchase: {
          ...prev.active.place_purchase,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      active: {
        ...formData.active,
        number_nf: removeStringSpecialChars(formData.active.number_nf),
        value_purchase: removeStringSpecialChars(formData.active.value_purchase),
      },
      vehicle: {
        ...formData.vehicle,
        renavam: removeStringSpecialChars(formData.vehicle.renavam)
      }
    };

    console.log('Payload correto 👉', payload);
  };

  return (
    <div className="card shadow-lg border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div
            className="d-flex flex-column gap-3 overflow-auto"
            style={{ maxHeight: '83vh' }}
          >
            <ActiveFields
              formData={formData.active}
              handleChange={handleActiveChange}
              units={units}
              departments={departments}
              listItems={listItems}
              setListItems={setListItems}
              handlePlaceChange={handlePlaceChange}
            />

            {formData.active.is_vehicle === 1 && (
              <VehicleFields
                formData={formData.vehicle}
                handleChange={handleVehicleChange}
              />
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
