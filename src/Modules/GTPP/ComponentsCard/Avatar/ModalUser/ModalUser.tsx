import { useState } from "react";
import Image from "../Image/Image";
import ImageUser from "../../../../../Assets/Image/user.png";
import { convertImage } from "../../../../../Util/Util";
import LoadUserCheck from "../LoadUserCheck/LoadUserCheck";
import './Style.css';

const ModalUser = (props: any) => {
  const [loadUserTask, setLoadUserTask] = useState(true);

  return (
    <div className="border-dark bg-dark text-white rounded portrait d-flex flex-column justify-content-between">
      {loadUserTask ? (
        <>
          {props.openDetailUser ? (
            <>
              <div className="d-flex align-items-center justify-content-end mb-2">
                <button title="Abrir detalhes do usuário" className="btn bg-danger text-white" onClick={() => props.setOpenDetailUser(false)}>X</button>
              </div>
              <div className="text-center">
                <a href={props.list?.photo} target="_blank" rel="noopener noreferrer">
                  <Image className="rounded img-fluid img-thumbnail w-100" src={convertImage(props.list?.photo) || ImageUser} />
                </a>
              </div>
              <p><strong>Nome:</strong> {props.list?.name}</p>
              <p><strong>Departamento:</strong> {props.list?.department}</p>
              <p><strong>Loja:</strong> {props.list?.shop}</p>
              <p><strong>Subdepartamento:</strong> {props.list?.sub}</p>
            </>
          ) : (
            props.children
          )}
        </>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong>Adicione Colaboradores</strong>
            <button className="btn bg-danger text-white" onClick={() => setLoadUserTask(true)}>X</button>
          </div>
          <LoadUserCheck dataPhotosUsers={props.dataPhotosUsers} list={props} />
        </>
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
