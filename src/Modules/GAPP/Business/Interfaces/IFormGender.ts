export interface IFormGender {
    cnpj: string;
    name: string;
    street: string;
    district: string;
    city: string;
    state: string;
    number: string;
    zip_code: string;
    complement: string;
    status_store: number;
}


export interface IFormData {
  store_id?: string;
  cnpj: string;
  name: string;
  street: string;
  district: string;
  city: string;
  state: string;
  number: string;
  zip_code: string;
  complement: string;
  status_store: number;
}


export interface InfractionItem {
    infraction: string;
    points: number;
    gravitity: string;
    status_infractions: number;
}

export interface IFormProps {
  data?: IFormData;
  handleFunction?: [
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: string) => void,
    (value: number) => void,
  ];
  resetDataStore?: () => void;
  resetForm?: () => void;
  setData?:any;
}