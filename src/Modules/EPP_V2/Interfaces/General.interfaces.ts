/** Arquivo geral das interfaces */
import { IOrder } from "./IOrder.interface";

export interface IApiGeneral {
  order: IOrder[];
}

export interface EppTableData {
  order: IOrder[];
}

export interface IRegisterConfiguration {
  apiData: EppTableData | null;
}

