import React from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { Expense } from "../../../Active/Component/Releases/Interfaces";
import { Schema } from "../../../Active/Interfaces/Interfaces";

interface Props {
  expense: Expense;
  unitId: string;
  setUnitId: (v: string) => void;
  stores: { label: string; value: string }[];
  units: { label: string; value: string }[];
  drivers: Schema[];
  addressActive: boolean;
  onToggleAddress: () => void;
  onExpenseChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ExpenseSummary: React.FC<Props> = ({
  expense, unitId, setUnitId, stores, units, drivers,
  addressActive, onToggleAddress, onExpenseChange,
}) => (
  <div className="rel-section">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.65rem", borderBottom: "1.5px solid #f1f3f8" }}>
      <p className="rel-section-title" style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>
        <i className="fa fa-money"></i> Resumo da Despesa
      </p>
      <button
        type="button"
        onClick={onToggleAddress}
        className={addressActive ? "btn-rel-clear" : "btn-rel-save"}
        style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}
        title={addressActive ? "Desativar endereço específico" : "Ativar formulário de endereço para um local específico"}
      >
        <i className={`fa ${addressActive ? "fa-times" : "fa-map-marker"}`}></i>{" "}
        {addressActive ? "Desativar endereço" : "Ativar endereço específico"}
      </button>
    </div>
    <CustomForm
      notButton={false}
      className="row g-3"
      fieldsets={[
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Data',            mandatory: true, captureValue: { type: 'date',     name: 'date',          className: 'form-control', value: expense.date,          onChange: onExpenseChange, required: true } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Hora',            mandatory: true, captureValue: { type: 'time',     name: 'hour',          className: 'form-control', value: expense.hour,          onChange: onExpenseChange, required: true } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor Total',     mandatory: true, captureValue: { type: 'number',   name: 'total_value',   className: 'form-control', value: expense.total_value,   onChange: onExpenseChange, required: true } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Nº Cupom',                         captureValue: { type: 'text',     name: 'coupon_number', className: 'form-control', value: expense.coupon_number, onChange: onExpenseChange } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Desconto',                         captureValue: { type: 'number',   name: 'discount',      className: 'form-control', value: expense.discount,      onChange: onExpenseChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Estabelecimento', mandatory: true, captureValue: { type: 'select',   name: 'store_id_fk',   className: 'form-control', value: expense.store_id_fk,   onChange: onExpenseChange, options: stores } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Unidade',         mandatory: true, captureValue: { type: 'select',   name: 'unit_id',       className: 'form-control', value: unitId,                onChange: (e: any) => setUnitId(e.target.value), options: units } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Motorista',                        captureValue: { type: 'select',   name: 'driver_id_fk',  className: 'form-control', value: expense.driver_id_fk,  onChange: onExpenseChange, options: drivers } } },
        { attributes: { className: 'my-2 col-12' },         item: { label: 'Descrição',                        captureValue: { type: 'textarea', name: 'description',   className: 'form-control', value: expense.description,   onChange: onExpenseChange, rows: 2 } } },
      ]}
    />
  </div>
);

export default ExpenseSummary;
