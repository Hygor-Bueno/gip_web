import React, { useEffect, useState } from 'react';

interface IModalConfirm {
  cancel?: () => void;
  confirm?: () => void;
  title?: string;
  message?: string;
}

const ModalConfirm: React.FC<IModalConfirm> = ({
  cancel,
  confirm,
  title = "Tem certeza?",
  message = "Você deseja continuar com essa ação?",
}) => {
  const [showClass, setShowClass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClass(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`modal fade ${showClass ? 'show d-block' : 'd-block'}`}
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        transition: 'opacity 0.15s linear',
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Fechar"
              onClick={cancel}
            />
          </div>
          <div className="modal-body text-center">
            <b><p>{message}</p></b>
          </div>
          <div className="modal-footer d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={confirm}
            >
              <i className="fa fa-check me-2 text-white" />
              Confirmar
            </button>
            <button
              type="button"
              className="btn d-flex align-items-center btn-danger"
              onClick={cancel}
            >
              <i className="fa fa-times me-2 text-white" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
