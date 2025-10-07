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
  onBack?: () => void;
  onNext?: () => void;
  title: string;
  saveButtonLabel?: string;
  saveButtonVariant?: BootstrapColorVariant;
  children: React.ReactNode;
  pageNation?: string | number;
  showNavigation?: boolean;
};

const GenericModal: React.FC<GenericModalProps> = ({
  show,
  onClose,
  onSave,
  onBack,
  onNext,
  title,
  children,
  saveButtonLabel = "Salvar",
  saveButtonVariant = "primary",
  pageNation = "",
  showNavigation = false,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      {onSave && (
        <div className="w-100 p-3">
          <Button
            className="w-100"
            variant={saveButtonVariant}
            onClick={onSave}
          >
            {saveButtonLabel}
          </Button>
        </div>
      )}

      {showNavigation && (
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={onBack} disabled={!onBack}>
            {"<"}
          </Button>
          <div>{pageNation}</div>
          <Button variant="secondary" onClick={onNext} disabled={!onNext}>
            {">"}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default GenericModal;
