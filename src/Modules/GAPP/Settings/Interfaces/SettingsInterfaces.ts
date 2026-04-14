import { Dispatch, SetStateAction } from "react";
import { ActiveType, Company, Unit, Departament } from "../../Active/Interfaces/OrgInterfaces";

export type { ActiveType, Company, Unit, Departament };

export interface ActiveClass {
  id_active_class: number | null;
  desc_active_class: string;
  status_active_class: string | number;
  active_type_id_fk: number;
  group_id_fk?: string;
  desc_active_type?: string;
}

export interface Subdepartament {
  sub_dep_id: number;
  sub_dep_name: string;
  status_sub_dep: string | number;
  dep_id_fk: number;
  dep_name?: string;
  group_id_fk?: string;
}

export interface SettingsData {
  gappWorkGroupId: number | null;
  activeTypes: ActiveType[];
  activeClasses: ActiveClass[];
  companies: Company[];
  units: Unit[];
  departaments: Departament[];
  subdepartaments: Subdepartament[];
}

export interface SettingsSetters {
  setActiveTypes:     Dispatch<SetStateAction<ActiveType[]>>;
  setActiveClasses:   Dispatch<SetStateAction<ActiveClass[]>>;
  setCompanies:       Dispatch<SetStateAction<Company[]>>;
  setUnits:           Dispatch<SetStateAction<Unit[]>>;
  setDepartaments:    Dispatch<SetStateAction<Departament[]>>;
  setSubdepartaments: Dispatch<SetStateAction<Subdepartament[]>>;
}
