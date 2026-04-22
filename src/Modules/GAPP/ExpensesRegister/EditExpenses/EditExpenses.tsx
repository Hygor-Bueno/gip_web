import React, { useState } from "react";
import { useConnection } from "../../../../Context/ConnContext";
import { useMyContext } from "../../../../Context/MainContext";
import { IExpensesItem } from "../Interfaces/InterfaceExpensesRegister";
import ConfirmModal from "../../../../Components/CustomConfirm";

interface IEditExpenses {
  item: IExpensesItem;
  units: { label: string; value: string }[];
  expensesType: { label: string; value: string }[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (id: number) => void;
}

interface IForm {
  date: string;
  hour: string;
  description: string;
  total_value: string;
  discount: string;
  exp_type_id_fk: string;
  unit_id: string;
}

function EditExpenses({ item, units, expensesType, onClose, onSaved, onDeleted }: IEditExpenses): JSX.Element {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const [form, setForm] = useState<IForm>({
    date:           item.date.slice(0, 10),
    hour:           item.hour.slice(0, 5),
    description:    item.description,
    total_value:    item.total_value,
    discount:       item.discount,
    exp_type_id_fk: item.exp_type_id_fk,
    unit_id:        item.unit_id,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      const req = await fetchData({
        method: "PUT",
        params: { ...form, expen_id: item.expen_id },
        pathFile: "GAPP/ExpensesRegister.php",
        urlComplement: "",
      });
      if (req.error) throw new Error(req.message);
      onSaved();
    } catch (error) {
      throw new Error("Erro ao salvar despesa: " + error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const req = await fetchData({
        method: "PUT",
        params: { expen_id: item.expen_id, status_expen: "0" },
        pathFile: "GAPP/ExpensesRegister.php",
        urlComplement: "",
      });
      if (req.error) throw new Error(req.message);
      setConfirmDelete(false);
      onDeleted(item.expen_id);
    } catch (error) {
      throw new Error("Erro ao excluir despesa: " + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="expenses-modal-overlay" onClick={onClose}>
      <div className="expenses-modal expenses-modal--edit" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="expenses-modal-header">
          <div className="expenses-modal-icon">
            <i className="fa fa-file-invoice-dollar text-white" />
          </div>
          <p className="expenses-modal-title">
            Editar Despesa
            <span className="expenses-modal-id-badge">#{item.expen_id}</span>
          </p>
          <button className="expenses-modal-close" onClick={onClose} title="Fechar">
            <i className="fa fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="expenses-modal-body expenses-modal-form">

          <div className="expenses-form-row">
            <div className="expenses-field">
              <label className="expenses-label">Data</label>
              <input className="expenses-input" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="expenses-field">
              <label className="expenses-label">Hora</label>
              <input className="expenses-input" type="time" name="hour" value={form.hour} onChange={handleChange} />
            </div>
          </div>

          <div className="expenses-field">
            <label className="expenses-label">Descrição</label>
            <textarea
              className="expenses-input expenses-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="expenses-form-row">
            <div className="expenses-field">
              <label className="expenses-label">Valor Total</label>
              <input className="expenses-input" type="number" name="total_value" value={form.total_value} onChange={handleChange} step="0.01" min="0" />
            </div>
            <div className="expenses-field">
              <label className="expenses-label">Desconto</label>
              <input className="expenses-input" type="number" name="discount" value={form.discount} onChange={handleChange} step="0.01" min="0" />
            </div>
          </div>

          <div className="expenses-field">
            <label className="expenses-label">Unidade</label>
            <div className="expenses-select-wrap">
              <select className="expenses-select" name="unit_id" value={form.unit_id} onChange={handleChange}>
                <option value="">Selecione</option>
                {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="expenses-field">
            <label className="expenses-label">Tipo de Despesa</label>
            <div className="expenses-select-wrap">
              <select className="expenses-select" name="exp_type_id_fk" value={form.exp_type_id_fk} onChange={handleChange}>
                <option value="">Selecione</option>
                {expensesType.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="expenses-modal-footer">
          <button className="expenses-btn-delete" type="button" onClick={() => setConfirmDelete(true)}>
            <i className="fa fa-trash" /> Excluir
          </button>
          <div className="expenses-modal-spacer" />
          <button className="expenses-modal-btn-close" type="button" onClick={onClose}>Cancelar</button>
          <button className="expenses-btn-search" type="button" onClick={handleSave}>
            <i className="fa fa-floppy-disk" /> Salvar
          </button>
        </div>

      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir despesa"
          message={`Deseja realmente excluir a despesa #${item.expen_id}? Esta ação não poderá ser desfeita.`}
          confirmLabel="Sim, excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default EditExpenses;
