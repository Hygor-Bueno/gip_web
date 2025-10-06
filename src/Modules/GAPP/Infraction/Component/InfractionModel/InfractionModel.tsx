import React from "react";
import { Modal, Button } from "react-bootstrap";

export type BootstrapColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  saveButtonLabel?: string;
  saveButtonVariant?: BootstrapColorVariant;
  children: React.ReactNode;
};

const GenericModal: React.FC<GenericModalProps> = ({
  show,
  onClose,
  onSave,
  title,
  children,
  saveButtonLabel = "Salvar",
  saveButtonVariant = "primary",
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        {onSave && (
          <Button variant={saveButtonVariant} onClick={onSave}>
            {saveButtonLabel}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GenericModal;
