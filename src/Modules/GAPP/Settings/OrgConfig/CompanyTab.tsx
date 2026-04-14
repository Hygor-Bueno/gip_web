import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postCompany, putCompany } from "../Adapters/SettingsAdapters";
import { Company } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  companies:    Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

interface Form {
  corporate_name: string;
  fantasy_name:   string;
  status_comp:    string;
}

const empty: Form = { corporate_name: "", fantasy_name: "", status_comp: "1" };

export default function CompanyTab({ companies, setCompanies }: Props) {
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
    setSelectedId(Number(r.comp_id?.value ?? 0));
    setForm({
      corporate_name: String(r.corporate_name?.value ?? ""),
      fantasy_name:   String(r.fantasy_name?.value   ?? ""),
      status_comp:    String(r.status_comp?.value     ?? "1"),
    });
  }

  async function handleAdd() {
    if (!form.corporate_name.trim()) {
      handleNotification("Campo obrigatório", "Informe a razão social.", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        corporate_name: form.corporate_name.trim(),
        fantasy_name:   form.fantasy_name.trim(),
        status_comp:    Number(form.status_comp),
      };
      const res = await postCompany(payload);
      if (res?.error) throw new Error(res.message);
      setCompanies(prev => [...prev, { ...payload, comp_id: Number(res.last_id) }]);
      handleNotification("Empresa adicionada", "Empresa criada com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.corporate_name.trim()) {
      handleNotification("Campo obrigatório", "Informe a razão social.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const payload = {
        comp_id:        selectedId!,
        corporate_name: form.corporate_name.trim(),
        fantasy_name:   form.fantasy_name.trim(),
        status_comp:    Number(form.status_comp),
      };
      const res = await putCompany(payload);
      if (res?.error) throw new Error(res.message);
      setCompanies(prev =>
        prev.map(c => c.comp_id === selectedId ? { ...c, ...payload } : c)
      );
      handleNotification("Empresa atualizada", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(companies, {
    customTags: {
      comp_id:        "Código",
      corporate_name: "Razão Social",
      fantasy_name:   "Nome Fantasia",
      status_comp:    "Status",
    },
    customValue: {
      status_comp: v => Number(v) !== 0 ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-building" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Empresa" : "Nova Empresa"}
            </p>
          </div>

          <div className="settings-field">
            <label>Razão Social *</label>
            <input
              name="corporate_name"
              value={form.corporate_name}
              onChange={handleChange}
              placeholder="Ex: Empresa Ltda"
            />
          </div>

          <div className="settings-field">
            <label>Nome Fantasia</label>
            <input
              name="fantasy_name"
              value={form.fantasy_name}
              onChange={handleChange}
              placeholder="Ex: Empresa SA"
            />
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_comp" value={form.status_comp} onChange={handleChange}>
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
            <span>Nenhuma empresa cadastrada</span>
          </div>
        ) : (
          <CustomTable list={tableList} maxSelection={1} onConfirmList={onRowSelect} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações nesta empresa?"
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
