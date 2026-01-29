import { ConfigFormActiveProps, Department, FormData, Unit } from "../Interfaces/Interfaces";

import React, { useState } from "react";

export function ConfigFormActive({ initialData, data }: ConfigFormActiveProps) {
  const [formData, setFormData] = useState<FormData>({
    is_vehicle: false,
    ...initialData,
  });

  const formConfiguration: any[] = [
    { label: "Marca", name: "brand", col: "col-md-6" },
    { label: "Modelo", name: "model", col: "col-md-6" },
    { label: "Número NF", name: "number_nf", col: "col-md-4" },
    { label: "Preço", name: "value_purchase", col: "col-md-4" },
    { label: "Data de aquisição", name: "date_purchase", type: "date", col: "col-md-4" },
    {
      label: "Companhia",
      name: "company_number",
      type: "select",
      col: "col-md-4",
      options: [{ id: "0", name: "(Peg Pese) Unidade" }],
      optionValue: "id",
      optionLabel: "name"
    },
    {
      label: "Unidade",
      name: "unit",
      type: "select",
      col: "col-md-4",
      options: [{ id: "0", name: "(Peg Pese) Unidade" }],
      optionValue: "id",
      optionLabel: "name"
    },
    {
      label: "Comprado por:",
      name: "unit_number",
      type: "select",
      col: "col-md-4",
      options: data.units,
      optionValue: "unit_number",
      optionLabel: (u: Unit) => `${u.unit_number} - ${u.unit_name}`
    },
    {
      label: "Disponibilizado para:",
      name: "dep_id",
      type: "select",
      col: "col-md-4",
      options: data.departments,
      optionValue: "dep_id",
      optionLabel: (d: Department) => `${d.fantasy_name} > ${d.unit_name} > ${d.dep_name}`
    },
    {
      label: "Status do ativo:",
      name: "status_active",
      type: "select",
      col: "col-md-4",
      options: [
        { id: "0", name: "Inativo" },
        { id: "1", name: "Ativo" }
      ],
      optionValue: "id",
      optionLabel: "name"
    },
    { label: "Classe do ativo:", name: "class_id", type: "select", col: "col-md-4", options: [] },
    {
      label: "",
      name: "is_vehicle",
      type: "custom",
      col: "col-md-4 d-flex align-items-center",
      renderCustom: () => (
        <button
          className={`border p-2 mt-4 rounded ${formData.is_vehicle ? 'bg-primary' : 'bg-light'}`}
          onClick={(e) => {
            e.preventDefault();
            setFormData(prev => ({ ...prev, is_vehicle: !prev.is_vehicle }));
          }}
        >
          <i className={`fa-solid fa-car ${formData.is_vehicle ? 'text-white' : 'text-dark'}`}></i>
        </button>
      )
    }
  ];

  return formConfiguration;
}
