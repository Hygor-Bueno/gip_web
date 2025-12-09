import React from 'react';
import './style.css';

interface ActionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  itemName?: string;
  message?: string;
  onDelete?: () => void;
  onEdit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editText?: string;
  deleteText?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen = false,
  onClose,
  itemName = "Item X",
  message = "Quais operações deseja execultar?",
  onDelete,
  onEdit,
  editText = "Editar",
  deleteText = "Excluir",
}) => {
  if (!isOpen) return null;

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div 
        className="action-modal-container"
        onClick={(e) => e.stopPropagation()} // impede clicar dentro e fechar
      >
        {/* Título */}
        {itemName && (
          <React.Fragment>
            <div className='text-center'>
              <b className='text-primary'>Categoria</b>
              <h2 className="action-modal-title mt-3">{itemName}</h2>
            </div>
          </React.Fragment>
        )}

        {/* Mensagem */}
        <p className="action-modal-message">{message}</p>

        {/* Ações */}
        <div className="action-modal-buttons">
          {onEdit && (
            <button className="action-modal-btn edit" onClick={onEdit}>
              {editText}
            </button>
          )}

          {onDelete && (
            <button className="action-modal-btn delete" onClick={onDelete}>
              {deleteText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
