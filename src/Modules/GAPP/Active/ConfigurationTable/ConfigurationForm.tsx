import { ConfigFormActiveProps, Department, FormData, Unit } from "../Interfaces/Interfaces";

import React, { useState } from "react";

export function ConfigFormActive({ initialData, data }: ConfigFormActiveProps) {
  const makeSelect = (label: string, name: string, col = "col-md-4", options: any[], valueKey = "id", labelKey: any = "name") => ({ label, name, type: "select", col, options, optionValue: valueKey, optionLabel: labelKey});
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
    makeSelect("Disponibilizado para:","dep_id","col-md-4",data.departments,"dep_id",(d: Department) => `${d.fantasy_name} > ${d.unit_name} > ${d.dep_name}`),
    makeSelect("Companhia", "company_number", "col-md-4", [{ id: "0", name: "(Peg Pese) Unidade" }]),
    makeSelect("Unidade", "unit", "col-md-4", [{ id: "0", name: "(Peg Pese) Unidade" }]),
    makeSelect("Comprado por:", "unit_number", "col-md-4", data.units, "unit_number", (u: Unit) => `${u.unit_number} - ${u.unit_name}`),
    makeSelect("Status do ativo:","status_active","col-md-4", [ { id: "0", name: "Inativo" }, { id: "1", name: "Ativo" } ]),
    makeSelect("Classe do ativo:", "class_id", "col-md-4", []),
    { label: "", name: "is_vehicle", type: "custom", col: "col-md-4 d-flex align-items-center w-100 justify-content-end",
      renderCustom: () => (
        <button className={`border p-2 mt-4 rounded ${formData.is_vehicle ? "btn-color-gipp" : "bg-light"}`} onClick={(e) => {
            e.preventDefault();
            setFormData((prev) => ({ ...prev, is_vehicle: !prev.is_vehicle })); }} 
            style={{width: '50px'}}>
              <i className={`fa-solid fa-car ${formData.is_vehicle ? "text-white" : "text-dark"}`}></i>
        </button>
      )
    }
  ];
  return formConfiguration;
}

export function ConfigFormVehicle() {
  const formConfiguration: any[] = [
    { label: "placa", name: "license_plates", col: "col-md-6" },
    { label: "Ano", name: "year", col: "col-md-6" },
    { label: "Chassi", name: "chassi", col: "col-md-4" },
    { label: "Cor", name: "color", col: "col-md-4" },
    { label: "Renavam", name: "renavam", type: "text", col: "col-md-4" },
    { label: "CC", name: "cylinder", type: "text", col: "col-md-4" },
    { label: "Capacidade", name: "capacity", type: "text", col: "col-md-4" },
    { label: "Fipe", name: "fipe", type: "text", col: "col-md-4" },
    { label: "Utima revisão KM", name: "last_revision_km", type: "number", col: "col-md-4" },
    { label: "Próxima revisão KM", name: "next_revision_km", type: "number", col: "col-md-4"},
    { label: "Ultima revisão", name: "last_revision_date", type: "date", col: "col-md-4" },
    { label: "Próxima revisão", name: "next_revision_date", type: "date", col: "col-md-4" }
  ];

  return formConfiguration;
}
export function ConfigFormAddress() {}
export function ConfigFormInsurence() {}
export function ConfigFormFranchise() {}