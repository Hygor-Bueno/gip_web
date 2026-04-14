import { fetchDataFull } from "../../../../Util/Utils";

function fetchGet(pathFile: string, urlComplement = "") {
  return fetchDataFull({ method: "GET", params: null, pathFile, urlComplement });
}

function fetchPost(pathFile: string, params: {}) {
  return fetchDataFull({ method: "POST", params, pathFile, urlComplement: "&v2=1&smart=ON" });
}

function fetchPut(pathFile: string, params: {}) {
  return fetchDataFull({ method: "PUT", params, pathFile, urlComplement: "&v2=1&smart=ON" });
}

/** All actives available for placement/movement */
export function getActives() {
  return fetchGet("GAPP/Active.php", "&actplc=1");
}

/** All vehicle records — used to join license_plates onto actives client-side */
export function getVehicles() {
  return fetchGet("GAPP/Vehicle.php", "&all=1");
}

/** Full movement history */
export function getMovimentations() {
  return fetchGet("GAPP/Movimentation.php", "&all=1");
}

/** Departments filtered by unit (lazy — called on unit select change) */
export function getDepartamentsByUnit(unitId: number | string) {
  return fetchGet("GAPP/Departament.php", `&unit_id_fk=${unitId}`);
}

/** Subdepartments filtered by department (lazy — called on dep select change) */
export function getSubdepartamentsByDep(depId: number | string) {
  return fetchGet("GAPP/Subdepartament.php", `&dep_id_fk=${depId}`);
}

/** Register a new movement record */
export function postMovimentation(params: {}) {
  return fetchPost("GAPP/Movimentation.php", params);
}

/** Update status of an existing movement record */
export function putMovimentation(params: {}) {
  return fetchPut("GAPP/Movimentation.php", params);
}
