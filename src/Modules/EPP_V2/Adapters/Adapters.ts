import { fetchDataFull } from "../../../Util/Util";
import { FetchConfig } from "../Interfaces/IAdapters.interface";


function fetchGet({ pathFile, urlComplement = "" }: FetchConfig) {
  return fetchDataFull({
    method: "GET",
    params: null,
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

export function getAllEppOrder() {
  return getAll("EPP/Order.php");
}
