export interface PlaceAddress {
  city?: string;
  state?: string;
  store?: string;
  number?: string;
  zip_code?: string;
  complement?: string;
  neighborhood?: string;
  public_place?: string;  
}

export interface Departament {
  dep_id: number;
  dep_name: string;
  status_dep: number;
  unit_id_fk: number;
  unit_id: number;
  unit_number: number;
  address: string;
  unit_name: string;
  cnpj: string;
  status_unit: number;
  comp_id_fk: number;
  comp_id: number;
  corporate_name: string;
  fantasy_name: string;
  status_comp: number;
}

export interface IListAdd {
    newItemText: string,
    setNewItemText: React.Dispatch<React.SetStateAction<string>>,
    addItem: () => void,
    activeValues: ActiveFormValues,
    removeItem: (indexToRemove: number) => void
}

// types & initial values
export interface ActiveFormValues {
  active_id?: number | null;         // p_active_id
  brand?: string;                     // p_brand
  model?: string;                     // p_model
  number_nf?: number | string;       // p_number_nf
  date_purchase?: string;            // p_date_purchase (YYYY-MM-DD)
  place_purchase?: PlaceAddress;       // p_place_purchase (JSON string or free text)
  value_purchase?: number | string;  // p_value_purchase
  photo?: File | string | null;      // p_photo (File to upload or string URL/name)
  change_date?: string | null;       // p_change_date
  list_items?: {
    list: string[]
  };               // p_list_items (JSON string)
  used_in?: number | string | null;  // p_used_in
  is_vehicle?: boolean;              // p_is_vehicle (true => 1)
  status_active?: number | string;   // p_status_active (tinyint)
  units_id_fk?: number | string | null;    // p_units_id_fk
  id_active_class_fk?: number | string | null; // p_id_active_class_fk
  user_id_fk?: number | string | null;     // p_user_id_fk
  work_group_fk?: number | string | null;  // p_work_group_fk
}

export interface VehicleFormValues {
  license_plates?: string;           // p_license_plates
  year?: number | string;            // p_year
  year_model?: number | string;      // p_year_model
  chassi?: string;                   // p_chassi
  color?: string;                    // p_color
  renavam?: string;                  // p_renavam
  fuel_type?: string;                // p_fuel_type (string)
  power?: number | string;           // p_power (decimal)
  cylinder?: number | string;        // p_cylinder (decimal)
  capacity?: number | string;        // p_capacity
  fipe_table?: number | string;      // p_fipe_table
  last_revision_date?: string | null;// p_last_revision_date
  last_revision_km?: number | string;// p_last_revision_km
  next_revision_date?: string | null;// p_next_revision_date
  next_revision_km?: number | string;// p_next_revision_km
  directed_by?: number | string | null; // p_directed_by
  shielding?: boolean;               // p_shielding (tinyint)
  fuel_type_id_fk?: number | string | null; // p_fuel_type_id_fk
}

interface AddressUnit {
  city: string;
  state: string;
  store: string;
  number: string;
  zip_code: string;
  complement:string;
  neighborhood: string;
  public_place: string;
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

export interface FuelType {
  id_fuel_type: number,
  description: string
}

export interface Unit {
  unit_id: number,
  unit_number: number,
  address: AddressUnit,
  unit_name: string;
  cnpj: string;
  status_unit: number;
  comp_id_fk: number;
  comp_id: number;
  corporate_name: string;
  fantasy_name: string;
  status_comp: number;
}

export interface Driver {
  driver_id: number;
  rg: string;
  cpf: string;
  cnh: string;
  category: string;
  validity_cnh: string;
  status_driver: number;
  cnh_img?: string;
  user_id_fk: string;
  sub_dep_id_fk: string;
  level_id_fk: string;
  user_id: string;
  name: string;
  access_code: string;
  driver: string;
  status_user: string;
  level_id: string;
  level_name: string;
  level_pages: {
      level: []
  };
  status_level: string;
  group_id_fk: string
}

export interface Active {
  active_id: string;
  brand: string;
  model: string;
  number_nf: string;
  status_active: string;
  photo?: null;
  change_date: string;
  list_items: {
      list: string[];
  };
  used_in: string;
  date_purchase: string;
  place_purchase: PlaceAddress;
  value_purchase: string;
  is_vehicle: number;
  units_id_fk: string;
  id_active_class_fk: string;
  user_id_fk: string;
  work_group_fk: string;
  unit_id: number;
  unit_number: number;
  address: string;
  unit_name: string;
  cnpj: string;
  status_unit: number;
  comp_id_fk: number;
  id_active_class: string;
  desc_active_class: string;
  status_active_class: string;
  active_type_id_fk: string;
  user_id: string;
  name: string;
  access_code: string;
  driver: string;
  status_user:string;
  sub_dep_id_fk: string;
  level_id_fk: string;
  group_id: number;
  group_name: string;
  status_work_group: number;
  dep_id_fk: number;
}
