import React from "react";
import { FuelData } from "../../Interfaces";
import { Schema } from "../../../../Interfaces/Interfaces";

export const formFuel = (
  values: FuelData,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  fuelTypes: Schema[] = [],
) => [
  { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Combustível', mandatory: true, captureValue: { type: 'select', name: 'fuel_type_id_fk', className: 'form-control', value: values.fuel_type_id_fk ?? '', onChange, required: true, options: fuelTypes } } },
  { attributes: { className: 'my-2 col-6 col-md-4' },  item: { label: 'Qtd. Litros', mandatory: true, captureValue: { type: 'number', name: 'liter_qtd',       className: 'form-control', value: values.liter_qtd       ?? '', onChange, required: true } } },
  { attributes: { className: 'my-2 col-6 col-md-4' },  item: { label: 'Km no dia',   mandatory: true, captureValue: { type: 'number', name: 'km_day',          className: 'form-control', value: values.km_day          ?? '', onChange, required: true } } },
];
