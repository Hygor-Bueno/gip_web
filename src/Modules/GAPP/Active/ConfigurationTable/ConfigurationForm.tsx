import React, { useState } from "react";
import {
  ActiveType,
  Company,
  ConfigFormActiveProps,
  Department,
  Unit
} from "../Interfaces/Interfaces";

type FieldConfig = {
  label: string;
  name: string;
  col?: string;
  type?: "text" | "number" | "date" | "select" | "custom";
  options?: any[];
  optionValue?: string;
  optionLabel?: string | ((item: any) => string);
  renderCustom?: () => React.ReactNode;
};

function makeSelect(
  label: string,
  name: string,
  col: string = "col-md-4",
  options: any[],
  valueKey: string = "id",
  labelKey: string | ((item: any) => string) = "name"
): FieldConfig {
  return {
    label,
    name,
    type: "select",
    col,
    options,
    optionValue: valueKey,
    optionLabel: labelKey
  };
}

export function ConfigFormActive({ initialData, data }: ConfigFormActiveProps) {
  const [formData, setFormData] = useState<any>({
    is_vehicle: false,
    ...initialData
  });

  const formConfiguration: FieldConfig[] = [
    { label: "Marca", name: "brand", col: "col-md-6" },
    { label: "Modelo", name: "model", col: "col-md-6" },
    { label: "Número NF", name: "number_nf", col: "col-md-4" },
    { label: "Preço", name: "value_purchase", col: "col-md-4" },
    { label: "Data de aquisição", name: "date_purchase", type: "date", col: "col-md-4" },
    
    makeSelect("Companhia", "company_number", "col-md-4", data.company, "comp_id", (c: Company) => `${c.comp_id} - ${c.corporate_name}`),
    makeSelect("Unidade", "unit", "col-md-4", data.units, "unit_id", (u: Unit) => `${u.unit_name}`),
    makeSelect("Comprado por:","unit_number","col-md-4",data.units,"unit_number",(u: Unit) => `${u.unit_name}`),
    makeSelect("Status do ativo:","status_active","col-md-4",[{ id: "0", name: "Inativo" },{ id: "1", name: "Ativo" }]),
    makeSelect("Disponibilizado para:", "dep_id", "col-md-4", data.departments, "dep_id", (d: Department) =>`${d.fantasy_name} > ${d.unit_name} > ${d.dep_name}`),
    makeSelect("Classe do ativo:", "id_active_class_fk", "col-md-4", data.activeType, "active_type_id", (at: ActiveType) => `${at.desc_active_type}`),

    {
      label: "",
      name: "is_vehicle",
      type: "custom",
      col: "col-md-4 d-flex align-items-center w-100 justify-content-end",
      renderCustom: () => (
        <button
          className={`border p-2 mt-4 rounded ${
            formData.is_vehicle ? "btn-color-gipp" : "bg-light"
          }`}
          onClick={e => {
            e.preventDefault();
            setFormData((prev: any) => ({
              ...prev,
              is_vehicle: !prev.is_vehicle
            }));
          }}
          style={{ width: "50px" }}
        >
          <i
            className={`fa-solid fa-car ${
              formData.is_vehicle ? "text-white" : "text-dark"
            }`}
          ></i>
        </button>
      )
    }
  ];

  return formConfiguration;
}

export function ConfigFormVehicle() {
  const formConfiguration: FieldConfig[] = [
    { label: "placa", name: "license_plates", col: "col-md-6" },
    { label: "Ano", name: "year", col: "col-md-6" },
    { label: "Chassi", name: "chassi", col: "col-md-4" },
    { label: "Cor", name: "color", col: "col-md-4" },
    { label: "Renavam", name: "renavam", type: "text", col: "col-md-4" },
    { label: "CC", name: "cylinder", type: "text", col: "col-md-4" },
    { label: "Capacidade", name: "capacity", type: "text", col: "col-md-4" },
    { label: "Fipe", name: "fipe", type: "text", col: "col-md-4" },
    { label: "Utima revisão KM", name: "last_revision_km", type: "number", col: "col-md-4" },
    { label: "Próxima revisão KM", name: "next_revision_km", type: "number", col: "col-md-4" },
    { label: "Ultima revisão", name: "last_revision_date", type: "date", col: "col-md-4" },
    { label: "Próxima revisão", name: "next_revision_date", type: "date", col: "col-md-4" }
  ];

  return formConfiguration;
}

export function ConfigFormAddress() {}
export function ConfigFormInsurence() {}
export function ConfigFormFranchise() {}
