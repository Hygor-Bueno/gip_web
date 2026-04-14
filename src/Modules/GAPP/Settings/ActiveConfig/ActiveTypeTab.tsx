import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postActiveType, putActiveType } from "../Adapters/SettingsAdapters";
import { ActiveType } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  activeTypes:    ActiveType[];
  setActiveTypes: React.Dispatch<React.SetStateAction<ActiveType[]>>;
  gappWorkGroupId: number | null;
}

interface Form {
  desc_active_type:   string;
  status_active_type: string;
  date_active_type:   string;
}

const today = new Date().toISOString().split("T")[0];
const empty: Form = { desc_active_type: "", status_active_type: "1", date_active_type: today };

export default function ActiveTypeTab({ activeTypes, setActiveTypes, gappWorkGroupId }: Props) {
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
    setSelectedId(Number(r.active_type_id?.value ?? 0));
    setForm({
      desc_active_type:   String(r.desc_active_type?.value   ?? ""),
      status_active_type: String(r.status_active_type?.value ?? "1"),
      date_active_type:   String(r.date_active_type?.value   ?? today),
    });
  }

  async function handleAdd() {
    if (!form.desc_active_type.trim()) {
      handleNotification("Campo obrigatório", "Informe a descrição.", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        desc_active_type:   form.desc_active_type.trim(),
        status_active_type: Number(form.status_active_type),
        date_active_type:   form.date_active_type,
        group_id_fk:        String(gappWorkGroupId ?? ""),
      };
      const res = await postActiveType(payload);
      if (res?.error) throw new Error(res.message);
      const newItem: ActiveType = { ...payload, active_type_id: Number(res.last_id), group_id_fk: String(gappWorkGroupId ?? "") };
      setActiveTypes(prev => [...prev, newItem]);
      handleNotification("Tipo adicionado", "Tipo de ativo criado com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.desc_active_type.trim()) {
      handleNotification("Campo obrigatório", "Informe a descrição.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const payload = {
        active_type_id:     selectedId!,
        desc_active_type:   form.desc_active_type.trim(),
        status_active_type: Number(form.status_active_type),
        date_active_type:   form.date_active_type,
        group_id_fk:        String(gappWorkGroupId ?? ""),
      };
      const res = await putActiveType(payload);
      if (res?.error) throw new Error(res.message);
      setActiveTypes(prev =>
        prev.map(t => t.active_type_id === selectedId ? { ...t, ...payload } : t)
      );
      handleNotification("Tipo atualizado", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(activeTypes, {
    ocultColumns: ["group_id_fk"],
    customTags: {
      active_type_id:     "Código",
      desc_active_type:   "Descrição",
      date_active_type:   "Data",
      status_active_type: "Status",
    },
    customValue: {
      status_active_type: v => String(v) !== "0" ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      {/* ── Form ── */}
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-tag" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Tipo" : "Novo Tipo de Ativo"}
            </p>
          </div>

          <div className="settings-field">
            <label>Descrição *</label>
            <input
              name="desc_active_type"
              value={form.desc_active_type}
              onChange={handleChange}
              placeholder="Ex: Veículo"
            />
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_active_type" value={form.status_active_type} onChange={handleChange}>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Data</label>
            <input
              type="date"
              name="date_active_type"
              value={form.date_active_type}
              onChange={handleChange}
            />
          </div>

          <div className="settings-form-actions">
            <button
              className="settings-btn-add"
              disabled={isEditMode || saving}
              onClick={handleAdd}
              title="Adicionar novo tipo"
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
            <span>Nenhum tipo cadastrado</span>
          </div>
        ) : (
          <CustomTable
            list={tableList}
            maxSelection={1}
            onConfirmList={onRowSelect}
          />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações neste tipo de ativo?"
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
