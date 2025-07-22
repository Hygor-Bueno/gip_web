import React, { useState } from "react";
import Image from "../Image/Image";
import ImageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from "../../../Context/GtppWsContext";
import { useConnection } from "../../../../../Context/ConnContext";
import { convertImage } from "../../../../../Util/Util";
import '../AvatarGroup.css';

const ListUserTask = ({ item, taskid, loadUserTaskLis, dataPhotosUsers, userId, check = false }: any) => {
  const [isChecked, setIsChecked] = useState(item.check || false);
  const { addUserTask, getTaskInformations } = useWebSocket();
  const { fetchData } = useConnection();

  const handleActiveUser = async (checkUser: boolean) => {
    try {
      const user = {
        check: !isChecked,
        name: item.employee_name,
        user_id: item.employee_id,
        task_id: taskid,
      };
      const response: any = await fetchData({
        method: "PUT",
        params: user,
        pathFile: "GTPP/Task_User.php",
      });
      addUserTask(user, checkUser ? 5 : -3);
      if (response.error) throw new Error(response.message);
      loadUserTaskLis();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`d-flex gap-4 rounded w-100 align-items-center p-1 mb-2 ${check ? 'bg-secondary' : 'bg-normal'}`}
      onClick={async () => {
        setIsChecked(!isChecked);
        await handleActiveUser(!isChecked);
        await getTaskInformations();
      }}
    >
      <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} hidden />
      <div className="avatar">
        <Image src={item?.employee_photo ? convertImage(item.employee_photo) || undefined : ImageUser} />
      </div>
      <div><strong>{item.employee_name}</strong></div>
    </div>
  );
};

export default ListUserTask;
