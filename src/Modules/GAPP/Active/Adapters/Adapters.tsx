import { fetchDataFull } from "../../../../Util/Util";
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

function getAll(pathFile: string) {
  return fetchGet({
    pathFile,
    urlComplement: "&all=1"
  });
}

function getByParam(pathFile: string, param: string, value: string) {
  return fetchGet({
    pathFile,
    urlComplement: `&${param}=${value}`
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
  return postToApi("GAPP_V2/Active.php", params);
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
