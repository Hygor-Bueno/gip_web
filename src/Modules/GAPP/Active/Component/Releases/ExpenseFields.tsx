import React from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { Expense } from "./Interfaces";
import { Schema } from "../../Interfaces/Interfaces";

export interface AddressForm {
  name: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  number: string;
  complement: string;
}

interface Props {
  expense: Expense;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  drivers: Schema[];
  stores: Schema[];
  addressActive: boolean;
  onToggleAddress: () => void;
  addressForm: AddressForm;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ExpenseFields: React.FC<Props> = ({
  expense, onChange, drivers, stores,
  addressActive, onToggleAddress, addressForm, onAddressChange,
}) => (
  <>
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
          { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Data',            mandatory: true, captureValue: { type: 'date',     name: 'date',          className: 'form-control', value: expense.date          ?? '', onChange, required: true } } },
          { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Hora',            mandatory: true, captureValue: { type: 'time',     name: 'hour',          className: 'form-control', value: expense.hour          ?? '', onChange, required: true } } },
          { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor Total',     mandatory: true, captureValue: { type: 'number',   name: 'total_value',   className: 'form-control', value: expense.total_value   ?? '', onChange, required: true } } },
          { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Nº Cupom',                         captureValue: { type: 'text',     name: 'coupon_number', className: 'form-control', value: expense.coupon_number ?? '', onChange } } },
          { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Desconto',                         captureValue: { type: 'number',   name: 'discount',      className: 'form-control', value: expense.discount      ?? '', onChange } } },
          { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Estabelecimento', mandatory: true, captureValue: { type: 'select',   name: 'store_id_fk',   className: 'form-control', value: expense.store_id_fk   ?? '', onChange, required: true, options: stores } } },
          { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Motorista',       mandatory: true, captureValue: { type: 'select',   name: 'driver_id_fk',  className: 'form-control', value: expense.driver_id_fk  ?? '', onChange, required: true, options: drivers } } },
          { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Descrição',                       captureValue: { type: 'textarea', name: 'description',   className: 'form-control', value: expense.description   ?? '', onChange, rows: 2 } } },
        ]}
      />
    </div>

    {addressActive && (
      <div className="rel-section">
        <p className="rel-section-title">
          <i className="fa fa-map-marker"></i> Endereço específico do local
        </p>
        <small style={{ color: "#64748b", display: "block", marginTop: "-0.5rem", marginBottom: "1rem" }}>
          Preenchido com os dados da loja selecionada — edite se o local for diferente do cadastro.
        </small>
        <CustomForm
          notButton={false}
          className="row g-3"
          fieldsets={[
            { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Estabelecimento (nome)', captureValue: { type: 'text', name: 'name',       className: 'form-control', value: addressForm.name,       onChange: onAddressChange, placeholder: 'Nome do local' } } },
            { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'CEP',                    captureValue: { type: 'text', name: 'zip_code',   className: 'form-control', value: addressForm.zip_code,   onChange: onAddressChange, placeholder: '00000-000' } } },
            { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Estado (UF)',            captureValue: { type: 'text', name: 'state',      className: 'form-control', value: addressForm.state,      onChange: onAddressChange, maxLength: 2, placeholder: 'UF' } } },
            { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Logradouro',             captureValue: { type: 'text', name: 'street',     className: 'form-control', value: addressForm.street,     onChange: onAddressChange, placeholder: 'Rua / Avenida' } } },
            { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Número',                 captureValue: { type: 'text', name: 'number',     className: 'form-control', value: addressForm.number,     onChange: onAddressChange, placeholder: 'Nº' } } },
            { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Bairro',                 captureValue: { type: 'text', name: 'district',   className: 'form-control', value: addressForm.district,   onChange: onAddressChange, placeholder: 'Bairro' } } },
            { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Cidade',                 captureValue: { type: 'text', name: 'city',       className: 'form-control', value: addressForm.city,       onChange: onAddressChange, placeholder: 'Cidade' } } },
            { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Complemento',            captureValue: { type: 'text', name: 'complement', className: 'form-control', value: addressForm.complement, onChange: onAddressChange, placeholder: 'Complemento (opcional)' } } },
          ]}
        />
      </div>
    )}
  </>
);

export default ExpenseFields;
