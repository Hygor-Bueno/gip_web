import React from "react";

interface Props {
  onClose: () => void;
}

export default function ModalThemeRegisterTask({ onClose }: Props) {
  return (
    <div className="bg-dark">
      <div className="position-absolute flowboard-head">
        <div className="flowboard-body w-100 p-2">
          <div className="d-flex justify-content-between">
            <h2>Qual tema deseja vincular as tarefas?</h2>
            <button onClick={onClose} className="fa fa-solid fa-x btn btn-danger"></button>
          </div>
          <hr />
          <div>
            <select className="w-100 form-select" onChange={() => console.log(false)}>
              <option value="" hidden>Selecione</option>
            </select>
          </div>
          <div className="pt-2">
            <button onClick={onClose} className="btn btn-primary">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
