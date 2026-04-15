export interface Expense {
  date: string;
  hour: string;
  local: string;
  store_id_fk: string;
  description: string;
  coupon_number: string;
  total_value: string;
  discount: string;
  exp_type_id_fk: string;
  status_expen: string;
  driver_id_fk: string;
  active_id_fk: string;
  user_id_fk: string | number;
  provider?: string;
  work_group_fk?: string | number | null;
}

export interface MaintenanceData {
  technician: string;
  service_value: string;
  value_parts: string;
  list_parts: { list: PartItem[] };
  km_day: string;
  km_next: string;
  warranty: number;
  date_next: string;
  validity: string;
  expen_id_fk: string;
}

export interface PartItem {
  description: string;
  quantity: string;
  value: string;
}

export interface FuelData {
  liter_value: string;
  km_day: string;
  liter_qtd: string;
  expen_id_fk: string;
  fuel_type_id_fk: string;
}

export interface FinesData {
  points: string;
  offending_driver_date: string;
  offending_driver: string;
  infraction: string;
  gravity: string;
  fine_id: string;
  expen_id_fk: string;
  article_ctb: string;
  ait: string;
  infraction_id_fk: string;
}

export interface SinisterData {
  guilty: string;
  victim: string;
  finished: string;
  others_documents: string;
  data_third: string;
  bo_number: string;
  bo_receipt_date: string;
  bo_shipping_date: string;
  observation: string;
  damage_type_id_fk: string;
  expen_id_fk: string;
  id_insurance_fk: string;
}

export interface ReleasesProps {
  activeId: string;
  userId: string | number;
  isVehicle: boolean;
  gappWorkGroupId?: number | null;
  onClose: () => void;
}

export type TabKey = "fuel" | "maintenance" | "fines" | "insurance" | "sinister" | "trips";

export interface InfractionItem {
  infraction_id: string;
  infraction: string;
  points: string;
  gravitity: string;
}
