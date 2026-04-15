import React from "react";
import { Modal } from "react-bootstrap";
import "./InfractionModal.css";

const GRAVITY_OPTIONS = [
  { value: "leve",       label: "Leve" },
  { value: "media",      label: "Média" },
  { value: "grave",      label: "Grave" },
  { value: "gravissima", label: "Gravíssima" },
];

type InfractionModalProps = {
  mode: "create" | "edit";
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  handleSave: () => void;
  infractionId?: string;
  infraction: string;
  gravity: string;
  points: string;
  statusInfractions: string;
  setInfraction: (v: string) => void;
  setGravity: (v: string) => void;
  setPoints: (v: string) => void;
  setStatusInfractions: (v: string) => void;
  // edit-only navigation
  onBack?: () => void;
  onNext?: () => void;
  pageNation?: string | number;
  showNavigation?: boolean;
};

const InfractionModal: React.FC<InfractionModalProps> = ({
  mode,
  showModal,
  setShowModal,
  handleSave,
  infractionId,
  infraction,
  gravity,
  points,
  statusInfractions,
  setInfraction,
  setGravity,
  setPoints,
  setStatusInfractions,
  onBack,
  onNext,
  pageNation,
  showNavigation = false,
}) => {
  const isEdit = mode === "edit";

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setPoints(val);
  };

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      centered
      dialogClassName="im-dialog"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="im-header">
        <div className="im-header-left">
          <div className={`im-icon ${isEdit ? "im-icon-edit" : "im-icon-create"}`}>
            <i className={`fa ${isEdit ? "fa-pen" : "fa-plus"}`} />
          </div>
          <div className="im-title-wrap">
            <h5 className="im-title">
              {isEdit ? "Editar Infração" : "Nova Infração"}
            </h5>
            {isEdit && showNavigation && (
              <span className="im-pagination">
                <i className="fa fa-file-lines" />
                {pageNation}
              </span>
            )}
          </div>
        </div>
        <button className="im-close" onClick={() => setShowModal(false)} title="Fechar">
          <i className="fa fa-xmark" />
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="im-body">

        {/* ID (edit only) */}
        {isEdit && (
          <div className="im-field">
            <label className="im-label">ID do Registro</label>
            <input
              className="im-input"
              type="text"
              value={infractionId ?? ""}
              disabled
            />
          </div>
        )}

        {/* Infração */}
        <div className="im-field">
          <label className="im-label">
            Infração <span className="im-label-required">*</span>
          </label>
          <input
            className="im-input"
            type="text"
            placeholder="Ex: Avanço de sinal vermelho"
            value={infraction}
            maxLength={100}
            onChange={(e) => setInfraction(e.target.value)}
          />
        </div>

        {/* Gravidade + Pontos */}
        <div className="im-row">
          <div className="im-field">
            <label className="im-label">
              Gravidade <span className="im-label-required">*</span>
            </label>
            <div className="im-gravity-group">
              {GRAVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`im-gravity-pill ${gravity === opt.value ? `active-${opt.value}` : ""}`}
                  onClick={() => setGravity(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="im-field">
            <label className="im-label">
              Pontos <span className="im-label-required">*</span>
            </label>
            <input
              className="im-input"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 5"
              value={points}
              onChange={handlePointsChange}
            />
          </div>
        </div>

        {/* Status */}
        <div className="im-field">
          <label className="im-label">
            Status <span className="im-label-required">*</span>
          </label>
          <div className="im-status-group">
            <button
              type="button"
              className={`im-status-btn ${statusInfractions === "ativo" ? "active-ativo" : ""}`}
              onClick={() => setStatusInfractions("ativo")}
            >
              <i className="fa fa-circle-check" />
              Ativo
            </button>
            <button
              type="button"
              className={`im-status-btn ${statusInfractions === "inativo" ? "active-inativo" : ""}`}
              onClick={() => setStatusInfractions("inativo")}
            >
              <i className="fa fa-circle-xmark" />
              Inativo
            </button>
          </div>
        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="im-footer">
        {isEdit && showNavigation && (
          <div className="im-nav">
            <button
              className="im-nav-btn"
              onClick={onBack}
              disabled={!onBack}
              title="Registro anterior"
            >
              <i className="fa fa-chevron-left" />
            </button>
            <button
              className="im-nav-btn"
              onClick={onNext}
              disabled={!onNext}
              title="Próximo registro"
            >
              <i className="fa fa-chevron-right" />
            </button>
          </div>
        )}

        <div className="im-footer-actions">
          <button className="im-btn-cancel" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button
            className={`im-btn-save ${isEdit ? "im-btn-save-edit" : "im-btn-save-create"}`}
            onClick={handleSave}
          >
            <i className={`fa ${isEdit ? "fa-floppy-disk" : "fa-plus"}`} />
            {isEdit ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InfractionModal;
