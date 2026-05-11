import React from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { IAddressForm } from "../types";

interface Props {
  addressForm: IAddressForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const AddressForm: React.FC<Props> = ({ addressForm, onChange }) => (
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
        { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Estabelecimento (nome)', captureValue: { type: 'text', name: 'name',       className: 'form-control', value: addressForm.name,       onChange, placeholder: 'Nome do local' } } },
        { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'CEP',                    captureValue: { type: 'text', name: 'zip_code',   className: 'form-control', value: addressForm.zip_code,   onChange, placeholder: '00000-000' } } },
        { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Estado (UF)',            captureValue: { type: 'text', name: 'state',      className: 'form-control', value: addressForm.state,      onChange, maxLength: 2, placeholder: 'UF' } } },
        { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Logradouro',             captureValue: { type: 'text', name: 'street',     className: 'form-control', value: addressForm.street,     onChange, placeholder: 'Rua / Avenida' } } },
        { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Número',                 captureValue: { type: 'text', name: 'number',     className: 'form-control', value: addressForm.number,     onChange, placeholder: 'Nº' } } },
        { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Bairro',                 captureValue: { type: 'text', name: 'district',   className: 'form-control', value: addressForm.district,   onChange, placeholder: 'Bairro' } } },
        { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Cidade',                 captureValue: { type: 'text', name: 'city',       className: 'form-control', value: addressForm.city,       onChange, placeholder: 'Cidade' } } },
        { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Complemento',            captureValue: { type: 'text', name: 'complement', className: 'form-control', value: addressForm.complement, onChange, placeholder: 'Complemento (opcional)' } } },
      ]}
    />
  </div>
);

export default AddressForm;
