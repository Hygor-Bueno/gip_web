import { ActiveFormValues, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";

/** Remove null / undefined keys so the API receives a clean payload */
function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

/** Payload para Active.php (PUT) — contém apenas os dados do ativo */
export function mapActiveToApi(active: ActiveFormValues) {
  return stripNulls({
    ...active,
    is_vehicle: active.is_vehicle ? 1 : 0,
    list_items: active.list_items || { list: [] },
    place_purchase: active.place_purchase || {}
  });
}

/** Payload para Vehicle.php (PUT) — contém apenas os dados do veículo */
export function mapVehicleToApi(vehicle: VehicleFormValues) {
  return stripNulls({
    ...vehicle,
    shielding: vehicle.shielding ? 1 : 0
  });
}

/**
 * Payload unificado para GAPP_V2/Active.php (POST)
 * A procedure sp_gapp_save_active espera ativo + veículo juntos.
 * Null keys are stripped so the API receives a clean payload.
 */
export function mapActivePostToApi(active: ActiveFormValues, vehicle: VehicleFormValues) {
  const raw = {
    brand:             active.brand             || undefined,
    model:             active.model             || undefined,
    number_nf:         active.number_nf         || undefined,
    date_purchase:     active.date_purchase      || undefined,
    place_purchase:    active.place_purchase     || undefined,
    value_purchase:    active.value_purchase     || undefined,
    change_date:       active.change_date        || undefined,
    list_items:        active.list_items         || { list: [] },
    used_in:           active.used_in            || undefined,
    is_vehicle:        active.is_vehicle ? 1 : 0,
    status_active:     active.status_active      ?? 1,
    units_id_fk:       active.units_id_fk        || undefined,
    id_active_class_fk: active.id_active_class_fk || undefined,
    user_id_fk:        active.user_id_fk         || undefined,
    work_group_fk:     active.work_group_fk      || undefined,

    license_plates:    vehicle.license_plates    || undefined,
    year:              vehicle.year              || undefined,
    year_model:        vehicle.year_model        || undefined,
    chassi:            vehicle.chassi            || undefined,
    color:             vehicle.color             || undefined,
    renavam:           vehicle.renavam           || undefined,
    fuel_type:         vehicle.fuel_type         || undefined,
    power:             vehicle.power             || undefined,
    cylinder:          vehicle.cylinder          || undefined,
    capacity:          vehicle.capacity          || undefined,
    fipe_table:        vehicle.fipe_table        || undefined,
    last_revision_date: vehicle.last_revision_date || undefined,
    last_revision_km:  vehicle.last_revision_km  || undefined,
    next_revision_date: vehicle.next_revision_date || undefined,
    next_revision_km:  vehicle.next_revision_km  || undefined,
    directed_by:       vehicle.directed_by       || undefined,
    shielding:         vehicle.shielding ? 1 : 0,
    fuel_type_id_fk:   vehicle.fuel_type_id_fk   || undefined,
  };

  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}