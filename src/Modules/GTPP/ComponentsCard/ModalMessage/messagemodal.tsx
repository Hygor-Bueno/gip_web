import React from "react";

function MessageModal(props: {
  title: string | null;
  onClick?: any;
  openClock?: any;
  onChange?: any;
  onClose?: any;
  typeInput: any;
  isInput:boolean;
}) {
  return (
    <div className="bg-dark p-2 rounded position-absolute box-dialog d-flex flex-column gap-2 align-items-center">
      <div>
        <label htmlFor="" className="text-white">
          {props.title}
        </label>
      </div>
      <div className="w-100">
        {props.isInput && <input
          type={props.typeInput || "text"}
          value={props.openClock.description}
          className="form-control"
          onChange={props.onChange}
        /> }
      </div>
      <div className="d-flex justify-content-around w-100">
        <button title="Enviar mensagem" className="btn btn-secondary" onClick={props.onClick}>
          {props.isInput ? "Enviar": "Confirmar"}
        </button>
        <button title="Cancelar mensagem" className="btn btn-danger" onClick={props.onClose}>
          cancelar
        </button>
      </div>
    </div>
  );
}

export default MessageModal;
