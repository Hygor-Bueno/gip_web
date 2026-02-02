import { Active, FormData, PlacePurchase, Vehicle } from "../Interfaces/Interfaces";

export const createEmptyPlacePurchase = (): PlacePurchase => ({
  city: '',
  state: '',
  store: '',
  number: '',
  zip_code: '',
  complement: '',
  neighborhood: '',
  public_place: ''
});

export const createEmptyActive = (): Active => ({
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
  place_purchase: createEmptyPlacePurchase(),
  list_items: { list: [] }
});

export const createEmptyVehicle = (): Vehicle => {
  const year = new Date().getFullYear();
  return {
    license_plates: '',
    year,
    year_model: year,
    chassi: '',
    color: '',
    renavam: '',
    fuel_type: '',
    power: 0,
    capacity: 0,
    shielding: 0,
    fuel_type_id_fk: 0
  };
};

export const createEmptyFormData = (): FormData => ({
  active: createEmptyActive(),
  vehicle: createEmptyVehicle()
});
