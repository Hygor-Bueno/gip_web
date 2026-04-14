import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postDepartament, putDepartament } from "../Adapters/SettingsAdapters";
import { Departament, Unit } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  departaments:    Departament[];
  units:           Unit[];
  setDepartaments: React.Dispatch<React.SetStateAction<Departament[]>>;
}

interface Form {
  dep_name:   string;
  status_dep: string;
  unit_id_fk: string;
}

const empty: Form = { dep_name: "", status_dep: "1", unit_id_fk: "" };

export default function DepartamentsTab({ departaments, units, setDepartaments }: Props) {
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
    setSelectedId(Number(r.dep_id?.value ?? 0));
    setForm({
      dep_name:   String(r.dep_name?.value   ?? ""),
      status_dep: String(r.status_dep?.value ?? "1"),
      unit_id_fk: String(r.unit_id_fk?.value ?? ""),
    });
  }

  async function handleAdd() {
    if (!form.dep_name.trim() || !form.unit_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e a unidade.", "danger");
      return;
    }
    setSaving(true);
    try {
      const unitName = units.find(u => u.unit_id === Number(form.unit_id_fk))?.unit_name ?? "";
      const payload = {
        dep_name:   form.dep_name.trim(),
        status_dep: Number(form.status_dep),
        unit_id_fk: Number(form.unit_id_fk),
        unit_name:  unitName,
      };
      const res = await postDepartament(payload);
      if (res?.error) throw new Error(res.message);
      setDepartaments(prev => [...prev, { ...payload, dep_id: Number(res.last_id) } as Departament]);
      handleNotification("Departamento adicionado", "Departamento criado com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.dep_name.trim() || !form.unit_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e a unidade.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const unitName = units.find(u => u.unit_id === Number(form.unit_id_fk))?.unit_name ?? "";
      const payload = {
        dep_id:     selectedId!,
        dep_name:   form.dep_name.trim(),
        status_dep: Number(form.status_dep),
        unit_id_fk: Number(form.unit_id_fk),
        unit_name:  unitName,
      };
      const res = await putDepartament(payload);
      if (res?.error) throw new Error(res.message);
      setDepartaments(prev =>
        prev.map(d => d.dep_id === selectedId ? { ...d, ...payload } : d)
      );
      handleNotification("Departamento atualizado", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(departaments, {
    ocultColumns: ["unit_id_fk", "unit_id", "comp_id_fk", "comp_id", "corporate_name", "status_comp", "address", "cnpj", "unit_number", "status_unit", "fantasy_name"],
    customTags: {
      dep_id:     "Código",
      dep_name:   "Departamento",
      unit_name:  "Unidade",
      status_dep: "Status",
    },
    customValue: {
      status_dep: v => Number(v) !== 0 ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-sitemap" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Departamento" : "Novo Departamento"}
            </p>
          </div>

          <div className="settings-field">
            <label>Nome do Departamento *</label>
            <input
              name="dep_name"
              value={form.dep_name}
              onChange={handleChange}
              placeholder="Ex: TI"
            />
          </div>

          <div className="settings-field">
            <label>Unidade *</label>
            <select name="unit_id_fk" value={form.unit_id_fk} onChange={handleChange}>
              <option value="">Selecione...</option>
              {units.map(u => (
                <option key={u.unit_id} value={u.unit_id}>
                  {u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_dep" value={form.status_dep} onChange={handleChange}>
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
            <span>Nenhum departamento cadastrado</span>
          </div>
        ) : (
          <CustomTable list={tableList} maxSelection={1} onConfirmList={onRowSelect} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações neste departamento?"
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
