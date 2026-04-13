import React from "react";
import { MaintenanceData } from "../../Interfaces";

export const formMaintenance = (
  values: MaintenanceData,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
) => [
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Técnico / Responsável',  captureValue: { type: 'text',   name: 'technician',    className: 'form-control', value: values.technician    ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Mão de obra (R$)',        captureValue: { type: 'number', name: 'service_value', className: 'form-control', value: values.service_value ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Km atual', mandatory: true, captureValue: { type: 'number', name: 'km_day',       className: 'form-control', value: values.km_day        ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Km próxima revisão',      captureValue: { type: 'number', name: 'km_next',       className: 'form-control', value: values.km_next        ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Próxima revisão',         captureValue: { type: 'date',   name: 'date_next',     className: 'form-control', value: values.date_next      ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Garantia',                captureValue: { type: 'select', name: 'warranty',      className: 'form-control', value: String(values.warranty ?? 0), onChange, options: [{ label: 'Sim', value: '1' }, { label: 'Não', value: '0' }] } } },
  { attributes: { className: 'my-2 col-6  col-md-2' }, item: { label: 'Prazo da garantia',       captureValue: { type: 'date',   name: 'validity',      className: 'form-control', value: values.validity       ?? '', onChange } } },
];
