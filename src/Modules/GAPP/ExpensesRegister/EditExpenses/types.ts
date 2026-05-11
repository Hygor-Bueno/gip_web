import { TabKey } from "../../Active/Component/Releases/Interfaces";
import { IExpensesItem } from "../Interfaces/InterfaceExpensesRegister";

export interface IAddressForm {
  name: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  number: string;
  complement: string;
}

export const emptyAddress: IAddressForm = {
  name: "", street: "", district: "", city: "", state: "", zip_code: "", number: "", complement: "",
};

export interface IEditExpensesProps {
  item: IExpensesItem;
  units: { label: string; value: string }[];
  expensesType: { label: string; value: string }[];
  stores: { label: string; value: string }[];
  storesData?: any[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (id: number) => void;
}

export const TABS: { key: TabKey; label: string; expTypeId: string; showExpense: boolean }[] = [
  { key: "fuel",        label: "Abastecimento", expTypeId: "1", showExpense: true  },
  { key: "maintenance", label: "Manutenção",    expTypeId: "2", showExpense: true  },
  { key: "sinister",    label: "Sinistro",      expTypeId: "3", showExpense: true  },
  { key: "fines",       label: "Multas",        expTypeId: "4", showExpense: true  },
  { key: "insurance",   label: "Seguro",        expTypeId: "5", showExpense: false },
];

export function tabKeyFromExpType(expTypeId: string): TabKey {
  const t = TABS.find((x) => x.expTypeId === String(expTypeId));
  return t?.key ?? "fuel";
}
