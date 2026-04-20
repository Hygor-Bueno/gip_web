import React from "react";
import { INFCoupon } from "../Interfaces/InterfaceNF";
import { formatBRL } from "../utils";

interface LinkedCouponRowProps {
  coupon: INFCoupon;
  confirming: boolean;
  removing: boolean;
  onRequestDelete: (expen_id_fk: number) => void;
  onConfirmDelete: (expen_id_fk: number) => void;
}

export function LinkedCouponRow({ coupon, confirming, removing, onRequestDelete, onConfirmDelete }: LinkedCouponRowProps): JSX.Element {
  function handleClick() {
    if (removing) return;
    if (confirming) onConfirmDelete(coupon.expen_id_fk);
    else onRequestDelete(coupon.expen_id_fk);
  }

  return (
    <div className="nf-edit-coupon-row">
      <span className="nf-coupon-code">{coupon.coupon_number}</span>
      <span className="nf-coupon-value">{formatBRL(coupon.total_value)}</span>
      <button
        className={`nf-delete-btn${confirming ? " nf-delete-btn--confirm" : ""}`}
        type="button"
        onClick={handleClick}
        disabled={removing}
        title={confirming ? "Clique novamente para confirmar" : "Desvincular cupom"}
      >
        {removing
          ? <i className="fa fa-spinner fa-spin" />
          : confirming
          ? <i className="fa fa-check" />
          : <i className="fa fa-xmark" />
        }
      </button>
    </div>
  );
}
