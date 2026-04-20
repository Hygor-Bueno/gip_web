import React, { useState } from "react";
import { INFCoupon } from "../Interfaces/InterfaceNF";
import { formatBRL } from "../utils";

interface LinkedCouponRowProps {
  coupon: INFCoupon;
  onDelete: (expen_id_fk: number) => Promise<void>;
}

export function LinkedCouponRow({ coupon, onDelete }: LinkedCouponRowProps): JSX.Element {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!confirming) { setConfirming(true); return; }
    setRemoving(true);
    await onDelete(coupon.expen_id_fk);
    setRemoving(false);
    setConfirming(false);
  }

  return (
    <div className="nf-edit-coupon-row">
      <span className="nf-coupon-code">{coupon.coupon_number}</span>
      <span className="nf-coupon-value">{formatBRL(coupon.total_value)}</span>
      <button
        className={`nf-delete-btn${confirming ? " nf-delete-btn--confirm" : ""}`}
        type="button"
        onClick={handleRemove}
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
