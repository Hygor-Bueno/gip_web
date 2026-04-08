import { fetchDataFull } from "../../../../Util/Utils";
import { FetchConfig } from "../Interfaces/Interfaces";

function fetchGet({ pathFile, urlComplement = "" }: FetchConfig) {
  return fetchDataFull({
    method: "GET",
    params: null,
    pathFile,
    urlComplement
  });
}

function fetchPost({ pathFile, params = {}, urlComplement }: FetchConfig) {
  return fetchDataFull({
    method: "POST",
    params,
    pathFile,
    urlComplement
  });
}

function fetchPut({ pathFile, params = {}, urlComplement }: FetchConfig) {
  return fetchDataFull({
    method: "PUT",
    params,
    pathFile,
    urlComplement
  });
}

function putToApi(pathFile: string, params: {}) {
  return fetchPut({
    params,
    pathFile,
    urlComplement: "&v2=1&smart=ON",
  });
}

function getAll(pathFile: string) {
  return fetchGet({
    pathFile,
    urlComplement: "&all=1"
  });
}

function getByParam(
  pathFile: string, 
  param: string | string[] | Record<string, string | number>, 
  value?: string
) {
  let urlComplement = "";

  if (typeof param === "object" && !Array.isArray(param)) {
    urlComplement = "&" + Object.entries(param)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
  }
  else {
    urlComplement = `&${param}=${value}`;
  }

  return fetchGet({
    pathFile,
    urlComplement
  });
}

function postToApi(pathFile: string, params: {}) {
  return fetchPost({
    params,
    pathFile,
    urlComplement: "&v2=1&smart=ON",
  })
}

export function ActivePostData(params: {}) {
  return postToApi("GAPP/Active.php", params);
}

export function ActivePutData(params: {}) {
  return putToApi("GAPP/Active.php", params);
}

export function VehiclePutData(params: {}) {
  return putToApi("GAPP/Vehicle.php", params);
}

export function InsurancePostData(params: {}) {
  return postToApi("GAPP/Insurance.php", params);
}

export function InsurancePutData(params: {}) {
  return putToApi("GAPP/Insurance.php", params);
}

export function ActiveData() {
  return getAll("GAPP/Active.php");
}

export function ActiveCompanyData() {
  return getAll("GAPP/Company.php");
}

export function ActiveTypeData() {
  return getAll("GAPP/ActiveType.php");
}

export function ActiveVehicleData(active_id: string) {
  return getByParam("GAPP/Vehicle.php", "active_id_fk", active_id);
}

export function ActiveUnitsData() {
  return getAll("GAPP/Units.php");
}

export function ActiveDepartamentData() {
  return getAll("GAPP/Departament.php");
}

export function ActiveDriverData() {
  return getAll("GAPP/Driver.php");
}

export function ActiveFuelData() {
  return getAll("GAPP/Fuel.php");
}

export function ActiveTypeFuelData() {
  return getAll("GAPP/TypeFuel.php");
}

export function ActiveInsuranceData(vehicle_id_fk?: number | string) {
  return getByParam("GAPP/Insurance.php", {
    all: 1,
    status_insurance: 1,
    vehicle_id_fk: vehicle_id_fk || 0
  });
}

/** Fetch the GAPP user_id by access_code (GIPP user id) */
export function GappUserData(accessCode: number | string) {
  return getByParam("GAPP/Users.php", "access_code", String(accessCode));
}
