/**
 * Represents an active available for movement selection.
 * license_plates is joined client-side from Vehicle data (not returned by Active.php?actplc=1).
 */
export interface ActiveForMovement {
  active_id: number;
  brand: string;
  model: string;
  desc_active_class: string;
  unit_name: string;
  status_active: number | string;
  group_id_fk?: string;
  license_plates?: string;   // joined from Vehicle.php — present only for vehicles
  is_vehicle?: number | string;
}

/**
 * Represents a registered movement record.
 * Fields like brand, model, unit_name, dep_name come from API JOINs.
 */
export interface Movimentation {
  mov_id: number;
  active_id_fk: number;
  unit_id_fk: number | null;
  dep_id_fk: number | null;
  sub_dep_id_fk: number | null;
  type_movimentation: string;
  obs_movimentation: string;
  date_movimentation: string;
  status_movimentation: number | string;
  // denormalized join fields
  active_code?: string;
  brand?: string;
  model?: string;
  unit_name?: string;
  dep_name?: string;
  sub_dep_name?: string;
  group_id_fk?: string;
}

/**
 * Controlled form state for the movement form (phase 1).
 * All values are strings because they come from <select> / <input> elements.
 */
export interface MovementFormState {
  type_movimentation: string;  // "internal" | "external"
  unit_id_fk: string;
  dep_id_fk: string;
  sub_dep_id_fk: string;
  obs_movimentation: string;
}

/**
 * Lazily-loaded department (fetched per unit selection).
 */
export interface LazyDepartament {
  dep_id: number;
  dep_name: string;
  status_dep: number | string;
  unit_id_fk?: number;
}

/**
 * Lazily-loaded subdepartment (fetched per department selection).
 */
export interface LazySubdepartament {
  sub_dep_id: number;
  sub_dep_name: string;
  status_sub_dep: number | string;
  dep_id_fk?: number;
}
