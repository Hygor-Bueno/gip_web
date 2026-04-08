import React from "react";
import { SinisterData } from "../../Interfaces";

const VICTIM_OPTIONS    = [{ label: 'Sim', value: '1' }, { label: 'Não', value: '0' }];
const DAMAGE_OPTIONS    = [
  { label: 'Roubo e furto',          value: '1' },
  { label: 'Acidentes de trânsito',  value: '2' },
  { label: 'Danos a terceiros',      value: '3' },
  { label: 'Causas naturais',        value: '4' },
];

export const formSinister = (
  values: SinisterData,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
) => [
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Culpado',              mandatory: true, captureValue: { type: 'text',     name: 'guilty',              className: 'form-control', value: values.guilty              ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Nº do B.O',                             captureValue: { type: 'text',     name: 'bo_number',           className: 'form-control', value: values.bo_number           ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Solicitação B.O',                       captureValue: { type: 'date',     name: 'bo_receipt_date',     className: 'form-control', value: values.bo_receipt_date     ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Envio do B.O',                          captureValue: { type: 'date',     name: 'bo_shipping_date',    className: 'form-control', value: values.bo_shipping_date    ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Finalizado em',                         captureValue: { type: 'date',     name: 'finished',            className: 'form-control', value: values.finished            ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Vítimas',              mandatory: true, captureValue: { type: 'select',   name: 'victim',              className: 'form-control', value: values.victim              ?? '', onChange, required: true, options: VICTIM_OPTIONS } } },
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Tipo de Dano',         mandatory: true, captureValue: { type: 'select',   name: 'damage_type_id_fk',  className: 'form-control', value: values.damage_type_id_fk  ?? '', onChange, required: true, options: DAMAGE_OPTIONS } } },
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Observação',           mandatory: true, captureValue: { type: 'textarea', name: 'observation',         className: 'form-control', value: values.observation         ?? '', onChange, required: true, rows: 3 } } },
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Outros documentos',                     captureValue: { type: 'textarea', name: 'others_documents',    className: 'form-control', value: values.others_documents    ?? '', onChange, rows: 3 } } },
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Dados de terceiros',                    captureValue: { type: 'textarea', name: 'data_third',          className: 'form-control', value: values.data_third          ?? '', onChange, rows: 3 } } },
];
