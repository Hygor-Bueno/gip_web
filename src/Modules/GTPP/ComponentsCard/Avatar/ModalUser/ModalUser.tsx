import React, {useState} from "react";
import LoadUserCheck from "../LoadUserCheck/LoadUserCheck";
import './Style.css';

const ModalUser = (props: any) => {
  const [loadUserTask, setLoadUserTask] = useState(true);

  return (
    <div className="gtpp-collab-panel portrait d-flex flex-column justify-content-between">
      {loadUserTask ? (
        <React.Fragment>
          {props.children}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="gtpp-collab-panel__header d-flex align-items-center justify-content-between">
            <div className="gtpp-collab-panel__title">
              <span className="gtpp-collab-panel__icon" aria-hidden="true">
                <i className="fa-solid fa-user-plus"></i>
              </span>
              <strong>Adicione Colaboradores</strong>
            </div>
            <button
              className="gtpp-collab-panel__close"
              onClick={() => setLoadUserTask(true)}
              aria-label="Fechar"
              title="Fechar"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <LoadUserCheck list={props} />
        </React.Fragment>
      )}
      {loadUserTask && (
        <div className="d-flex justify-content-end">
          <button
            className="gtpp-collab-panel__edit"
            onClick={() => setLoadUserTask(false)}
            aria-label="Adicionar colaboradores"
            title="Adicionar colaboradores"
          >
            <i className="fa fa-pencil"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ModalUser;
