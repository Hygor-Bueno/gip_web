export interface INFItem {
  number_nf: string;
  nf_key: string;
  total_liq: string | number;
}

/** Cupom de despesa disponível para vincular a uma NF (retorno de &list_expenses=1) */
export interface IExpenseCoupon {
  expen_id_fk: number;     // campo correto retornado pela API
  coupon_number: string;
  total_value: number;
  expen_type_id: number;   // campo correto retornado pela API
}

/** Cupom já vinculado a uma NF (retorno de &list-edit-number-nf) */
export interface INFCoupon {
  expen_id_fk: number;
  coupon_number: string;
  total_value: number;
}

export interface INFFormValues {
  dt_issue: string;
  dt_delivery: string;
  hr_exit: string;
  number_nf: string;
  nf_key: string;
}

export interface INFWithCoupons extends INFItem {
  dt_issue: string;
  dt_delivery: string;
  hr_exit: string;
  cupons: INFCoupon[];
}

export const EXPENSE_TYPE_LABELS: Record<number, string> = {
  1: "Combustível",
  2: "Manutenção",
  3: "Sinistros",
  4: "Multas",
  5: "Seguro",
  6: "Outros",
};

export const NF_FORM_INITIAL: INFFormValues = {
  dt_issue: "",
  dt_delivery: "",
  hr_exit: "",
  number_nf: "",
  nf_key: "",
};
