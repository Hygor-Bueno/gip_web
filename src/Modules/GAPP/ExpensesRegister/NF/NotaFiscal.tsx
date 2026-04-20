import React, { useState } from "react";
import { useNFData } from "./Hooks/useNFData";
import { formatBRL } from "./utils";
import { CouponRow } from "./Components/CouponRow";
import { NFRow } from "./Components/NFRow";
import { NFEditModal } from "./Components/NFEditModal";
import "./NotaFiscal.css";

type NFTab = "registrar" | "registradas";

const FORM_FIELDS = [
  { label: "Data de Emissão", name: "dt_issue",    type: "date" },
  { label: "Data de Entrega", name: "dt_delivery", type: "date" },
  { label: "Hora da Saída",   name: "hr_exit",     type: "time" },
  { label: "Número da NF",    name: "number_nf",   type: "text", placeholder: "1234.." },
  { label: "Chave da NF",     name: "nf_key",      type: "text", placeholder: "Chave de acesso.." },
] as const;

export default function NotaFiscal(): JSX.Element {
  const [activeTab, setActiveTab] = useState<NFTab>("registrar");
  const [nfSearch, setNfSearch] = useState("");
  const { coupons, nfList, formValues, setFormValues, selectedCoupons, toggleCoupon, totalSelected, couponSearch, setCouponSearch, filteredCoupons, submitting, handleSubmit, editNF, openEdit, closeEdit, loadingEdit, handleDeleteCoupon, handleAddCoupons } = useNFData();

  const filteredNfList = nfSearch
    ? nfList.filter((nf) => String(nf.number_nf).toLowerCase().includes(nfSearch.toLowerCase()))
    : nfList;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = !!formValues.number_nf && !!formValues.nf_key && !!formValues.dt_issue && !!formValues.dt_delivery && !!formValues.hr_exit && selectedCoupons.size > 0 && !submitting;

  return (
    <div className="nf-root">
      {(editNF || loadingEdit) && (
        <NFEditModal nf={editNF} loading={loadingEdit} allCoupons={coupons} onClose={closeEdit} onDeleteCoupon={handleDeleteCoupon} onAddCoupons={handleAddCoupons} />
      )}

      <div className="nf-page-tabs">
        {(["registrar", "registradas"] as NFTab[]).map((tab) => (
          <button key={tab} type="button" className={`nf-page-tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
            <i className={`fa ${tab === "registrar" ? "fa-file-circle-plus" : "fa-list-check"}`} />
            {tab === "registrar" ? " Registrar NF" : " Notas Registradas"}
          </button>
        ))}
      </div>

      <div className="nf-content">
        {activeTab === "registrar" && (
          <div className="nf-register-root">
            <div className="nf-form-panel">
              <p className="nf-panel-title"><i className="fa fa-file-invoice" /> Dados da Nota</p>
              <div className="nf-form-fields">
                {FORM_FIELDS.map(({ label, name, type, ...rest }) => (
                  <div key={name} className="expenses-field">
                    <label className="expenses-label"><span className="nf-required">*</span> {label}</label>
                    <input className="expenses-input" type={type} name={name} value={(formValues as any)[name]} onChange={handleChange} {...rest} />
                  </div>
                ))}
              </div>
              <div className="nf-form-actions">
                <button className="expenses-btn-search" type="button" onClick={handleSubmit} disabled={!canSubmit}>
                  {submitting ? <><i className="fa fa-spinner fa-spin" /> Registrando...</> : <><i className="fa fa-floppy-disk" /> Registrar NF</>}
                </button>
              </div>
            </div>
            <div className="nf-coupon-panel">
              <p className="nf-panel-title"><i className="fa fa-receipt" /> Selecionar Lançamentos</p>
              <input className="expenses-input nf-coupon-search" type="text" placeholder="Buscar por código do cupom..." value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} />
              {filteredCoupons.length > 0
                ? <div className="nf-coupon-list">{filteredCoupons.map((coupon) => <CouponRow key={String(coupon.expen_id_fk)} coupon={coupon} checked={selectedCoupons.has(String(coupon.expen_id_fk))} onToggle={toggleCoupon} />)}</div>
                : <p className="nf-coupon-empty"><i className="fa fa-inbox" /> Nenhum lançamento disponível</p>
              }
              <div className="nf-total-row">
                <span className="nf-total-label">{selectedCoupons.size} lançamento(s) selecionado(s)</span>
                <span className="nf-total-value">{formatBRL(totalSelected)}</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === "registradas" && (
          <div className="nf-list-root">
            <p className="nf-panel-title"><i className="fa fa-list-check" /> Notas Fiscais</p>
            <input
              className="expenses-input nf-list-search"
              type="text"
              placeholder="Buscar por número da NF..."
              value={nfSearch}
              onChange={(e) => setNfSearch(e.target.value)}
            />
            {nfList.length > 0 ? (
              <div className="nf-table-wrap">
                <table className="nf-table">
                  <thead><tr><th>Número da NF</th><th>Chave de Acesso</th><th>Valor Total</th><th></th></tr></thead>
                  <tbody>{filteredNfList.map((nf) => <NFRow key={nf.number_nf} nf={nf} onEdit={openEdit} />)}</tbody>
                </table>
              </div>
            ) : (
              <div className="expenses-empty">
                <i className="fa fa-file-invoice" />
                <strong>Nenhuma nota fiscal registrada</strong>
                <span>Vá em "Registrar NF" para adicionar uma nova nota.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
