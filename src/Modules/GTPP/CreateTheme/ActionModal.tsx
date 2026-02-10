import React from 'react';
import './style.css';
import { CustomButton } from '../../../Components/CustomButton';

interface ActionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  
  itemName?: string | null;
  message?: string;

  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  onEdit?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  editText?: string;
  deleteText?: string;

  mode?: "actions" | "confrim-delete";
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

  mode = "actions",
}) => {
  if (!isOpen) return null;

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-container" onClick={(e) => e.stopPropagation()}>
        {itemName && (
          <React.Fragment>
            <div className='text-center'>
              <b className='text-primary'>Tema</b>
              <h2 className="action-modal-title mt-3">{itemName}</h2>
            </div>
          </React.Fragment>
        )}
        <p className="action-modal-message">{message}</p>
        <div className="action-modal-buttons">
          {mode === "actions" && (
            <React.Fragment>
              {onEdit && (
                <CustomButton className="action-modal-btn edit" onClick={onEdit}>
                  {editText}
                </CustomButton>
              )}

              {onDelete && (
                <CustomButton className="action-modal-btn delete" onClick={onDelete}>
                  {deleteText}
                </CustomButton>
              )}
            </React.Fragment>
          )}

          {mode === "confrim-delete" && (
            <React.Fragment>
              <CustomButton className="action-modal-btn delete" onClick={onDelete}>
                Confirmar
              </CustomButton>

              <CustomButton className="action-modal-btn cancel" onClick={onClose}>
                Cancelar
              </CustomButton>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
