import { removeStringSpecialChars } from "../../../../Util/Util";
import { FormData, SelectedItem } from "../Interfaces/Interfaces";
import { createEmptyFormData } from "./active.factory";

export const unwrap = <T,>(v?: { value?: T }, fallback?: T): T =>
  v?.value ?? fallback!;

export const parseListItems = (item: SelectedItem): string[] =>
  item.list_items?.value?.list?.map(v =>
    typeof v === 'string' ? v : v.description ?? ''
  ) || [];

export const mapSelectedItemToFormData = (item: SelectedItem): FormData => {
  const base = createEmptyFormData();

  const active = {
    ...base.active,
    active_id: unwrap(item.active_id, ''),
    brand: unwrap(item.brand, ''),
    model: unwrap(item.model, ''),
    number_nf: unwrap(item.number_nf, ''),
    status_active: unwrap(item.status_active, ''),
    date_purchase: unwrap(item.date_purchase, ''),
    value_purchase: unwrap(item.value_purchase, ''),
    change_date: unwrap(item.change_date, ''),
    used_in: unwrap(item.used_in, 0),
    is_vehicle: unwrap(item.is_vehicle, 1),
    units_id_fk: unwrap(item.units_id_fk, 0),
    id_active_class_fk: unwrap(item.id_active_class_fk, 0),
    user_id_fk: unwrap(item.user_id_fk, 0),
    work_group_fk: unwrap(item.work_group_fk, 0),
    place_purchase: unwrap(item.place_purchase, base.active.place_purchase),
    list_items: { list: parseListItems(item) }
  };

  const vehicle = {
    ...base.vehicle,
    ...(item.vehicle || {})
  };

  return { active, vehicle };
};

/** Centraliza sanitização e montagem do payload final */
export const mapFormDataToPayload = (formData: FormData): FormData => ({
  ...formData,
  active: {
    ...formData.active,
    number_nf: removeStringSpecialChars(formData.active.number_nf),
    value_purchase: removeStringSpecialChars(formData.active.value_purchase)
  }
});
