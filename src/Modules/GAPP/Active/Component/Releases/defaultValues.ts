import { Expense, MaintenanceData, FuelData, FinesData, SinisterData } from "./Interfaces";
import { Insurance } from "../../Interfaces/Interfaces";

export const defaultExpense = (
  activeId: string,
  userId: string | number,
  workGroupId?: number | null,
): Expense => ({
  date: "", hour: "", local: "", store_id_fk: "", description: "Outros",
  coupon_number: "", total_value: "", discount: "", exp_type_id_fk: "",
  status_expen: "1", driver_id_fk: "", active_id_fk: activeId, user_id_fk: userId,
  ...(workGroupId != null ? { work_group_fk: workGroupId } : {}),
});

export const defaultMaintenance: MaintenanceData = {
  technician: "", service_value: "", value_parts: "", list_parts: { list: [] },
  km_day: "", km_next: "", warranty: 0, date_next: "", validity: "", expen_id_fk: "",
};

export const defaultFuel: FuelData = {
  liter_value: "0", km_day: "",
  liter_qtd: "", expen_id_fk: "", fuel_type_id_fk: "",
};

export const defaultFines: FinesData = {
  points: "", offending_driver_date: "", offending_driver: "",
  infraction: "", gravity: "", fine_id: "", expen_id_fk: "",
  article_ctb: "", ait: "", infraction_id_fk: "4",
};

export const defaultSinister: SinisterData = {
  guilty: "", victim: "", finished: "", others_documents: "",
  data_third: "", bo_number: "", bo_receipt_date: "",
  bo_shipping_date: "", observation: "", damage_type_id_fk: "",
  expen_id_fk: "", id_insurance_fk: "",
};

export const defaultInsurance: Partial<Insurance> = {
  risk_cep: "", proposal_number: "", policy_number: "",
  date_init: "", date_final: "", IOF_value: "", insurance_value: "",
  deductible_value: "", form_payment: "", adjustment_factor: "",
  deductible_type: "", bodywork: "", equipament: "", shielding: "",
  property_damage: 0, bodily_damages: 0, moral_damages: 0,
  glasses: "", assist_24hrs: "", km_Trailer: "", backup_car: "",
  util_id_fk: "", ins_id_fk: "", cov_id_fk: "", status_insurance: "1",
  franchise_list: { list: [] }, vehicle_id_fk: "",
};
