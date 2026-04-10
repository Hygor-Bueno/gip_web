/** Standard schema contract for select options */
export interface Schema { label: string; value: string }

/** Standard fetch config contract */
export interface FetchConfig { pathFile: string; urlComplement?: string; params?: {} }

/**
 * Represents a company — the root entity that owns units and assets.
 */
export interface Company {
  comp_id: number;
  corporate_name: string;
  fantasy_name: string;
  status_comp: number;
}

/**
 * Represents the fixed address of a company unit.
 */
export interface AddressUnit {
  city: string;
  state: string;
  store: string;
  number: string;
  zip_code: string;
  complement: string;
  neighborhood: string;
  public_place: string;
}

/**
 * Represents a company unit/branch.
 * Assets and departments belong to a unit.
 */
export interface Unit {
  unit_id: number;
  unit_number: number;
  address: AddressUnit;
  unit_name: string;
  cnpj: string;
  status_unit: number;
  comp_id_fk: number;
  comp_id: number;
  corporate_name: string;
  fantasy_name: string;
  status_comp: number;
}

/**
 * Represents a department inside the organizational structure.
 * Used to allocate assets to a unit/company.
 */
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

/**
 * Represents a driver or user who can be responsible for a vehicle.
 */
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
  level_pages: { level: string[] };
  status_level: string;
  group_id_fk: string;
}

/**
 * Represents the asset classification type
 * (e.g. vehicle, equipment, machine, etc).
 */
export interface ActiveType {
  active_type_id: number;
  desc_active_type: string;
  date_active_type: string;
  status_active_type: number;
  group_id_fk: string;
}

/**
 * Represents the available fuel types for vehicle classification.
 */
export interface FuelType {
  id_fuel_type: number;
  description: string;
}
