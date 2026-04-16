import React from "react";
import {
  ActiveForMovement,
  MovementFormState,
  LazyDepartament,
  LazySubdepartament,
} from "../../Interfaces/MovementInterfaces";
import { Unit } from "../../../Active/Interfaces/OrgInterfaces";

interface Props {
  form:            MovementFormState;
  setForm:         React.Dispatch<React.SetStateAction<MovementFormState>>;
  selectedActives: ActiveForMovement[];
  toggleActive:    (active: ActiveForMovement) => void;
  setPhase:        (phase: 0 | 1) => void;
  units:           Unit[];
  departments:     LazyDepartament[];
  subdepartaments: LazySubdepartament[];
  loadingDepts:    boolean;
  loadingSubDepts: boolean;
  submitting:      boolean;
  handleUnitChange:   (unitId: string) => void;
  handleDepChange:    (depId: string) => void;
  handleSubmit:       () => void;
  setConfirmCancel:   (v: boolean) => void;
}

export default function PhaseTwoFormData({
  form, setForm,
  selectedActives, toggleActive, setPhase,
  units, departments, subdepartaments,
  loadingDepts, loadingSubDepts, submitting,
  handleUnitChange, handleDepChange, handleSubmit,
  setConfirmCancel,
}: Props) {
  return (
    <div className="mvform-phase1">

      {/* ── Left panel — selected assets ── */}
      <div className="mvform-phase1-left">
        <div className="mvform-card">
          <div className="mvform-card-header">
            <div className="mvform-card-header-icon"><i className="fa fa-cubes" /></div>
            <span className="mvform-card-header-title">Ativos selecionados</span>
            <span className="mvform-count-badge">{selectedActives.length}</span>
          </div>

          <div className="mvform-chips-list">
            {selectedActives.map(a => (
              <div key={a.active_id} className="mvform-chip">
                <div className="mvform-chip-info">
                  <span className="mvform-chip-id">#{a.active_id}</span>
                  <span className="mvform-chip-name">{a.brand} {a.model}</span>
                  {a.license_plates && (
                    <span className="mvform-chip-plate">
                      <i className="fa fa-car" /> {a.license_plates}
                    </span>
                  )}
                  <span className="mvform-chip-type">{a.desc_active_class}</span>
                </div>
                <button
                  className="mvform-chip-remove"
                  onClick={() => { toggleActive(a); if (selectedActives.length === 1) setPhase(0); }}
                  title="Remover"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            ))}
          </div>

          <button className="mvform-btn-back" onClick={() => setPhase(0)}>
            <i className="fa fa-arrow-left" /> Voltar à seleção
          </button>
        </div>
      </div>

      {/* ── Right panel — form fields ── */}
      <div className="mvform-phase1-right">
        <div className="mvform-card">
          <div className="mvform-card-header">
            <div className="mvform-card-header-icon"><i className="fa fa-exchange" /></div>
            <span className="mvform-card-header-title">Dados da movimentação</span>
          </div>

          <div className="mvform-fields">

            <div className="mvform-field">
              <label>Tipo de movimentação</label>
              <div className="mvform-type-toggle">
                <button
                  className={`mvform-type-btn${form.type_movimentation === "internal" ? " active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type_movimentation: "internal" }))}
                >
                  <i className="fa fa-building" /> Interna
                </button>
                <button
                  className={`mvform-type-btn${form.type_movimentation === "external" ? " active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type_movimentation: "external" }))}
                >
                  <i className="fa fa-external-link" /> Externa
                </button>
              </div>
              {form.type_movimentation === "external" && selectedActives.length > 1 && (
                <span className="mvform-field-warn">
                  <i className="fa fa-exclamation-triangle" /> Remova os ativos extras antes de registrar.
                </span>
              )}
            </div>

            <div className="mvform-field">
              <label>Unidade de destino <span className="mvform-required">*</span></label>
              <select value={form.unit_id_fk} onChange={e => handleUnitChange(e.target.value)}>
                <option value="">Selecionar unidade...</option>
                {units.map(u => (
                  <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>
                ))}
              </select>
            </div>

            <div className="mvform-field">
              <label>
                Departamento
                {loadingDepts && <i className="fa fa-spinner fa-spin mvform-spinner" />}
              </label>
              <select
                value={form.dep_id_fk}
                onChange={e => handleDepChange(e.target.value)}
                disabled={!form.unit_id_fk || loadingDepts}
              >
                <option value="">
                  {!form.unit_id_fk ? "Selecione a unidade primeiro"
                    : loadingDepts ? "Carregando..." : "Selecionar departamento..."}
                </option>
                {departments.map(d => (
                  <option key={d.dep_id} value={d.dep_id}>{d.dep_name}</option>
                ))}
              </select>
            </div>

            <div className="mvform-field">
              <label>
                Subdepartamento
                {loadingSubDepts && <i className="fa fa-spinner fa-spin mvform-spinner" />}
              </label>
              <select
                value={form.sub_dep_id_fk}
                onChange={e => setForm(f => ({ ...f, sub_dep_id_fk: e.target.value }))}
                disabled={!form.dep_id_fk || loadingSubDepts}
              >
                <option value="">
                  {!form.dep_id_fk ? "Selecione o departamento primeiro"
                    : loadingSubDepts ? "Carregando..." : "Selecionar subdepartamento..."}
                </option>
                {subdepartaments.map(s => (
                  <option key={s.sub_dep_id} value={s.sub_dep_id}>{s.sub_dep_name}</option>
                ))}
              </select>
            </div>

            <div className="mvform-field">
              <label>Observação</label>
              <textarea
                className="mvform-textarea"
                placeholder="Descreva o motivo da movimentação (opcional)..."
                value={form.obs_movimentation}
                onChange={e => setForm(f => ({ ...f, obs_movimentation: e.target.value }))}
                rows={3}
              />
            </div>

          </div>

          <div className="mvform-actions">
            <button className="mvform-btn-cancel" onClick={() => setConfirmCancel(true)}>
              <i className="fa fa-times" /> Cancelar
            </button>
            <button
              className="mvform-btn-submit"
              disabled={
                !form.unit_id_fk || submitting ||
                (form.type_movimentation === "external" && selectedActives.length > 1)
              }
              onClick={handleSubmit}
            >
              {submitting
                ? <><i className="fa fa-spinner fa-spin" /> Registrando...</>
                : <><i className="fa fa-check" /> Registrar movimentação</>}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
