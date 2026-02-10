import { IRegisterConfiguration } from "../Interfaces/General.interfaces";

/** Esse build permite que constuimos os options de maneira organizada em uma unica função */
export function buildOptions(apiData?: IRegisterConfiguration["apiData"]) {
  return {
    delivered: apiData?.order?.map((o) => ({
      label: (o.delivered == "0") ? "pendente" : o.delivered == "1" ? "entregue": "pendente",
      value: String(o.delivered),
    })) || [],
  };
}