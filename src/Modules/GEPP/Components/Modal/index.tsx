import React, { useState } from "react";
require("./ObservationModal.css");

interface IObservationModal {
  onClose?: () => void;
  onSave?: (text: string) => void;
}

const ObservationModal: React.FC<IObservationModal> = ({ onClose, onSave }) => {
  const [observation, setObservation] = useState("");

  const handleSave = () => {
    console.log("Salvar:", observation);
    if (onSave) onSave(observation);
  };

  const handleExit = () => {
    console.log("Sair");
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="d-flex justify-content-between align-items-center observation">
            <strong className="d-block modal-title text-white">Observação</strong>
            <button className="d-block btn-exit" onClick={handleExit}>Sair</button>
        </div>
        <textarea
          className="modal-textarea"
          placeholder="Digite sua observação aqui..."
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
        <div className="modal-buttons justify-content-center">
          <button className="d-block btn-save" onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default ObservationModal;
