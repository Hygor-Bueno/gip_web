export interface Unit {
  unit_number: string;
  unit_name: string;
}

export interface Department {
  dep_id: string;
  fantasy_name: string;
  unit_name: string;
  dep_name: string;
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