import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postSubdepartament, putSubdepartament } from "../Adapters/SettingsAdapters";
import { Departament, Subdepartament } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  subdepartaments:    Subdepartament[];
  departaments:       Departament[];
  setSubdepartaments: React.Dispatch<React.SetStateAction<Subdepartament[]>>;
}

interface Form {
  sub_dep_name: string;
  status_sub_dep: string;
  dep_id_fk:    string;
}

const empty: Form = { sub_dep_name: "", status_sub_dep: "1", dep_id_fk: "" };

export default function SubdepartamentsTab({ subdepartaments, departaments, setSubdepartaments }: Props) {
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
    setSelectedId(Number(r.sub_dep_id?.value ?? 0));
    setForm({
      sub_dep_name:   String(r.sub_dep_name?.value   ?? ""),
      status_sub_dep: String(r.status_sub_dep?.value ?? "1"),
      dep_id_fk:      String(r.dep_id_fk?.value      ?? ""),
    });
  }

  async function handleAdd() {
    if (!form.sub_dep_name.trim() || !form.dep_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e o departamento.", "danger");
      return;
    }
    setSaving(true);
    try {
      const depName = departaments.find(d => d.dep_id === Number(form.dep_id_fk))?.dep_name ?? "";
      const payload = {
        sub_dep_name:   form.sub_dep_name.trim(),
        status_sub_dep: Number(form.status_sub_dep),
        dep_id_fk:      Number(form.dep_id_fk),
        dep_name:       depName,
      };
      const res = await postSubdepartament(payload);
      if (res?.error) throw new Error(res.message);
      setSubdepartaments(prev => [...prev, { ...payload, sub_dep_id: Number(res.last_id) }]);
      handleNotification("Subdepartamento adicionado", "Subdepartamento criado com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.sub_dep_name.trim() || !form.dep_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e o departamento.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const depName = departaments.find(d => d.dep_id === Number(form.dep_id_fk))?.dep_name ?? "";
      const payload = {
        sub_dep_id:     selectedId!,
        sub_dep_name:   form.sub_dep_name.trim(),
        status_sub_dep: Number(form.status_sub_dep),
        dep_id_fk:      Number(form.dep_id_fk),
        dep_name:       depName,
      };
      const res = await putSubdepartament(payload);
      if (res?.error) throw new Error(res.message);
      setSubdepartaments(prev =>
        prev.map(s => s.sub_dep_id === selectedId ? { ...s, ...payload } : s)
      );
      handleNotification("Subdepartamento atualizado", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(subdepartaments, {
    ocultColumns: ["dep_id_fk", "group_id_fk"],
    customTags: {
      sub_dep_id:     "Código",
      sub_dep_name:   "Subdepartamento",
      dep_name:       "Departamento",
      status_sub_dep: "Status",
    },
    customValue: {
      status_sub_dep: v => Number(v) !== 0 ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-code-branch" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Subdepartamento" : "Novo Subdepartamento"}
            </p>
          </div>

          <div className="settings-field">
            <label>Nome do Subdepartamento *</label>
            <input
              name="sub_dep_name"
              value={form.sub_dep_name}
              onChange={handleChange}
              placeholder="Ex: Suporte N1"
            />
          </div>

          <div className="settings-field">
            <label>Departamento *</label>
            <select name="dep_id_fk" value={form.dep_id_fk} onChange={handleChange}>
              <option value="">Selecione...</option>
              {departaments.map(d => (
                <option key={d.dep_id} value={d.dep_id}>
                  {d.dep_name}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_sub_dep" value={form.status_sub_dep} onChange={handleChange}>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>

          <div className="settings-form-actions">
            <button className="settings-btn-add" disabled={isEditMode || saving} onClick={handleAdd}>
              <i className="fa fa-plus" /> Adicionar
            </button>
            <button className="settings-btn-save" disabled={!isEditMode || saving} onClick={handleSave}>
              <i className="fa fa-save" /> Salvar
            </button>
            <button className="settings-btn-clear" onClick={clear}>
              <i className="fa fa-times" />
            </button>
          </div>
        </div>
      </div>

      <div className="settings-table-col">
        {tableList.length === 0 ? (
          <div className="settings-empty">
            <i className="fa fa-inbox" />
            <span>Nenhum subdepartamento cadastrado</span>
          </div>
        ) : (
          <CustomTable list={tableList} maxSelection={1} onConfirmList={onRowSelect} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações neste subdepartamento?"
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
