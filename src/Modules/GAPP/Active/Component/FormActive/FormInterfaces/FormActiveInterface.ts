import { Dispatch, SetStateAction } from "react";

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

export interface ActiveFormValues {
  active_id?: number | null;         
  brand?: string;                     
  model?: string;                     
  number_nf?: number | string;       
  date_purchase?: string;            
  place_purchase?: PlaceAddress;       
  value_purchase?: number | string;  
  photo?: File | string | null;      
  change_date?: string | null;       
  list_items?: {
    list: string[]
  };               
  used_in?: number | string | null;  
  is_vehicle?: boolean;              
  status_active?: number | string;   
  units_id_fk?: number | string | null;    
  id_active_class_fk?: number | string | null; 
  user_id_fk?: number | string | null;     
  work_group_fk?: number | string | null;  
}

export interface VehicleFormValues {
  license_plates?: string;           
  year?: number | string;            
  year_model?: number | string;      
  chassi?: string;                   
  color?: string;                    
  renavam?: string;                  
  fuel_type?: string;                
  power?: number | string;           
  cylinder?: number | string;        
  capacity?: number | string;        
  fipe_table?: number | string;      
  last_revision_date?: string | null;
  last_revision_km?: number | string;
  next_revision_date?: string | null;
  next_revision_km?: number | string;
  directed_by?: number | string | null; 
  shielding?: boolean;               
  fuel_type_id_fk?: number | string | null;
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
      level: string[]
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

export interface FormActiveProps {
  apiData?: {
    active?: ActiveFormValues;
    departament?: Departament[];
    vehicle?: VehicleFormValues;
    driver?: Driver[];
    company?: Company[];
    unit?: Unit[];
    activeType?: ActiveType[];
    fuelType?: FuelType[];
  };
  openModal?: Dispatch<SetStateAction<boolean>>;
}
