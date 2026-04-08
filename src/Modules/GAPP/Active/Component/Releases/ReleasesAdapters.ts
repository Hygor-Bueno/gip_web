import { fetchDataFull } from "../../../../../Util/Utils";

function post(pathFile: string, params: object) {
  return fetchDataFull({ method: "POST", params, pathFile, urlComplement: "" });
}

function get(pathFile: string, urlComplement: string) {
  return fetchDataFull({ method: "GET", params: null, pathFile, urlComplement });
}

function put(pathFile: string, params: object) {
  return fetchDataFull({ method: "PUT", params, pathFile, urlComplement: "" });
}

export const postExpense     = (params: object) => post("GAPP/ExpensesRegister.php", params);
export const postFuel        = (params: object) => post("GAPP/Fuel.php", params);
export const postMaintenance = (params: object) => post("GAPP/Maintenance.php", params);
export const postFines       = (params: object) => post("GAPP/Fines.php", params);
export const postSinister    = (params: object) => post("GAPP/Sinister.php", params);
export const postInsurance   = (params: object) => post("GAPP/Insurance.php", params);

export const getVehicle      = (activeId: string) => get("GAPP/Vehicle.php", `&active_id_fk=${activeId}`);
export const getInsurance    = (vehicleId: string) => get("GAPP/Insurance.php", `&vehicle_id_fk=${vehicleId}&status_insurance=1`);
export const getDrivers      = () => get("GAPP/Driver.php", "&all=1");
export const getFuelTypes    = () => get("GAPP/TypeFuel.php", "&all=1");

export const putInsurance       = (params: object) => put("GAPP/Insurance.php", params);

export const getUtilization     = () => get("GAPP/Utilization.php", "&all=1");
export const getInsuranceCompany = () => get("GAPP/InsuranceCompany.php", "&all=1");
export const getTypeCoverage    = () => get("GAPP/TypeCoverage.php", "&all=1");
