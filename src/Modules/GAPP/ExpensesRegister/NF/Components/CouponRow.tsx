import React from "react";
import { IExpenseCoupon, EXPENSE_TYPE_LABELS } from "../Interfaces/InterfaceNF";
import { formatBRL } from "../utils";

interface CouponRowProps {
  coupon: IExpenseCoupon;
  checked: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function CouponRow({ coupon, checked, onToggle, disabled }: CouponRowProps): JSX.Element {
  const id = String(coupon.expen_id_fk);

  return (
    <label
      className={`nf-coupon-item${checked ? " nf-coupon-item--selected" : ""}${disabled ? " nf-coupon-item--disabled" : ""}`}
      onClick={(e) => { e.preventDefault(); if (!disabled) onToggle(id); }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => { if (!disabled) onToggle(id); }}
        className="nf-coupon-checkbox"
        disabled={disabled}
        tabIndex={-1}
      />
      <span className="nf-coupon-code">{coupon.coupon_number}</span>
      <span className="nf-coupon-type">{EXPENSE_TYPE_LABELS[coupon.expen_type_id] ?? "Outros"}</span>
      <span className="nf-coupon-value">{formatBRL(coupon.total_value)}</span>
    </label>
  );
}
