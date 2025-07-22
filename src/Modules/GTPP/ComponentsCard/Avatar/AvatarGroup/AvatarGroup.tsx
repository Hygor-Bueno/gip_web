import { useState } from "react";
import HeaderImage from "../HeaderImage/HeaderImage";
import Modal from "../Modal/Modal";
import './Style.css';

const AvatarGroup = (props: { users: any; dataTask: any }) => {
  const [openDetailsUser, setOpenDetailsUserModal] = useState(true);

  return (
    <div className="cursor-pointer">
      {openDetailsUser ? (
        <div onClick={() => setOpenDetailsUserModal(prev => !prev)}>
          <HeaderImage />
        </div>
      ) : (
        <Modal
          detailsmodaluser={setOpenDetailsUserModal}
          datatask={props?.dataTask}
          user={props?.users}
        />
      )}
    </div>
  );
};

export default AvatarGroup;
