import { fetchDataFull } from "../../../../Util/Utils";

function getAll(pathFile: string) {
  return fetchDataFull({ method: "GET", params: null, pathFile, urlComplement: "&all=1" });
}

function postToApi(pathFile: string, params: object) {
  return fetchDataFull({ method: "POST", params, pathFile, urlComplement: "&v2=1&smart=ON" });
}

function putToApi(pathFile: string, params: object) {
  return fetchDataFull({ method: "PUT", params, pathFile, urlComplement: "&v2=1&smart=ON" });
}

// ── ActiveType ────────────────────────────────────────────────────────────────
export const getActiveTypes  = ()            => getAll("GAPP/ActiveType.php");
export const postActiveType  = (p: object)   => postToApi("GAPP/ActiveType.php", p);
export const putActiveType   = (p: object)   => putToApi("GAPP/ActiveType.php", p);

// ── ActiveClass ───────────────────────────────────────────────────────────────
export const getActiveClasses = ()           => getAll("GAPP/ActiveClass.php");
export const postActiveClass  = (p: object)  => postToApi("GAPP/ActiveClass.php", p);
export const putActiveClass   = (p: object)  => putToApi("GAPP/ActiveClass.php", p);

// ── Company ───────────────────────────────────────────────────────────────────
export const getCompanies = ()               => getAll("GAPP/Company.php");
export const postCompany  = (p: object)      => postToApi("GAPP/Company.php", p);
export const putCompany   = (p: object)      => putToApi("GAPP/Company.php", p);

// ── Units ─────────────────────────────────────────────────────────────────────
export const getUnits = ()                   => getAll("GAPP/Units.php");
export const postUnit = (p: object)          => postToApi("GAPP/Units.php", p);
export const putUnit  = (p: object)          => putToApi("GAPP/Units.php", p);

// ── Departaments ──────────────────────────────────────────────────────────────
export const getDepartaments = ()            => getAll("GAPP/Departament.php");
export const postDepartament = (p: object)   => postToApi("GAPP/Departament.php", p);
export const putDepartament  = (p: object)   => putToApi("GAPP/Departament.php", p);

// ── Subdepartaments ───────────────────────────────────────────────────────────
export const getSubdepartaments = ()         => getAll("GAPP/Subdepartament.php");
export const postSubdepartament = (p: object) => postToApi("GAPP/Subdepartament.php", p);
export const putSubdepartament  = (p: object) => putToApi("GAPP/Subdepartament.php", p);
