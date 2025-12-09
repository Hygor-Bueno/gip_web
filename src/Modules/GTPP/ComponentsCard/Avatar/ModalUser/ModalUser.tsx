import React, {useState} from "react";
import LoadUserCheck from "../LoadUserCheck/LoadUserCheck";
import './Style.css';

const ModalUser = (props: any) => {
  const [loadUserTask, setLoadUserTask] = useState(true);

  return (
    <div className="border-dark bg-dark text-white rounded portrait d-flex flex-column justify-content-between p-2">
      {loadUserTask ? (
        <React.Fragment>
          {props.children}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong>Adicione Colaboradores</strong>
            <button className="btn bg-danger text-white" onClick={() => setLoadUserTask(true)}>X</button>
          </div>
          <LoadUserCheck list={props} />
        </React.Fragment>
      )}  
    {loadUserTask && (
        <div className="d-flex justify-content-end">
            <i className="btn fa fa-pencil text-white" onClick={() => setLoadUserTask(false)}></i>
        </div>
    )}
    </div>
  );
};

export default ModalUser;
