import { useEffect } from "react";

export const ActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  themeName: string;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ isOpen, onClose, themeName, onDelete, onEdit }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header bg-primary text-white border-0">
              <h5 className="modal-title fw-bold">Ação no tema</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Fechar" />
            </div>
            <div className="modal-body text-center py-5">
              <i className="fa-solid fa-palette fa-4x text-primary mb-4"></i>
              <h5 className="fw-bold text-dark">{themeName}</h5>
              <p className="text-muted">O que você deseja fazer com este tema?</p>
            </div>
            <div className="modal-footer border-0 justify-content-center gap-4 pb-5">
              <button className="btn btn-lg btn-outline-danger px-5" onClick={onDelete}>
                Excluir
              </button>
              <button className="btn btn-lg btn-primary px-5" onClick={onEdit}>
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};