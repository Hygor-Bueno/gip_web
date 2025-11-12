import React, { useState } from "react";
import {z} from "zod";

import './style.css';
import { useConnection } from "../../../../Context/ConnContext";
import { handleNotification } from "../../../../Util/Util";

interface ThemeProps {
  title: string;
  btnClose: any;
  btnSave: any;
  selectedTasks: any;
}

const themeSchema = z.object({
  themeName: z
    .string()
    .min(3, "O nome do tema precisa ter pelo menos 3 caracteres")
    .max(50, "O nome do tema não pode ter mais de 50 caracteres")
    .regex(/^[a-zA-Z0-9\s]+$/, "O nome do tema só pode conter letras, números e espaços"),
});

function ModalTheme({ title, btnClose, btnSave, selectedTasks }: ThemeProps) {
  const [themeName, setThemeName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { fetchData } = useConnection();

  const handleSave = async () => {
    try {
      const validatedData = themeSchema.parse({ themeName });
      btnSave(validatedData);
      const promises = selectedTasks.map((selectedTasks:any) => 
        fetchData({
          method: 'POST',
          params: {
            description_theme: themeName,
            task_id_fk: String(selectedTasks)
          },
          pathFile: 'GTPP/Theme.php',
          urlComplement: ''
        })
      );
      const responses = await Promise.all(promises);
      const hasError = responses.some(response => response.error);
      if (!hasError) {
        handleNotification("Sucesso!", "Tudo certo!", "success");
      } else {
        handleNotification("Erro", "Ocorreu um erro ao salvar o tema", "danger");
      }

      setError(null);
    } catch (err: any) {
      const messages = err?.errors?.message || ["Erro ao salvar o tema"];
      setError(messages.join(", "));
    }
  };


  return (
    <div className="modal position-absolute zIndex99">
      <div className="modal-dialog w-100">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button 
              onClick={btnClose} 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <label className="w-100">
              Nome do tema:
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className={`form-control ${error ? 'border-danger' : ''}`}
              />
            </label>
            {error && <small className="text-danger">{error}</small>}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal" 
              onClick={btnClose}
            >
              Fechar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalTheme;
