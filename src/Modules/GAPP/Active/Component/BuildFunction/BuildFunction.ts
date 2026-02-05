import { FormActiveProps } from "../../Interfaces/Interfaces";

/** Esse build permite que constuimos os options de maneira organizada em uma unica função */
export function buildOptions(apiData?: FormActiveProps["apiData"]) {
  return {
    company: apiData?.company?.map((c) => ({
      label: c.corporate_name,
      value: String(c.comp_id),
    })) || [],

    departament: apiData?.departament?.map((d) => ({
      label: `${d.fantasy_name} > ${d.unit_name} > ${d.dep_name}`,
      value: String(d.dep_id),
    })) || [],

    unit: apiData?.unit?.map((u) => ({
      label: u.unit_name,
      value: String(u.unit_id),
    })) || [],

    driver: apiData?.driver?.map((d) => ({
      label: d.name,
      value: String(d.driver_id),
    })) || [],

    fuel: apiData?.fuelType?.map((f) => ({
      label: f.description,
      value: String(f.id_fuel_type),
    })) || [],
  };
}