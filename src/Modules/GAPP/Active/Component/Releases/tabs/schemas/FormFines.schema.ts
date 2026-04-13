import React from "react";
import { FinesData } from "../../Interfaces";

const GRAVITY_OPTIONS = [
  { label: 'Leve',       value: 'leve'       },
  { label: 'Média',      value: 'media'      },
  { label: 'Grave',      value: 'grave'      },
  { label: 'Gravíssima', value: 'gravissima' },
  { label: 'Outro',      value: 'outro'      },
];

export const formFines = (
  values: FinesData,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
) => [
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Pontuação',           mandatory: true, captureValue: { type: 'number', name: 'points',                className: 'form-control', value: values.points                ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Identificar condutor', mandatory: true, captureValue: { type: 'date',   name: 'offending_driver_date', className: 'form-control', value: values.offending_driver_date ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Descrição da infração', mandatory: true, captureValue: { type: 'text', name: 'infraction',            className: 'form-control', value: values.infraction            ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Art. do CTB',                          captureValue: { type: 'text',   name: 'article_ctb',           className: 'form-control', value: values.article_ctb           ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Nº AIT',                               captureValue: { type: 'text',   name: 'ait',                   className: 'form-control', value: values.ait                   ?? '', onChange } } },
  { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Classificação',        mandatory: true, captureValue: { type: 'select', name: 'gravity',               className: 'form-control', value: values.gravity               ?? '', onChange, required: true, options: GRAVITY_OPTIONS } } },
];
