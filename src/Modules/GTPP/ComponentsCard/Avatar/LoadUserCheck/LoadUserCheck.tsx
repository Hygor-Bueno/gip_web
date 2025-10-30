import React, { useEffect, useState } from "react";
import ImageUser from "../../../../../Assets/Image/user.png";
import { useMyContext } from "../../../../../Context/MainContext";
import { useConnection } from "../../../../../Context/ConnContext";
import ListUserTask from "../ListUserTask/ListUserTask";
import './Style.css';

const LoadUserCheck = (props: any) => {
  const [ userTaskBind, setUserTaskBind ] = useState<any>([]);
  const { loading, setLoading } = useMyContext();
  const [ searchTerm, setSearchTerm ] = useState<string>("");
  const [ page, setPage ] = useState<number>(1);
  const [ limitPage, setLimitPage ] = useState<number>(1);
  const [ list, setList ] = useState<any>([]);

  const { fetchData } = useConnection();

  useEffect(() => {
    (async () => await recoverList())();
  }, [page, searchTerm]);

  async function recoverList() {
    try {
      setLoading(true);
      const req: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "CCPP/Employee.php",
        urlComplement: `&pApplicationAccess=3&pPage=${page}&searchName=&pEmployeeName=${searchTerm}`,
      });
      if (req.error) throw new Error(req.message);
      setList(req.data);
      setLimitPage(req.limitPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserTaskLis() {
    setLoading(true);
    try {
      const userList: any = [];
      const res: any = await fetchData({method: "GET", params: null, urlComplement: `&task_id=${props.list.data.datatask.id}&list_user=1`, pathFile: "GTPP/Task_User.php" });
      for (let user of res.data) {
        if(list.length > 1) {
          if(user.user_id == list[0].employee_id) {
            userList.push({ photo: null, check: user.check, name: user.name, user: user.user_id });
          }
        }
        userList.push({ photo: null, check: user.check, name: user.name, user: user.user_id });
      };
      setUserTaskBind(userList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden d-flex flex-column justify-content-between h-100 gap-2">
      <div>
        <input
          placeholder="Nome do colaborador..."
          type="text"
          className="form-control mb-3"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              setSearchTerm(e.currentTarget.value);
              loadUserTaskLis();
              setPage(1);
            }
          }}
        />
      </div>
      <div className="overflow-auto h-100">
        {list.map((item: any) => {
          const filterCheckList = Array.isArray(props.list.data.user) ? props.list.data.user.some((user: any) => Number(item.employee_id) === Number(user.user_id)) : false;
          return (
            <ListUserTask
              listTask={props.list.data.datatask}
              key={item.employee_id}
              item={item}
              taskid={props.list.data.datatask.id}
              userId={item.employee_id}
              loadUserTaskLis={loadUserTaskLis}
              check={filterCheckList}
            />
          );
        })}
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-danger" onClick={() => setPage(prev => (prev > 1 ? prev - 1 : 1))}>{"<"}</button>
        <strong>{String(page).padStart(2, "0")} / {String(limitPage).padStart(2, "0")}</strong>
        <button className="btn btn-success" onClick={() => setPage(prev => (prev < limitPage ? prev + 1 : limitPage))}>{">"}</button>
      </div>
    </div>
  );
};

export default LoadUserCheck;
