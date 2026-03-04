import React from "react";
import { convertImage } from "../../../../../../Util/Utils";
import imageUser from "../../../../../../Assets/Image/user.png";
import { Image } from "react-bootstrap";
import { IUserLinkingList } from "../Contract/Contract";
import { includeAuthorInList } from "../utils/utilsTaskItem";

const UserLinkingList: React.FC<IUserLinkingList> = ({ userState, setUserState, signature, updatedAddUserTaskItem, getUser }) => {
  return (
    <React.Fragment>
      {userState.isListUser && (
        <div className="position-absolute list-user-task rounded p-2 cursor-pointer bg-list-user overflow-hidden">
          <div><button className="btn btn-danger" onClick={() => { setUserState((prev: any) => ({ ...prev, isListUser: false, loadingList: [] })) }}><i className="fa fa-solid fa-x text-white"></i></button></div>
          <div className="overflow-auto">
            {(includeAuthorInList(userState.loadingList?.users, getUser)?.map((item: any, idx: number) => (
              <div
                key={`add_users_${idx}`}
                className={`d-flex align-items-center bg-white rounded my-2 px-1 py-2 cursor-pointer ${signature === item.user_id ? 'bg-selected' : ''} ${signature && signature !== item.user_id ? 'opacity-50' : 'holver-effect'}`}
                onClick={async () => {
                  const alreadyAssigned = userState.loadingList?.listTask?.assigned_to === item.user_id;
                  const payload = { task_id: userState.loadingList?.listTask?.task_id, id: userState.loadingList?.listTask?.id, user_id: alreadyAssigned ? 0 : item.user_id };
                  await updatedAddUserTaskItem(payload, setUserState);
                  if (!alreadyAssigned) setUserState((prev: any) => ({ ...prev, getListUser: item }));
                }}>
                <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px" }}>
                  <Image
                    src={item.photo && convertImage(item.photo) || imageUser}
                    alt="Foto do usuário" className="img-fluid"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <label className="ms-3 mb-0"><strong>{item.name}</strong></label>
              </div>
            )))}
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

export default UserLinkingList;