import { Dispatch, SetStateAction } from "react";
import { ActiveRow } from "../ConfigurationTable/ConfigurationTable";
import { Driver, Company, Unit, Departament, ActiveType, FuelType } from "./OrgInterfaces";
import { Insurance, VehicleFormValues, FranchiseItem } from "./VehicleInterfaces";

export type { Driver, Company, Unit, Departament, ActiveType, FuelType, Insurance, VehicleFormValues, FranchiseItem };

/**
 * Flexible address where an asset was purchased.
 * Fields are optional because the purchase address may be filled in gradually.
 */
export interface PlaceAddress {
  city?: string;
  state?: string;
  store?: string;
  number?: string;
  zip_code?: string;
  complement?: string;
  neighborhood?: string;
  public_place?: string;
}

/**
 * Fully-resolved purchase address (all fields required after normalization).
 */
export interface PlacePurchaseParsed {
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
 * Draft state of an asset while being created or edited.
 * May be incomplete — used to create or update an asset record.
 */
export interface ActiveFormValues {
  active_id?: number | null;
  brand?: string;
  model?: string;
  number_nf?: number | string;
  date_purchase?: string;
  place_purchase?: PlaceAddress;
  value_purchase?: number | string;
  photo?: File | string | null;
  change_date?: string | null;
  list_items?: { list: string[] };
  used_in?: number | string | null;
  is_vehicle?: boolean;
  status_active?: number | string;
  units_id_fk?: number | string | null;
  id_active_class_fk?: number | string | null;
  user_id_fk?: number | string | null;
  work_group_fk?: number | string | null;
}

/**
 * Fully-persisted asset record returned by the API.
 * Used for listing, querying, and reporting.
 */
export interface Active extends ActiveRow {
  active_id: string;
  brand: string;
  model: string;
  number_nf: string;
  status_active: string;
  photo?: null;
  change_date: string;
  list_items: { list: string[] };
  used_in: string;
  date_purchase: string;
  place_purchase: PlaceAddress;
  value_purchase: string;
  is_vehicle: number;
  units_id_fk: string;
  id_active_class_fk: string;
  user_id_fk: string;
  work_group_fk: string;
  unit_id: number;
  unit_number: number;
  address: string;
  unit_name: string;
  cnpj: string;
  status_unit: number;
  comp_id_fk: number;
  id_active_class: string;
  desc_active_class: string;
  status_active_class: string;
  active_type_id_fk: string;
  user_id: string;
  name: string;
  access_code: string;
  driver: string;
  status_user: string;
  sub_dep_id_fk: string;
  level_id_fk: string;
  group_id: number;
  group_name: string;
  status_work_group: number;
  dep_id_fk: number;
}

/**
 * Complete data package the Active screen needs to operate:
 * asset data, vehicle data, and all support lists.
 */
export interface ActiveTableData {
  active: ActiveFormValues;
  vehicle: VehicleFormValues;
  driver: Driver[];
  company: Company[];
  unit: Unit[];
  activeType: ActiveType[];
  fuelType: FuelType[];
  departament: Departament[];
  insurance: Insurance;
}

/**
 * Props for the asset form — supports both add and edit modes.
 */
export interface FormActiveProps {
  mode?: "edit" | "add";
  gappUserId?: number | null;
  gappWorkGroupId?: number | null;
  apiData?: {
    active?: ActiveFormValues;
    departament?: Departament[];
    vehicle?: VehicleFormValues;
    driver?: Driver[];
    company?: Company[];
    unit?: Unit[];
    activeType?: ActiveType[];
    fuelType?: FuelType[];
    insurance?: Insurance;
  };
  openModal?: Dispatch<SetStateAction<boolean>>;
  onBack?: () => void;
  onSave?: (updated: {
    active?: Partial<ActiveFormValues>;
    vehicle?: Partial<VehicleFormValues>;
    insurance?: Partial<Insurance>;
  }) => void;
}

/**
 * Actions to manage the item list attached to an asset
 * (e.g. accessories, components, or bundled items).
 */
export interface IListAdd {
  newItemText: string;
  setNewItemText: Dispatch<SetStateAction<string>>;
  addItem: () => void;
  activeValues: ActiveFormValues;
  removeItem: (indexToRemove: number) => void;
}

/**
 * Actions to manage the franchise/deductible list on an insurance policy.
 */
export interface IListAddFranchise {
  newItemText: string;
  setNewItemText: Dispatch<SetStateAction<string>>;
  newValueText: string;
  setNewValueText: Dispatch<SetStateAction<string>>;
  addItem: () => void;
  insuranceValues: Partial<Insurance>;
  removeItem: (indexToRemove: number) => void;
}
