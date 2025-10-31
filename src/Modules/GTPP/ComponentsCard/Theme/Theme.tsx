import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { tItemTable } from "../../../../types/types";
import CustomTable from "../../../../Components/CustomTable";
import CustomForm from "../../../../Components/CustomForm";

function Theme() {
  const [theme, setTheme] = useState<tItemTable[]>([]);
  const [themeName, setThemeName] = useState("");

  const handleAddTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) return;
    const newTheme: tItemTable = {
      id: { value: Date.now().toString(), tag: "ID" },
      name: { value: themeName, tag: "Nome" },
    };
    setTheme((prev) => [...prev, newTheme]);
    setThemeName("");
  };

  const handleConfirmList = (selected: tItemTable[]) => {
    alert(`Temas selecionados:\n${selected.map((i) => i.name.value).join(", ")}`);
  };

  const fieldsets = [{
    legend: { text: "Novo Tema", style: "fw-bold text-primary" },
    item: {
      label: "Nome do tema",
      mandatory: true,
      captureValue: {
        id: "themeDescription",
        type: "text",
        className: "form-control",
        placeholder: "Ex: Eletrônicos",
        value: themeName,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setThemeName(e.target.value),
      },
    },
   }];

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Cadastro de Temas</h2>

      {/* Formulário com CustomForm */}
      <div className="card p-4 shadow-sm mb-4">
        <CustomForm
          fieldsets={fieldsets}
          onChange={handleAddTheme}
          titleButton="Adicionar tema"
          classButton="btn btn-primary w-100"
        />
      </div>

      {/* Tabela */}
      {theme.length > 0 ? (
        <CustomTable
          list={theme}
          onConfirmList={handleConfirmList}
          selectionKey="id"
          hiddenButton={false}
        />
      ) : (
        <div className="alert alert-info text-center">Nenhum tema foi cadastrado.</div>
      )}
    </div>
  );
}

export default Theme;
