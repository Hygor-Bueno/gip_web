import { ActiveFormValues, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";

/** Remove null / undefined keys so the API receives a clean payload */
function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

/** Converte para inteiro — retorna undefined se vazio ou inválido */
function toInt(v?: string | number | null): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? undefined : n;
}

/** Converte para float — retorna undefined se vazio ou inválido */
function toFloat(v?: string | number | null): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = parseFloat(String(v));
  return isNaN(n) ? undefined : n;
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

/** Campos numéricos do veículo — converte strings de formulário para number */
function coerceVehicleTypes(vehicle: VehicleFormValues) {
  return {
    ...vehicle,
    year:             toInt(vehicle.year),
    year_model:       toInt(vehicle.year_model),
    power:            toInt(vehicle.power),
    cylinder:         toInt(vehicle.cylinder),
    capacity:         toFloat(vehicle.capacity),
    fipe_table:       toFloat(vehicle.fipe_table),
    last_revision_km: toInt(vehicle.last_revision_km),
    next_revision_km: toInt(vehicle.next_revision_km),
    directed_by:      toInt(vehicle.directed_by),
    fuel_type_id_fk:  toInt(vehicle.fuel_type_id_fk),
    vehicle_id:       toInt(vehicle.vehicle_id),
    shielding:        vehicle.shielding ? 1 : 0,
  };
}

/**
 * Payload para Vehicle.php (PUT) — atualiza veículo existente.
 * Requer vehicle_id no objeto para o backend identificar o registro.
 */
export function mapVehicleToApi(vehicle: VehicleFormValues) {
  return stripNulls(coerceVehicleTypes(vehicle));
}

/**
 * Payload para Vehicle.php (POST) — cria novo vínculo veículo-ativo.
 * Usado quando um ativo do tipo equipamento é convertido para veículo.
 * active_id_fk é obrigatório para o backend criar o registro corretamente.
 */
export function mapVehiclePostToApi(vehicle: VehicleFormValues, activeId: string | number) {
  return stripNulls({
    ...coerceVehicleTypes(vehicle),
    active_id_fk: toInt(String(activeId)),
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

    license_plates:    vehicle.license_plates     || undefined,
    year:              toInt(vehicle.year),
    year_model:        toInt(vehicle.year_model),
    chassi:            vehicle.chassi             || undefined,
    color:             vehicle.color              || undefined,
    renavam:           vehicle.renavam            || undefined,
    fuel_type:         vehicle.fuel_type          || undefined,
    power:             toInt(vehicle.power),
    cylinder:          toInt(vehicle.cylinder),
    capacity:          toFloat(vehicle.capacity),
    fipe_table:        toFloat(vehicle.fipe_table),
    last_revision_date: vehicle.last_revision_date || undefined,
    last_revision_km:  toInt(vehicle.last_revision_km),
    next_revision_date: vehicle.next_revision_date || undefined,
    next_revision_km:  toInt(vehicle.next_revision_km),
    directed_by:       toInt(vehicle.directed_by),
    shielding:         vehicle.shielding ? 1 : 0,
    fuel_type_id_fk:   toInt(vehicle.fuel_type_id_fk),
  };

  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}