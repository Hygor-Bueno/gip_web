import { ActiveFormValues, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";

/** Payload para Active.php (PUT) — contém apenas os dados do ativo */
export function mapActiveToApi(active: ActiveFormValues) {
  return {
    ...active,
    is_vehicle: active.is_vehicle ? 1 : 0,
    list_items: active.list_items || { list: [] },
    place_purchase: active.place_purchase || {}
  };
}

/** Payload para Vehicle.php (PUT) — contém apenas os dados do veículo */
export function mapVehicleToApi(vehicle: VehicleFormValues) {
  return {
    ...vehicle,
    shielding: vehicle.shielding ? 1 : 0
  };
}

/**
 * Payload unificado para GAPP_V2/Active.php (POST)
 * A procedure sp_gapp_save_active espera ativo + veículo juntos
 */
export function mapActivePostToApi(active: ActiveFormValues, vehicle: VehicleFormValues) {
  return {
    active_id: active.active_id ?? null,
    brand: active.brand || "",
    model: active.model || "",
    number_nf: active.number_nf || null,
    date_purchase: active.date_purchase || null,
    place_purchase: active.place_purchase || {},
    value_purchase: active.value_purchase || null,
    photo: active.photo || null,
    change_date: active.change_date || null,
    list_items: active.list_items || { list: [] },
    used_in: active.used_in || null,
    is_vehicle: 0, // active.is_vehicle || null
    status_active: active.status_active ?? 1,
    units_id_fk: active.units_id_fk || null,
    id_active_class_fk: active.id_active_class_fk || null,
    user_id_fk: active.user_id_fk || null,
    work_group_fk: "2", // active.work_group_fk || null

    license_plates: vehicle.license_plates || null,
    year: vehicle.year || null,
    year_model: vehicle.year_model || null,
    chassi: vehicle.chassi || null,
    color: vehicle.color || null,
    renavam: vehicle.renavam || null,
    fuel_type: vehicle.fuel_type || null,
    power: vehicle.power || null,
    cylinder: vehicle.cylinder || null,
    capacity: vehicle.capacity || null,
    fipe_table: vehicle.fipe_table || null,
    last_revision_date: vehicle.last_revision_date || null,
    last_revision_km: vehicle.last_revision_km || null,
    next_revision_date: vehicle.next_revision_date || null,
    next_revision_km: vehicle.next_revision_km || null,
    directed_by: vehicle.directed_by || null,
    shielding: vehicle.shielding ? 1 : 0,
    fuel_type_id_fk: vehicle.fuel_type_id_fk || null,
  };
}