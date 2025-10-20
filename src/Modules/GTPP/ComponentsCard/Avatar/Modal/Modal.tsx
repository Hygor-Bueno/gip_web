import { useState } from "react";
import ModalUser from "../ModalUser/ModalUser";
import UserProfile from "../UserProfile/UserProfile";

import './Style.css';
import { useWebSocket } from "../../../Context/GtppWsContext";

const Modal = (props: any) => {
  const [getInfoUser, setInfoUser] = useState();
  const [openDetailUser, setOpenDetailUser] = useState();

  const {getUser} = useWebSocket();

  return (
    <div className="modal-list d-flex align-items-center gap-3">
      <div>
        <ModalUser
          isSearchUser={true}
          allTaskUser={props.allTaskUser}
          data={props}
          list={getInfoUser}
          openDetailUser={openDetailUser}
          setOpenDetailUser={setOpenDetailUser}
        >
          <UserProfile            
            data={props}
            getUser={getUser}
            detailsmodaluser={props.detailsmodaluser}
            listuser={setInfoUser}
            setOpenDetailUser={setOpenDetailUser}
            userId={props.user}
          />
        </ModalUser>
      </div>
    </div>
  );
};

export default Modal;
