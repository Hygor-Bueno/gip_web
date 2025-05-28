import React from "react";

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

export interface IDataDB {
    data: {
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
    };
}


export interface IFormData {
  id?: string;
  cnpj?: string;
  name?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  number?: string;
  zip_code?: string;
  complement?: string;
  status_store?: number;
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

export interface ICardInfoProps {
    setData?: React.Dispatch<React.SetStateAction<any>>;
    setHiddenForm?: React.Dispatch<React.SetStateAction<boolean>>;
    visibilityTrash?: boolean;
    dataStore?: Array<any>;
    dataStoreTrash?: any;
    resetDataStore?: () => void;
}


export interface GenericCardItemProps<T> {
  item: T;
  fields: { label: string; key: keyof T }[];
  loading?: boolean;
  onRecycle?: (item: T) => void;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  showRecycle?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
}
