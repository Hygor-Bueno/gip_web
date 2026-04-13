import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postActiveClass, putActiveClass } from "../Adapters/SettingsAdapters";
import { ActiveClass, ActiveType } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  activeClasses:    ActiveClass[];
  activeTypes:      ActiveType[];
  setActiveClasses: React.Dispatch<React.SetStateAction<ActiveClass[]>>;
  gappWorkGroupId:  number | null;
}

interface Form {
  desc_active_class:   string;
  status_active_class: string;
  active_type_id_fk:   string;
}

const empty: Form = { desc_active_class: "", status_active_class: "1", active_type_id_fk: "" };

export default function ActiveClassTab({ activeClasses, activeTypes, setActiveClasses, gappWorkGroupId }: Props) {
  const [form,        setForm]        = useState<Form>(empty);
  const [selectedId,  setSelectedId]  = useState<number | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isEditMode = selectedId !== null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function clear() {
    setForm(empty);
    setSelectedId(null);
  }

  function onRowSelect(rows: tItemTable[]) {
    if (!rows.length) return;
    const r = rows[0];
    setSelectedId(Number(r.id_active_class?.value ?? 0));
    setForm({
      desc_active_class:   String(r.desc_active_class?.value   ?? ""),
      status_active_class: String(r.status_active_class?.value ?? "1"),
      active_type_id_fk:   String(r.active_type_id_fk?.value   ?? ""),
    });
  }

  async function handleAdd() {
    if (!form.desc_active_class.trim() || !form.active_type_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o tipo e a classificação.", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        desc_active_class:   form.desc_active_class.trim(),
        status_active_class: form.status_active_class,
        active_type_id_fk:   Number(form.active_type_id_fk),
        group_id_fk:         String(gappWorkGroupId ?? ""),
      };
      const res = await postActiveClass(payload);
      if (res?.error) throw new Error(res.message);
      const typeLabel = activeTypes.find(t => t.active_type_id === Number(form.active_type_id_fk))?.desc_active_type ?? "";
      const newItem: ActiveClass = { ...payload, id_active_class: res.last_id, desc_active_type: typeLabel };
      setActiveClasses(prev => [...prev, newItem]);
      handleNotification("Classificação adicionada", "Classificação criada com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.desc_active_class.trim() || !form.active_type_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o tipo e a classificação.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const typeLabel = activeTypes.find(t => t.active_type_id === Number(form.active_type_id_fk))?.desc_active_type ?? "";
      const payload = {
        id_active_class:     selectedId,
        desc_active_class:   form.desc_active_class.trim(),
        status_active_class: form.status_active_class,
        active_type_id_fk:   Number(form.active_type_id_fk),
        desc_active_type:    typeLabel,
        group_id_fk:         String(gappWorkGroupId ?? ""),
      };
      const res = await putActiveClass(payload);
      if (res?.error) throw new Error(res.message);
      setActiveClasses(prev =>
        prev.map(c => c.id_active_class === selectedId ? { ...c, ...payload } : c)
      );
      handleNotification("Classificação atualizada", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(activeClasses, {
    ocultColumns: ["group_id_fk", "active_type_id_fk"],
    customTags: {
      id_active_class:     "Código",
      desc_active_class:   "Classificação",
      desc_active_type:    "Tipo",
      status_active_class: "Status",
    },
    customValue: {
      status_active_class: v => String(v) !== "0" ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      {/* ── Form ── */}
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-list" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Classificação" : "Nova Classificação"}
            </p>
          </div>

          <div className="settings-field">
            <label>Tipo de Ativo *</label>
            <select name="active_type_id_fk" value={form.active_type_id_fk} onChange={handleChange}>
              <option value="">Selecione...</option>
              {activeTypes.map(t => (
                <option key={t.active_type_id} value={t.active_type_id}>
                  {t.desc_active_type}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label>Classificação *</label>
            <input
              name="desc_active_class"
              value={form.desc_active_class}
              onChange={handleChange}
              placeholder="Ex: Passeio"
            />
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_active_class" value={form.status_active_class} onChange={handleChange}>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>

          <div className="settings-form-actions">
            <button
              className="settings-btn-add"
              disabled={isEditMode || saving}
              onClick={handleAdd}
              title="Adicionar classificação"
            >
              <i className="fa fa-plus" /> Adicionar
            </button>
            <button
              className="settings-btn-save"
              disabled={!isEditMode || saving}
              onClick={handleSave}
              title="Salvar alterações"
            >
              <i className="fa fa-save" /> Salvar
            </button>
            <button className="settings-btn-clear" onClick={clear} title="Limpar seleção">
              <i className="fa fa-times" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="settings-table-col">
        {tableList.length === 0 ? (
          <div className="settings-empty">
            <i className="fa fa-inbox" />
            <span>Nenhuma classificação cadastrada</span>
          </div>
        ) : (
          <CustomTable list={tableList} maxSelection={1} onConfirmList={onRowSelect} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações nesta classificação?"
          confirmLabel="Sim, salvar"
          cancelLabel="Cancelar"
          variant="warning"
          onConfirm={executeUpdate}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
