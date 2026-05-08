/**
 * Fetch silencioso — não dispara toast em caso de erro do backend.
 * Usado pra GETs/PUTs onde a falha precisa ser tratada localmente
 * sem expor mensagens técnicas (ex: erros de SQL) ao usuário final.
 */
async function fetchSilent(
  method: "GET" | "POST" | "PUT" | "DELETE",
  pathFile: string,
  urlComplement: string,
  params: object | null,
): Promise<any> {
  try {
    const baseURL = process.env.REACT_APP_API_GIPP_BASE_URL;
    const port = process.env.REACT_APP_API_GIPP_PORT_SERVER_DEFAULT;
    const token = localStorage.getItem("tokenGIPP") ?? "";
    const url = `${baseURL}:${port}/Controller/${pathFile}?app_id=18&AUTH=${token}${urlComplement || ""}`;

    const opts: any = { method };
    if (params) {
      opts.body = JSON.stringify(params);
      opts.headers = { "Content-Type": "application/json" };
    }
    const response = await fetch(url, opts);
    const body = await response.json();
    return body;
  } catch (err: any) {
    return { error: true, message: err?.message ?? "silent fetch failed", data: [] };
  }
}

const get  = (pathFile: string, urlComplement: string) => fetchSilent("GET",  pathFile, urlComplement, null);
const put  = (pathFile: string, params: object)         => fetchSilent("PUT",  pathFile, "",            params);
const post = (pathFile: string, params: object)         => fetchSilent("POST", pathFile, "",            params);

export const getMaintenanceByExpense = (expenId: number | string) =>
  get("GAPP/Maintenance.php", `&all=1&expen_id_fk=${expenId}`);

export const getFuelByExpense = (expenId: number | string) =>
  get("GAPP/Fuel.php", `&all=1&expen_id_fk=${expenId}`);

export const getFinesByExpense = (expenId: number | string) =>
  get("GAPP/Fines.php", `&all=1&expen_id_fk=${expenId}`);

export const getSinisterByExpense = (expenId: number | string) =>
  get("GAPP/Sinister.php", `&all=1&expen_id_fk=${expenId}`);

export const getInsuranceById = (insuranceId: number | string) =>
  get("GAPP/Insurance.php", `&all=1&id_insurance=${insuranceId}`);

export const putExpensesRegister = (params: object) =>
  put("GAPP/ExpensesRegister.php", params);

export const putMaintenance = (params: object) =>
  put("GAPP/Maintenance.php", params);

export const putFuel = (params: object) =>
  put("GAPP/Fuel.php", params);

export const putFines = (params: object) =>
  put("GAPP/Fines.php", params);

export const putSinister = (params: object) =>
  put("GAPP/Sinister.php", params);

export const putInsurance = (params: object) =>
  put("GAPP/Insurance.php", params);

export const postMaintenance = (params: object) =>
  post("GAPP/Maintenance.php", params);

export const postFuel = (params: object) =>
  post("GAPP/Fuel.php", params);

export const postFines = (params: object) =>
  post("GAPP/Fines.php", params);

export const postSinister = (params: object) =>
  post("GAPP/Sinister.php", params);

export const getStoreById = (storeId: string | number) => get("GAPP/Store.php", `&store_id=${storeId}`);
export const getDrivers = () => get("GAPP/Driver.php", "&all=1");
export const getFuelTypes = () => get("GAPP/TypeFuel.php", "&all=1");
export const getInfractions = () => get("GAPP/Infraction.php", "&status_infractions=1");
export const getUtilization = () => get("GAPP/Utilization.php", "&all=1");
export const getInsuranceCompany = () => get("GAPP/InsuranceCompany.php", "&all=1");
export const getTypeCoverage = () => get("GAPP/TypeCoverage.php", "&all=1");
