import { TabKey } from "./Interfaces";
import { AddressForm } from "./ExpenseFields";

export const emptyAddress: AddressForm = {
  name: "", street: "", district: "", city: "", state: "", zip_code: "", number: "", complement: "",
};

export const TABS: { key: TabKey; label: string; expTypeId: number | null; showExpense: boolean }[] = [
  { key: "fuel",        label: "Abastecimento", expTypeId: 1,    showExpense: true  },
  { key: "maintenance", label: "Manutenção",    expTypeId: 2,    showExpense: true  },
  { key: "fines",       label: "Multas",        expTypeId: 4,    showExpense: true  },
  { key: "sinister",    label: "Sinistro",      expTypeId: 3,    showExpense: true  },
  { key: "insurance",   label: "Seguro",        expTypeId: 5,    showExpense: false },
  { key: "trips",       label: "Viagens",       expTypeId: null, showExpense: false },
];
