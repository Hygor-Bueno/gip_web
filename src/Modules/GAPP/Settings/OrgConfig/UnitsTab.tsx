import React, { useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { convertForTable } from "../../../../Util/Utils";
import { handleNotification } from "../../../../Util/ui/notifications";
import { postUnit, putUnit } from "../Adapters/SettingsAdapters";
import { Company, Unit } from "../Interfaces/SettingsInterfaces";
import { tItemTable } from "../../../../types/types";

interface Props {
  units:       Unit[];
  companies:   Company[];
  setUnits:    React.Dispatch<React.SetStateAction<Unit[]>>;
}

interface Form {
  unit_name:   string;
  unit_number: string;
  cnpj:        string;
  comp_id_fk:  string;
  status_unit: string;
}

const empty: Form = { unit_name: "", unit_number: "", cnpj: "", comp_id_fk: "", status_unit: "1" };

export default function UnitsTab({ units, companies, setUnits }: Props) {
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
    setSelectedId(Number(r.unit_id?.value ?? 0));
    setForm({
      unit_name:   String(r.unit_name?.value   ?? ""),
      unit_number: String(r.unit_number?.value ?? ""),
      cnpj:        String(r.cnpj?.value        ?? ""),
      comp_id_fk:  String(r.comp_id_fk?.value  ?? ""),
      status_unit: String(r.status_unit?.value  ?? "1"),
    });
  }

  async function handleAdd() {
    if (!form.unit_name.trim() || !form.comp_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e a empresa.", "danger");
      return;
    }
    setSaving(true);
    try {
      const companyName = companies.find(c => c.comp_id === Number(form.comp_id_fk))?.fantasy_name ?? "";
      const payload = {
        unit_name:    form.unit_name.trim(),
        unit_number:  Number(form.unit_number),
        cnpj:         form.cnpj.trim(),
        comp_id_fk:   Number(form.comp_id_fk),
        status_unit:  Number(form.status_unit),
        fantasy_name: companyName,
      };
      const res = await postUnit(payload);
      if (res?.error) throw new Error(res.message);
      setUnits(prev => [...prev, { ...payload, unit_id: Number(res.last_id) } as Unit]);
      handleNotification("Unidade adicionada", "Unidade criada com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.unit_name.trim() || !form.comp_id_fk) {
      handleNotification("Campos obrigatórios", "Informe o nome e a empresa.", "danger");
      return;
    }
    setConfirmOpen(true);
  }

  async function executeUpdate() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const companyName = companies.find(c => c.comp_id === Number(form.comp_id_fk))?.fantasy_name ?? "";
      const payload = {
        unit_id:      selectedId!,
        unit_name:    form.unit_name.trim(),
        unit_number:  Number(form.unit_number),
        cnpj:         form.cnpj.trim(),
        comp_id_fk:   Number(form.comp_id_fk),
        status_unit:  Number(form.status_unit),
        fantasy_name: companyName,
      };
      const res = await putUnit(payload);
      if (res?.error) throw new Error(res.message);
      setUnits(prev =>
        prev.map(u => u.unit_id === selectedId ? { ...u, ...payload } : u)
      );
      handleNotification("Unidade atualizada", "Alterações salvas com sucesso.", "success");
      clear();
    } catch (e: any) {
      handleNotification("Erro", e.message ?? "Tente novamente.", "danger");
    } finally {
      setSaving(false);
    }
  }

  const tableList = convertForTable(units, {
    ocultColumns: ["comp_id_fk", "comp_id", "corporate_name", "status_comp", "address"],
    customTags: {
      unit_id:      "Código",
      unit_name:    "Nome",
      unit_number:  "Número",
      cnpj:         "CNPJ",
      fantasy_name: "Empresa",
      status_unit:  "Status",
    },
    customValue: {
      status_unit: v => Number(v) !== 0 ? "Ativo" : "Inativo",
    },
  });

  return (
    <div className="settings-split">
      <div className="settings-form-col">
        <div className="settings-form-card">
          <div className="settings-form-card-header">
            <div className="settings-form-card-header-icon"><i className="fa fa-map-marker" /></div>
            <p className="settings-form-card-title">
              {isEditMode ? "Editar Unidade" : "Nova Unidade"}
            </p>
          </div>

          <div className="settings-field">
            <label>Nome da Unidade *</label>
            <input
              name="unit_name"
              value={form.unit_name}
              onChange={handleChange}
              placeholder="Ex: Filial Centro"
            />
          </div>

          <div className="settings-field">
            <label>Número</label>
            <input
              type="number"
              name="unit_number"
              value={form.unit_number}
              onChange={handleChange}
              placeholder="Ex: 1"
            />
          </div>

          <div className="settings-field">
            <label>CNPJ</label>
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="settings-field">
            <label>Empresa *</label>
            <select name="comp_id_fk" value={form.comp_id_fk} onChange={handleChange}>
              <option value="">Selecione...</option>
              {companies.map(c => (
                <option key={c.comp_id} value={c.comp_id}>
                  {c.fantasy_name || c.corporate_name}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label>Status</label>
            <select name="status_unit" value={form.status_unit} onChange={handleChange}>
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
            <span>Nenhuma unidade cadastrada</span>
          </div>
        ) : (
          <CustomTable list={tableList} maxSelection={1} onConfirmList={onRowSelect} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Confirmar alteração"
          message="Deseja salvar as alterações nesta unidade?"
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
