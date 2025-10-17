import React, { useState, useEffect } from "react";

import './ObservationModal.Style.css'

interface IObservationModal {
  onClose?: () => void;
  onSave?: (text: string) => void;
}

export const ObservationModal: React.FC<IObservationModal> = ({ onClose, onSave }) => {
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
          <strong className="d-block modal-title">Observação</strong>
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


interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onConfirm,
  onCancel,
  title = 'Confirmação',
  children,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="d-flex justify-content-between align-items-center observation">
          <strong className="d-block modal-title text-white">{title}</strong>
        </div>

        <div className="modal-content text-white">
          {children}
        </div>

        <div className="modal-buttons justify-content-center">
          <button className="d-block btn-save" onClick={onConfirm}>Confirmar</button>
          <button className="d-block btn-exit" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

interface IEditModalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  options: { label: string; value: string }[];
  title?: string;
}

/** 💡 Modal de Edição com Select Moderno **/
export function EditModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  options,
  title = "Edição"
}: IEditModalConfirmProps) {
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(function () {
    if (!isOpen) {
      setSelectedValue("");
    }
  }, [isOpen]);

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedValue(event.target.value);
  }

  function handleConfirm() {
    if (selectedValue) {
      onConfirm(selectedValue);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <strong className="d-block modal-title">{title}</strong>

        <select
          value={selectedValue}
          onChange={handleSelectChange}
          className={`modal-select ${selectedValue ? "selected" : ""}`}
        >
          <option value="">Selecione uma opção...</option>
          {options?.map((opt, index) => (
            <option key={`index_${index}`} value={opt.value}>
              {opt.label}
            </option>
          )) ?? null}
        </select>

        <div className="modal-buttons justify-content-center">
          <button className="d-block btn-save" onClick={handleConfirm}>Confirmar</button>
          <button className="d-block btn-exit" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
