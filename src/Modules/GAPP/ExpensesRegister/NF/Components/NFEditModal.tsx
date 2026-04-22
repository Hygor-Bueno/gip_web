import React, { useState, useEffect } from "react";
import { INFWithCoupons, IExpenseCoupon } from "../Interfaces/InterfaceNF";
import { formatBRL } from "../utils";
import { CouponRow } from "./CouponRow";
import { LinkedCouponRow } from "./LinkedCouponRow";

interface NFEditModalProps {
  nf: INFWithCoupons | null;
  loading: boolean;
  allCoupons: IExpenseCoupon[];
  onClose: () => void;
  onDeleteCoupon: (expen_id_fk: number) => Promise<void>;
  onAddCoupons: (nf: INFWithCoupons, newCoupons: IExpenseCoupon[]) => Promise<void>;
}

export function NFEditModal({ nf, loading, allCoupons, onClose, onDeleteCoupon, onAddCoupons }: NFEditModalProps): JSX.Element {
  const [fields, setFields] = useState({ dt_issue: "", dt_delivery: "", hr_exit: "", number_nf: "", nf_key: "" });
  const [addingCoupon, setAddingCoupon] = useState(false);
  const [selectedNew, setSelectedNew] = useState<Set<string>>(new Set());
  const [couponSearch, setCouponSearch] = useState("");
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleRequestDelete(id: number) {
    setPendingDelete(id);
  }

  function handleCancelDelete() {
    setPendingDelete(null);
  }

  async function handleConfirmDelete(id: number) {
    setDeletingId(id);
    try {
      await onDeleteCoupon(id);
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (nf) setFields({ dt_issue: nf.dt_issue ?? "", dt_delivery: nf.dt_delivery ?? "", hr_exit: nf.hr_exit ?? "", number_nf: nf.number_nf ?? "", nf_key: nf.nf_key ?? "" });
  }, [nf?.number_nf]);

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function toggleNew(id: string) {
    setSelectedNew((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleAddSubmit() {
    if (!nf || selectedNew.size === 0) return;
    setSubmittingAdd(true);
    try {
      await onAddCoupons({ ...nf, ...fields }, allCoupons.filter((c) => selectedNew.has(String(c.expen_id_fk))));
      setSelectedNew(new Set()); setCouponSearch(""); setAddingCoupon(false);
    } finally { setSubmittingAdd(false); }
  }

  const linkedNumbers = new Set(nf?.cupons.map((c) => c.coupon_number) ?? []);
  const searchedCoupons = allCoupons
    .filter((c) => c.coupon_number && !linkedNumbers.has(c.coupon_number))
    .filter((c) => !couponSearch || c.coupon_number.toLowerCase().includes(couponSearch.toLowerCase()));

  const totalLiq = nf?.cupons.reduce((sum, c) => sum + Number(c.total_value), 0) ?? 0;

  return (
    <div className="expenses-modal-overlay" onClick={onClose}>
      <div className="expenses-modal nf-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="expenses-modal-header">
          <div className="expenses-modal-icon"><i className="fa fa-file-invoice-dollar text-white" /></div>
          <p className="expenses-modal-title">{loading ? "Carregando..." : `Edição — NF ${nf?.number_nf}`}</p>
          <button className="expenses-modal-close" onClick={onClose} title="Fechar"><i className="fa fa-xmark" /></button>
        </div>

        {loading ? (
          <div className="nf-edit-loading"><i className="fa fa-spinner fa-spin" /></div>
        ) : nf ? (
          <div className="expenses-modal-body">
            <p className="nf-edit-section-title" style={{ marginBottom: "0.6rem" }}>
              <i className="fa fa-file-invoice" /> Dados da Nota Fiscal
            </p>

            <div className="nf-edit-fields-grid">
              {[
                { label: "Data de Emissão",  name: "dt_issue",    type: "date" },
                { label: "Data de Entrega",  name: "dt_delivery", type: "date" },
                { label: "Horário de Saída", name: "hr_exit",     type: "time" },
                { label: "Código da Nota",   name: "number_nf",   type: "text" },
              ].map(({ label, name, type }) => (
                <div key={name} className="expenses-field">
                  <label className="expenses-label">{label}</label>
                  <input className="expenses-input" type={type} name={name} value={(fields as any)[name]} onChange={handleFieldChange} />
                </div>
              ))}
              <div className="expenses-field nf-edit-key-field">
                <label className="expenses-label">Chave da Nota Fiscal</label>
                <input className="expenses-input" type="text" name="nf_key" value={fields.nf_key} onChange={handleFieldChange} />
              </div>
            </div>

            <div className="nf-edit-add-row">
              <p className="nf-edit-section-title"><i className="fa fa-receipt" /> Notas Vinculadas</p>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {pendingDelete !== null && (
                  <button
                    type="button"
                    className="nf-add-coupon-btn nf-cancel-delete-btn"
                    onClick={handleCancelDelete}
                    title="Cancelar remoção pendente"
                  >
                    <i className="fa fa-rotate-left" /> Cancelar
                  </button>
                )}
                <button type="button" className="nf-add-coupon-btn" onClick={() => { setAddingCoupon((v) => !v); setSelectedNew(new Set()); setCouponSearch(""); }}>
                  <i className={`fa ${addingCoupon ? "fa-xmark" : "fa-plus"}`} /> {addingCoupon ? "Cancelar" : "Adicionar"}
                </button>
              </div>
            </div>

            {addingCoupon && (
              <div className="nf-add-coupon-panel">
                <input className="expenses-input" type="text" placeholder="Buscar cupom..." value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} style={{ marginBottom: "0.5rem" }} />
                <div className="nf-add-coupon-list">
                  {searchedCoupons.length > 0
                    ? searchedCoupons.map((c) => <CouponRow key={String(c.expen_id_fk)} coupon={c} checked={selectedNew.has(String(c.expen_id_fk))} onToggle={toggleNew} />)
                    : <p className="nf-coupon-empty" style={{ padding: "0.75rem" }}><i className="fa fa-inbox" /> Nenhum lançamento disponível</p>
                  }
                </div>
                <button type="button" className="expenses-btn-search" style={{ marginTop: "0.6rem", width: "100%" }} onClick={handleAddSubmit} disabled={selectedNew.size === 0 || submittingAdd}>
                  {submittingAdd ? <><i className="fa fa-spinner fa-spin" /> Adicionando...</> : <><i className="fa fa-link" /> Vincular{selectedNew.size > 0 ? ` (${selectedNew.size})` : ""}</>}
                </button>
              </div>
            )}

            {nf.cupons.length > 0
              ? <div className="nf-edit-coupons">{nf.cupons.map((c) => (
                  <LinkedCouponRow
                    key={c.expen_id_fk}
                    coupon={c}
                    confirming={pendingDelete === c.expen_id_fk}
                    removing={deletingId === c.expen_id_fk}
                    onRequestDelete={handleRequestDelete}
                    onConfirmDelete={handleConfirmDelete}
                  />
                ))}</div>
              : <p className="nf-coupon-empty" style={{ padding: "0.5rem 0" }}>Nenhum lançamento vinculado.</p>
            }

            <div className="nf-total-row">
              <span className="nf-total-label">Valor total líquido somado</span>
              <span className="nf-total-value">{formatBRL(totalLiq)}</span>
            </div>
          </div>
        ) : null}

        <div className="expenses-modal-footer">
          <button className="expenses-modal-btn-close" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
