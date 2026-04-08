import React from "react";
import { Expense } from "../../Interfaces";
import { Schema } from "../../../../Interfaces/Interfaces";

export const formExpense = (
  values: Expense,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  drivers: Schema[] = [],
) => [
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Data',         mandatory: true, captureValue: { type: 'date',     name: 'date',          className: 'form-control', value: values.date          ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Hora',         mandatory: true, captureValue: { type: 'time',     name: 'hour',          className: 'form-control', value: values.hour          ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor Total',  mandatory: true, captureValue: { type: 'number',   name: 'total_value',   className: 'form-control', value: values.total_value   ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Nº Cupom',                     captureValue: { type: 'text',     name: 'coupon_number', className: 'form-control', value: values.coupon_number ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Desconto',                     captureValue: { type: 'number',   name: 'discount',      className: 'form-control', value: values.discount      ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Motorista',    mandatory: true, captureValue: { type: 'select',   name: 'driver_id_fk',  className: 'form-control', value: values.driver_id_fk  ?? '', onChange, required: true, options: drivers } } },
  { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Descrição',                   captureValue: { type: 'textarea', name: 'description',   className: 'form-control', value: values.description   ?? '', onChange, rows: 2 } } },
];
