// ActionModal.tsx
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  message?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  editText?: string;
  deleteText?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  itemName,
  message = "Tem certeza que deseja continuar?",
  onDelete,
  onEdit,
  editText = "Editar",
  deleteText = "Excluir",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmação</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
              <p className="fw-bold text-primary">"{itemName}"</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              {onEdit && (
                <button className="btn btn-warning" onClick={onEdit}>
                  {editText}
                </button>
              )}
              {onDelete && (
                <button className="btn btn-danger" onClick={onDelete}>
                  {deleteText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};