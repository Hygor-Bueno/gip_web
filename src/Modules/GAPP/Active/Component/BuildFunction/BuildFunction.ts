export function buildOptions(apiData: any) {
  return {
    company: apiData?.company?.map((c: any) => ({
      label: c.corporate_name,
      value: String(c.comp_id),
    })) || [],

    departament: apiData?.departament?.map((d: any) => ({
      label: `${d.fantasy_name} > ${d.unit_name} > ${d.dep_name}`,
      value: String(d.dep_id),
    })) || [],

    unit: apiData?.unit?.map((u: any) => ({
      label: u.unit_name,
      value: String(u.unit_id),
    })) || [],

    driver: apiData?.driver?.map((d: any) => ({
      label: d.name,
      value: String(d.driver_id),
    })) || [],

    fuel: apiData?.fuelType?.map((f: any) => ({
      label: f.description,
      value: String(f.id_fuel_type),
    })) || [],
  };
}