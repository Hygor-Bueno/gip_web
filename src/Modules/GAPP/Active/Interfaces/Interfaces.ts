export interface Department {
  dep_id: string;
  fantasy_name: string;
  unit_name: string;
  dep_name: string;
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
  address: {
      city: string;
      state: string;
      store: string;
      number: string;
      zip_code: string;
      complement:string;
      neighborhood: string;
      public_place: string;
  },
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
      list:[]
  };
  used_in: string;
  date_purchase: string;
  place_purchase: {
      city: string;
      state: string;
      store:  string;
      number:  string;
      zip_code:  string;
      complement:  string;
      neighborhood:  string;
      public_place: string;
  };
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

export interface FormData {
  brand?: string;
  model?: string;
  number_nf?: string;
  value_purchase?: number;
  date_purchase?: string;
  company_number?: string;
  unit?: string;
  unit_number?: string;
  dep_id?: string;
  status_active?: string;
  class_id?: string;
  is_vehicle: boolean;
  [key: string]: any;
}

export interface FormConfigOption {
  id?: string;
  name?: string;
}

export interface ConfigFormActiveProps {
  initialData?: FormData;
  data: { units: Unit[]; departments: Department[] };
}