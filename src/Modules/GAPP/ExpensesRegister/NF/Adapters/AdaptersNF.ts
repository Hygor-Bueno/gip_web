import { fetchDataFull } from "../../../../../Util/Utils";

export function getNFExpenses() {
  return fetchDataFull({
    method: "GET",
    params: null,
    pathFile: "GAPP/nf.php",
    urlComplement: "&list_expenses=1",
  });
}

export function getAllNFs() {
  return fetchDataFull({
    method: "GET",
    params: null,
    pathFile: "GAPP/nf.php",
    urlComplement: "&list-edit-all=1",
  });
}

export function getNFByNumber(number_nf: string) {
  return fetchDataFull({
    method: "GET",
    params: null,
    pathFile: "GAPP/nf.php",
    urlComplement: `&list-edit-number-nf=${number_nf}`,
  });
}

export function postNFCoupon(params: {
  dt_delivery: string;
  dt_issue: string;
  hr_exit: string;
  nf_key: string;
  number_nf: string;
  expen_id_fk: number;
  user_id_fk: number;
}) {
  return fetchDataFull({
    method: "POST",
    params,
    pathFile: "GAPP/nf.php",
    urlComplement: "",
  });
}

export function deleteNFCoupon(expen_id_fk: number) {
  return fetchDataFull({
    method: "DELETE",
    params: { expen_id_fk },
    pathFile: "GAPP/nf.php",
    urlComplement: "",
  });
}

export function resolveGappUser(accessCode: number | string) {
  return fetchDataFull({
    method: "GET",
    params: null,
    pathFile: "GAPP/Users.php",
    urlComplement: `&access_code=${accessCode}`,
  });
}
