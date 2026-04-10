/**
 * A single franchise/deductible entry on an insurance policy.
 */
export interface FranchiseItem {
  value: string;
  description: string;
}

/**
 * Represents a full insurance record associated with a vehicle asset.
 */
export interface Insurance {
  IOF_value: string | number | null;
  accessories: string | null;
  active_id: string;
  active_id_fk: string;
  adjustment_factor: string | number | null;
  assist_24hrs: string;
  auxiliary_headlight: string | null;
  backup_car: string;
  bodily_damages: number;
  bodywork: string | null;
  bodywork_vehicle: string | null;
  brand: string;
  broker_cnpj: string;
  broker_id: number;
  broker_id_kf: number;
  broker_name: string;
  capacity: string;
  change_date: string;
  chassi: string;
  color: string;
  conventional_flashlight: string | null;
  conventional_headlight: string | null;
  cov_id: string;
  cov_id_fk: string;
  cov_name: string;
  cylinder: string;
  date_final: string;
  date_init: string;
  date_purchase: string;
  deductible_type: string | null;
  deductible_value: string | number | null;
  directed_by: string | null;
  equipament: string | null;
  fipe_table: string | null;
  form_payment: string;
  franchise_list: { list: FranchiseItem[] };
  fuel_type: string;
  fuel_type_id_fk: string | number | null;
  glasses: string;
  hull: string | null;
  id_active_class_fk: string;
  id_insurance: number;
  ins_cnpj: string;
  ins_id: number;
  ins_id_fk: string;
  ins_name: string;
  insurance_value: string;
  is_vehicle: boolean | string | null;
  km_Trailer: string;
  last_revision_date: string | null;
  last_revision_km: string | number | null;
  license_plates: string;
  list_items: { list: string[] };
  model: string;
  moral_damages: number;
  next_revision_date: string | null;
  next_revision_km: string | number | null;
  number_nf: string;
  photo: string | null;
  place_purchase: string;
  policy_number: string;
  power: string;
  property_damage: number;
  proposal_number: string;
  rear_view: string | null;
  renavam: string;
  risk_cep: string;
  shielding: string;
  status_active: string;
  status_broker: number;
  status_cov: number;
  status_ins_comp: number;
  status_insurance: string;
  status_util: string;
  units_id_fk: string;
  used_in: string;
  user_id_fk: string;
  util_id: string;
  util_id_fk: string;
  util_name: string;
  value_purchase: string;
  vehicle_id: string;
  vehicle_id_fk: string;
  windshield: string | null;
  work_group_fk: string;
  xenon_flashlight: string | null;
  xenon_led_headlight: string | null;
  year: string;
  year_model: string;
}

/**
 * Represents vehicle-specific data when an asset is classified as a vehicle.
 * Exists separately because not every asset is a vehicle.
 */
export interface VehicleFormValues {
  vehicle_id?: string | number;
  active_id_fk?: string | number;
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
