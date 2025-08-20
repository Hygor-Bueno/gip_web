import React, { useEffect, useState } from "react";
import "./AvatarGroup.css";
import ImageUser from "../../../../Assets/Image/user.png";
import { convertImage } from "../../../../Util/Util";
import { Connection } from "../../../../Connection/Connection";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";

const Image = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img {...props} />;
};

const UserProfile = (props: any) => {
  return (
    <div className="">
      {/* Aqui vamos fazer o botão para fechar a lista de usuários */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <strong>Colaboradores</strong>
        </div>
        <button
          title="Detalhes do usuário"
          className="btn btn-danger text-white"
          onClick={() => props.detailsmodaluser(true)}
        >
          X
        </button>
      </div>

      {/* Aqui vamos carregar a lista de usuarios */}
      {props.photos
        .map((photo: any, index:any) => (
          <div
            key={`photo_user_task_${index}`}
            className="d-flex gap-4 align-items-center mb-2"
          >
            <div
              onClick={() => {
                props.setOpenDetailUser(true);
                props.listuser(photo);
              }}
              className={`avatar`}
            >
              <Image
                title={photo.name} // Aqui vamos exibir o nome do usuario
                src={convertImage(photo.photo) || ImageUser}
                alt={`User ${index}`}
              />
            </div>
            <div>
              <p>
                <strong>{photo.name}</strong>
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

const ListUserTask = ({ item, taskid, loadUserTaskLis, dataPhotosUsers, userId, check=false }: any) => {
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
      className={`d-flex gap-4 rounded w-100 align-items-center p-1 mb-2 ${
        check ? "bg-secondary" : "bg-normal"
      }`}
      onClick={async () => {
        setIsChecked(!isChecked);
        await handleActiveUser(!isChecked);
        await getTaskInformations();
      }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
        hidden
      />
      <div className="avatar">
      <Image src={item?.employee_photo ? convertImage(item.employee_photo) || undefined : ImageUser}/>
      </div>
      <div>
        <strong>{item.employee_name}</strong>
      </div>
      
    </div>
  );
};

const LoadUserCheck = (props: any) => {
  const [userTaskBind, setUserTaskBind] = useState([]);
  const { setLoading, loading } = useMyContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limitPage, setLimitPage] = useState<number>(1);
  const [list, setList] = useState([]);

  const { fetchData } = useConnection();

  useEffect(() => {
    (async () => {
      await recoverList();
    })();
  }, [page, searchTerm]);

  async function recoverList(value?: string, title?: string) {
    try {
      setLoading(true);
      const req: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "CCPP/Employee.php",
        urlComplement: `&pApplicationAccess=${3}&pPage=${page}&searchName=${title}&pEmployeeName=${searchTerm}`,
      });
      if (req["error"]) throw new Error(req["message"]);
      setList(req.data);
      setLimitPage(req["limitPage"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserTaskLis() {
    const connection = new Connection("18");
    setLoading(true);
    try {
      const userList: any = [];
      const responseUserTaskList: any = await connection.get(`&task_id=${props.list.data.datatask.id}&list_user=1`,"GTPP/Task_User.php");
      for (let user of responseUserTaskList.data) return userList.push({ photo: null, check: user.check, name: user.name, user: user.user_id }); 
      setUserTaskBind(userList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (e: string) => {
    setSearchTerm(e);
  };

  return (
    <div className="overflow-hidden d-flex flex-column justify-content-between h-100 gap-2">
      <div>
          <input
          placeholder="Nome do colaborador..."
          type="text"
          className="form-control mb-3"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleSearchChange(e.currentTarget.value);
              setPage(1);
            }
          }}
        />
      </div>
      <div className="overflow-auto h-100">
      {list.map((item: any) => {
        const filterCheckList = props.dataPhotosUsers.some((items: any) => {
          return Number(item.employee_id) === Number(items.id);
        });

        return (
          <React.Fragment key={Number(item.employee_id)}>
            <ListUserTask
              dataPhotosUsers={props.dataPhotosUsers || ImageUser}
              check={filterCheckList} 
              item={item}
              taskid={props.list.data.datatask.id}
              userId={item.employee_id}
              key={item.employee_id}
              loadUserTaskLis={loadUserTaskLis}
            />
          </React.Fragment>
        );
      })}

      </div>
      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-danger" onClick={()=>{
          const newPage = page > 1 ? page -1 : 1;
          setPage(Number(newPage))
          }} type="button"> {"<"} </button>
          <strong>{page.toString().padStart(2,'0')} / {limitPage.toString().padStart(2, '0')}</strong>
        <button className="btn btn-success" onClick={()=>{
          const newPage = page < limitPage ? page + 1 : limitPage;
          setPage(Number(newPage))
          }} type="button">{">"}</button>
      </div>
    </div>
  );
};

function ModalUser(props: any) {
  const [loadUserTask, setLoadUserTask] = useState(true);

  return (
    <React.Fragment>
      <div className="border-dark bg-dark text-white rounded portrait d-flex flex-column justify-content-between">
        {loadUserTask ? (
          <React.Fragment>
            {props.openDetailUser ? (
              <>
                <div className="d-flex align-items-center justify-content-end mb-2">
                  <button title="Abrir detalhes do usuário" className="btn bg-danger text-white" onClick={() => props.setOpenDetailUser(false)}>X</button>
                </div>
                <div className="text-center">
                  <Image
                    className="rounded img-fluid img-thumbnail w-100"
                    src={convertImage(props.list?.photo) || ImageUser}
                  />
                </div>
                <p>
                  <strong>Nome:</strong> {props.list?.name}
                </p>
                <p>
                  <strong>Departamento:</strong> {props.list?.department}
                </p>
                <p>
                  <strong>Loja:</strong> {props.list?.shop}
                </p>
                <p>
                  <strong>Subdepartamento:</strong> {props.list?.sub}
                </p>
              </>
            ) : (
              <>{props.children}</>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <strong>Adicione Colaboradores</strong>
              </div>
              <div>
                <button
                  title="Carregar as tarefas do usuário"
                  className="btn bg-danger text-white"
                  onClick={() => setLoadUserTask(true)}
                >
                  X
                </button>
              </div>
            </div>
            <LoadUserCheck dataPhotosUsers={props.dataPhotosUsers} list={props} />
          </React.Fragment>
        )}
        <div className="d-flex justify-content-end">
          {loadUserTask && (
            <i
              className="btn fa fa-pencil text-white"
              onClick={() => setLoadUserTask(false)}
            ></i>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

const Avatar = () => {
  return (
    <div className="bg-primary text-white p-2 gap-2 rounded font-weight-bold d-flex align-items-center">
      <i className="fa fa-user text-white"></i>{" "}
      <p className="font-weight-bold d-none d-md-inline">Usuários da tarefa</p>
    </div>
  );
};

const Modal = (props: any) => {
  const [getInfoUser, setInfoUser] = useState();
  const [openDetailUser, setOpenDetailUser] = useState();
  
  const { setLoading, ctlSearchUser, setCtlSearchUser, appIdSearchUser } = useMyContext();

  const [photos, setPhotos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const loadPhotos = async () => {
      try {
        const conn = new Connection("18");
        const userList: any = [];

        if (Array.isArray(props.user)) {
          for (let user of props.user) {
            const responsePhotos: any = await conn.get(
              `&id=${user.user_id}`,
              "CCPP/EmployeePhoto.php"
            );
            const responseDetails: any = await conn.get(
              `&id=${user.user_id}`,
              "CCPP/Employee.php"
            );
            if (
              responseDetails &&
              !responseDetails.error &&
              responsePhotos &&
              !responsePhotos.error
            ) {
              const details = responseDetails.data[0];
              userList.push({
                id: user.user_id,
                name: details.name,
                company: details.company,
                shop: details.shop,
                department: details.departament,
                sub: details.sub,
                administrator: responseDetails.data[1]?.administrator,
                photo: responsePhotos.photo,
              });
            }
          }

          setPhotos(userList);
        } else {
          setPhotos([]);
        }
      } catch (error: any) {
        setError(error.message);
      }
      setLoading(false);
    };

    loadPhotos();
  }, [props.user]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // console.log(photos);

  return (
    <div className="modal-list d-flex align-items-center gap-3">
      <div>
        <ModalUser
          dataPhotosUsers={photos}
          data={props}
          list={getInfoUser}
          openDetailUser={openDetailUser}
          setOpenDetailUser={setOpenDetailUser}
        >
          <UserProfile
            photos={photos}
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

const AvatarGroup = (props: { users: any; dataTask: any }) => {
  const [openDetailsUser, setOpenDetailsUserModal] = useState(true);
  return (
    <React.Fragment>
      <div className="cursor-pointer">
        {openDetailsUser ? (
          <div onClick={async () => setOpenDetailsUserModal((prev) => !prev)}>
            <Avatar />
          </div>
        ) : (
          <React.Fragment>
            {/* é aqui que renderiza a lista (RENDERLISTAVATAR) */}
            <Modal
              detailsmodaluser={setOpenDetailsUserModal}
              datatask={props?.dataTask}
              user={props?.users}
            />
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export default AvatarGroup;
