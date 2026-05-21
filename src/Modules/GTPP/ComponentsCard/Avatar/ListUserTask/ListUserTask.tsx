import { useState } from "react";
import Image from "../Image/Image";
import ImageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from "../../../Context/GtppWsContext";
import { useConnection } from "../../../../../Context/ConnContext";
import { convertImage } from "../../../../../Util/Utils";
import './Style.css';

const ListUserTask = ({ item, taskid, check = false }: any) => {
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
      if (response.error) throw new Error(response.message);
      addUserTask(user, checkUser ? 5 : -3);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`gtpp-collab-row d-flex align-items-center w-100 ${check ? 'is-checked' : ''}`}
      onClick={async () => {
        setIsChecked(!isChecked);
        await handleActiveUser(!isChecked);
        await getTaskInformations();
      }}
    >
      <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} hidden />
      <div className="gtpp-collab-row__avatar avatar">
        <Image src={item?.employee_photo ? convertImage(item.employee_photo) || undefined : ImageUser} />
      </div>
      <span className="gtpp-collab-row__name">{item.employee_name}</span>
      <span className="gtpp-collab-row__check" aria-hidden="true">
        <i className={`fa-solid ${check ? "fa-circle-check" : "fa-circle-plus"}`}></i>
      </span>
    </div>
  );
};

export default ListUserTask;
