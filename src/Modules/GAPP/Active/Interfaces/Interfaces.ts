export interface Department {
  dep_id: string;
  fantasy_name: string;
  unit_name: string;
  dep_name: string;
}

export interface FormConfigOption {
  id?: string;
  name?: string;
}

export interface ConfigFormActiveProps {
  initialData?: FormData;
  data: { units: Unit[]; departments: Department[], company: Company[], activeType: ActiveType[] };
}

export interface ValueWrapper<T> {
  value?: T;
}

export interface PlacePurchase {
  city: string;
  state: string;
  store: string;
  number: string;
  zip_code: string;
  complement: string;
  neighborhood: string;
  public_place: string;
}

export interface Active {
  active_id: string;
  brand: string;
  model: string;
  number_nf: string;
  status_active: string;
  date_purchase: string;
  value_purchase: string;
  change_date: string;
  used_in: number;
  is_vehicle: number;
  units_id_fk: number;
  id_active_class_fk: number;
  user_id_fk: number;
  work_group_fk: number;
  photo: File | null;
  place_purchase: PlacePurchase;
  list_items: { list: string[] };
}

export interface Vehicle {
  license_plates: string;
  year: number;
  year_model: number;
  chassi: string;
  color: string;
  renavam: string;
  fuel_type: string;
  power: number;
  capacity: number;
  shielding: number;
  fuel_type_id_fk: number;
}

export interface FormData {
  active: Active;
  vehicle: Vehicle;
}

/** Formato que vem da tabela */
export interface SelectedItem {
  active_id?: ValueWrapper<string>;
  brand?: ValueWrapper<string>;
  model?: ValueWrapper<string>;
  number_nf?: ValueWrapper<string>;
  status_active?: ValueWrapper<string>;
  date_purchase?: ValueWrapper<string>;
  value_purchase?: ValueWrapper<string>;
  change_date?: ValueWrapper<string>;
  used_in?: ValueWrapper<number>;
  is_vehicle?: ValueWrapper<number>;
  units_id_fk?: ValueWrapper<number>;
  id_active_class_fk?: ValueWrapper<number>;
  user_id_fk?: ValueWrapper<number>;
  work_group_fk?: ValueWrapper<number>;
  place_purchase?: ValueWrapper<PlacePurchase>;
  list_items?: ValueWrapper<{
    list?: Array<{ description?: string } | string>;
  }>;
  vehicle?: Partial<Vehicle>;
}

export interface Unit {
  unit_id: number,
  unit_number: number,
  unit_name: string,
  address: {
    city: string,
    state: string,
    store: string,
    number: string,
    zip_code: string,
    complement: string,
    neighborhood: string,
    public_place: string
  },
  cnpj: string,
  status_unit: string,
  comp_id_fk: number,
  comp_id: number,
  corporate_name: string,
  fantasy_name: string,
  status_comp: number
}

export interface Department {
  id: number;
  name: string;
}

export interface Driver {
  id: number;
  name: string;
}

export interface FuelType {
  id: number;
  name: string;
}

export interface ActiveFieldsProps {
  units: Unit[];
  departments: Department[];
  activeType: ActiveType[];
  company: Company[];
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  listItems: string[];
  setListItems: React.Dispatch<React.SetStateAction<string[]>>;
} 

export interface Company {
  comp_id: number;
  corporate_name: string;
  fantasy_name: string;
  status_comp: number;
}

export interface ActiveType {
  active_type_id: number;
  desc_active_type: string;
  date_active_type: string;
  status_active_type: number;
  group_id_fk: string;
}
