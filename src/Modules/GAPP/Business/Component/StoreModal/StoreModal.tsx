import React from "react";
import { Modal } from "react-bootstrap";
import { IFormGender } from "../../Interfaces/IFormGender";
import "./StoreModal.css";

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO",
  "MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

type StoreModalProps = {
  mode: "create" | "edit";
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  data: IFormGender;
  onFieldChange: (field: keyof IFormGender, value: string | number) => void;
  onSearchCEP: () => void;
  onSave: () => void;
};

const StoreModal: React.FC<StoreModalProps> = ({
  mode,
  showModal,
  setShowModal,
  data,
  onFieldChange,
  onSearchCEP,
  onSave,
}) => {
  const isEdit = mode === "edit";

  const field = (
    label: string,
    key: keyof IFormGender,
    opts?: {
      placeholder?: string;
      required?: boolean;
      disabled?: boolean;
      type?: string;
      maxLength?: number;
    }
  ) => (
    <div className="sm-field">
      <label className="sm-label">
        {label}
        {opts?.required && <span className="sm-label-required">*</span>}
      </label>
      <input
        className="sm-input"
        type={opts?.type ?? "text"}
        placeholder={opts?.placeholder ?? ""}
        value={(data[key] as string) ?? ""}
        disabled={opts?.disabled}
        maxLength={opts?.maxLength}
        onChange={(e) => onFieldChange(key, e.target.value)}
      />
    </div>
  );

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      centered
      dialogClassName="sm-dialog"
      size="lg"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="sm-header">
        <div className="sm-header-left">
          <div className={`sm-icon ${isEdit ? "sm-icon-edit" : "sm-icon-create"}`}>
            <i className={`fa ${isEdit ? "fa-pen" : "fa-shop"}`} />
          </div>
          <div>
            <h5 className="sm-title">{isEdit ? "Editar Empresa" : "Nova Empresa"}</h5>
            <p className="sm-subtitle">
              {isEdit ? "Atualize os dados do cadastro" : "Preencha os dados para cadastrar"}
            </p>
          </div>
        </div>
        <button className="sm-close" onClick={() => setShowModal(false)} title="Fechar">
          <i className="fa fa-xmark" />
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="sm-body">

        {/* Identificação */}
        <p className="sm-section-label">Identificação</p>

        <div className="sm-row sm-row-2">
          {field("Nome da Empresa", "name", { placeholder: "Ex: Filial São Paulo", required: true, maxLength: 100 })}
          {field("CNPJ", "cnpj", { placeholder: "00.000.000/0001-00", maxLength: 18 })}
        </div>

        {/* Endereço */}
        <p className="sm-section-label">Endereço</p>

        {/* CEP */}
        <div className="sm-row sm-row-2">
          <div className="sm-field">
            <label className="sm-label">
              CEP <span className="sm-label-required">*</span>
            </label>
            <div className="sm-input-wrap">
              <input
                className="sm-input"
                type="text"
                placeholder="00000-000"
                value={data.zip_code ?? ""}
                maxLength={9}
                onChange={(e) => onFieldChange("zip_code", e.target.value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2"))}
                onBlur={onSearchCEP}
              />
              <button className="sm-input-action" type="button" onClick={onSearchCEP} title="Buscar CEP">
                <i className="fa fa-magnifying-glass" />
              </button>
            </div>
          </div>
          {field("Bairro", "district", { placeholder: "Ex: Centro" })}
        </div>

        <div className="sm-row sm-row-3">
          {field("Rua / Logradouro", "street", { placeholder: "Ex: Rua das Flores", required: true })}
          {field("Nº", "number",  { placeholder: "Ex: 123", required: true, maxLength: 10 })}
          {field("Complemento", "complement", { placeholder: "Ex: Sala 201" })}
        </div>

        <div className="sm-row sm-row-4">
          {field("Cidade", "city", { placeholder: "Ex: São Paulo", required: true })}
          <div className="sm-field">
            <label className="sm-label">
              Estado <span className="sm-label-required">*</span>
            </label>
            <div className="sm-select-wrap">
              <select
                className="sm-select"
                value={data.state ?? ""}
                onChange={(e) => onFieldChange("state", e.target.value)}
              >
                <option value="">Selecione</option>
                {BR_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status — edit only */}
        {isEdit && (
          <>
            <p className="sm-section-label">Status</p>
            <div className="sm-status-group">
              <button
                type="button"
                className={`sm-status-btn ${data.status_store == 1 ? "sm-status-active" : ""}`}
                onClick={() => onFieldChange("status_store", 1)}
              >
                <i className="fa fa-circle-check" /> Ativo
              </button>
              <button
                type="button"
                className={`sm-status-btn ${data.status_store == 0 ? "sm-status-inactive" : ""}`}
                onClick={() => onFieldChange("status_store", 0)}
              >
                <i className="fa fa-circle-xmark" /> Inativo
              </button>
            </div>
          </>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="sm-footer">
        <button className="sm-btn-cancel" onClick={() => setShowModal(false)}>
          Cancelar
        </button>
        <button
          className={`sm-btn-save ${isEdit ? "sm-btn-save-edit" : "sm-btn-save-create"}`}
          onClick={onSave}
        >
          <i className={`fa ${isEdit ? "fa-floppy-disk" : "fa-plus"}`} />
          {isEdit ? "Salvar Alterações" : "Cadastrar"}
        </button>
      </div>
    </Modal>
  );
};

export default StoreModal;
