import React, { useEffect, useRef, useState } from "react";
import { InputCheckbox } from "../../../../Components/CustomForm";
import { SubTasksWithCheckboxProps } from "./Types";
import { useWebSocket } from "../../Context/GtppWsContext";
import ButtonIcon from "../Button/ButtonIcon/btnicon";
import AnexoImage from "../../../../Components/Attachment/AttachmentFile";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import ModalEditTask from "./ModalEditTask";
import { Image } from "react-bootstrap";
import { convertImage, handleNotification } from "../../../../Util/Util";
import imageUser from "../../../../Assets/Image/user.png";
import ModalConfirm from "./ModalConfirm";
require('animate.css');

interface iSubTask {
  isObservable: boolean;
  isQuestion: boolean;
  isAttachment: boolean;
  text: string;
  idSubTask: string | number;
  openDialog: boolean
}

const SubTasksWithCheckbox: React.FC<SubTasksWithCheckboxProps> = ({ users, props }) => {
  const {
    checkedItem,
    task,
    taskDetails,
    setTaskDetails,
    reloadPagePercent,
    deleteItemTaskWS,
    updateItemTaskFile,
    updatedAddUserTaskItem,
    getUser    
  } = useWebSocket();

  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();
  const [editTask, setEditTask] = useState<any>("");
  const [isObservation, setIsObservation] = useState<boolean>(false);
  const [positionTaskStates, setPositionTaskStates] = useState<{ [key: number]: boolean }>({});
  const [onScrollDown, setOnScrollDown] = useState<boolean>(true);
  const [onEditTask, setOnEditTask] = useState<boolean>(false);
  const containerTaskItemsRef = useRef<HTMLDivElement>(null);
  const [isTrashDelete, setIsTrashDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  const [authorData, setAuthorData] = useState<any>(null);


  const [userState, setUserState] = useState({
    loadingList: { users: undefined, listTask: undefined } as { users?: any; listTask?: any },
    isListUser: false,
    getListUser: { name: undefined, photo: undefined, user_id: undefined } as { name?: string; photo?: string; user_id?: number },
    listUserBtn: { isGetTaskOrIncludeColaborator: false },
  });

  useEffect(() => {
    if (containerTaskItemsRef.current && onScrollDown) {
      containerTaskItemsRef.current.scrollTop = containerTaskItemsRef.current.scrollHeight;
    }
  }, [taskDetails, onScrollDown]);

  const [subTask, setSubtask] = useState<iSubTask>({
    isObservable: false,
    isQuestion: false,
    isAttachment: false,
    text: "",
    idSubTask: "",
    openDialog: false
  });

  // Hygor Bueno 23/10/2025
  function includeAuthorInList(listUser: any) {
    // Garante que listUser é um array; se não for, cria um array vazio
    let list: any[] = Array.isArray(listUser) ? [...listUser] : [];

    if (listUser && listUser.length > 0) {
      const exists = list.some((item: any) => item.user_id === getUser.id);
      if (!exists) {
        list.push({
          task_id: listUser[0].task_id,
          user_id: getUser.id,
          status: true,
          name: getUser.name || "",
          photo: getUser.photo
        });
      }
    }

    return list;
  }

   function getCompleteUserList(listUser: any) {
      let list: any[] = Array.isArray(listUser) ? [...listUser] : [];

      if (getUser && getUser.id) {
          const exists = list.some((item: any) => item.user_id === getUser.id);
          if (!exists) {
              list.push({
                  user_id: getUser.id,
                  name: getUser.name || "Autor",
                  photo: getUser.photo,
                  status: true
              });
          }
      }
      
      return list;
  }


  const ModalInformation = (props: any) => {
    return (
      <div className="cloud-balloon rounded p-2">
        <div>
          {
            props.description.split("\r").map((linha: any, idx: any) => (
              <p key={idx} className="mb-1">{linha}</p>
            ))
          }
        </div>
        <footer className="d-flex align-items-center justify-content-center h-25 ">
          <button onClick={() => props.onClose(props.task)} title="fechar" className="d-block btn btn-danger mt-3">Fechar</button>
        </footer>
      </div>
    );
  };

  const togglePositionTask = (taskId: number) => {
    setPositionTaskStates((prevStates) => ({
      ...prevStates,
      [taskId]: !prevStates[taskId],
    }));
  };

  function isMissing(value: any) {
    return !value;
  }

  function changePositionItem(next: boolean, id: number) {
    let result = false;
    if (taskDetails.data && taskDetails.data.task_item) {
      const items = taskDetails.data.task_item;
      const currentIndex = items.findIndex(item => item.id === id);
      const newIndex = next ? currentIndex + 1 : currentIndex - 1;
      const validMove = currentIndex !== -1 && newIndex >= 0 && newIndex < items.length;
      if (validMove) {
        const [movedItem] = items.splice(currentIndex, 1);
        items.splice(newIndex, 0, movedItem);
        setTaskDetails({ ...taskDetails });
        result = true;
      }
    }
    return result;
  }

  async function handleTrashDelete(task: any) {
    
    try {
      setLoading(true);
      if (task.id && task.task_id) {
        const result = await deleteTaskItem({
          id: task.id,
          task_id: task.task_id,
        });
        if (result.error) throw new Error(result.message);
        removeItemOfList(task.id);
        reloadPagePercent(result.data, task);
        deleteItemTaskWS({
          description: "Um item foi removido.",
          itemUp: task.id,
          percent: parseInt(result.data.percent),
          remove: true,
        });
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }


  async function updatePositionTaskItem(item: { id: number, next_or_previous: "next" | "previous" }) {
    const value: { task_id: number, id: number, next_or_previous: "next" | "previous" } = { task_id: task.id, id: item.id, next_or_previous: item.next_or_previous };
    await fetchData({ method: "PUT", params: value, pathFile: "GTPP/TaskItem.php", exception: ["no data"], urlComplement: "" });
  }
  
  const assinatura = userState.loadingList?.listTask?.assigned_to;

  return (
    <div ref={containerTaskItemsRef} className="overflow-auto rounded flex-grow-1">
      {userState.isListUser && (
        <div className="position-absolute list-user-task rounded p-2 cursor-pointer bg-list-user overflow-hidden">
          <div><button className="btn btn-danger" onClick={() => { setUserState((prev: any) => ({ ...prev, isListUser: false, loadingList: [] })) }}><i className="fa fa-solid fa-x text-white"></i></button></div>
          <div className="overflow-auto">
            {(includeAuthorInList(userState.loadingList?.users)?.map((item: any, idx: number) => (
              <div
                key={`add_users_${idx}`}
                className={`d-flex align-items-center bg-white rounded my-2 px-1 py-2 cursor-pointer
                        ${assinatura === item.user_id ? 'bg-selected' : ''}
                        ${assinatura && assinatura !== item.user_id ? 'opacity-50' : 'holver-effect'}
                      `}
                onClick={async () => {
                  const alreadyAssigned = userState.loadingList?.listTask?.assigned_to === item.user_id;
                  const payload = { task_id: userState.loadingList?.listTask?.task_id, id: userState.loadingList?.listTask?.id, user_id: alreadyAssigned ? 0 : item.user_id };
                  await updatedAddUserTaskItem(payload, setUserState);
                  if (!alreadyAssigned) setUserState((prev) => ({ ...prev, getListUser: item }));
                }}
              >
                <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px" }}>
                  <Image
                    src={item.photo && convertImage(item.photo) || imageUser}
                    alt="Foto do usuário" className="img-fluid"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <label className="ms-3 mb-0"><strong>{item.name}</strong></label>
              </div>
            ))
            )}
          </div>
        </div>
      )}
      <div>
        <ModalEditTask userList={getCompleteUserList(props.details.data?.task_user)} onEditTask={onEditTask} onClose={() => setOnEditTask(false)} isObservation={isObservation} setIsObservation={setIsObservation} editTask={editTask} setEditTask={setEditTask} />
        <ModalConfirm isOpen={isTrashDelete} onCancel={async () => setIsTrashDelete(false)} onSave={async () => {
          await handleTrashDelete(taskToDelete);
          setIsTrashDelete(false);
        }} title="Atenção" children="Deseja apagar esse conteúdo?" cancelText="Voltar" saveText="Confirmar" />
        {(taskDetails.data?.task_item || []).map((task, index: number) => {
          const list = users?.find((item: { user_id: number }) => item?.user_id == task?.created_by);
          const creator = !isMissing(list?.name) ? list?.name : getUser.name;
          const assignedUser = includeAuthorInList(props.details.data?.task_user)?.find(
            (user: any) => user.user_id === task.assigned_to
          );

          return (
            <div key={task.id} className={`d-flex justify-content-between align-items-center mb-1 bg-light border w-100 p-1 rounded overflow-auto ${userState.loadingList.listTask?.id == task.id ? 'border-mark' : ''}`}>
              {(subTask.openDialog && subTask.idSubTask === task.id && task.note) && <ModalInformation onClose={closeObservation} task description={task.note} />}
              {(task.id && positionTaskStates[task.id]) &&
                <div>
                  <button onClick={async () => {
                    changePositionItem(false, task.id || 0);
                    task.id && await updatePositionTaskItem({ id: task.id, next_or_previous: "previous" });
                  }} title="Subir uma posiçaõ" className="btn py-1 px-3 my-1 btn-outline-success fa-solid fa-arrow-up-long"></button>
                  <button onClick={async () => {
                    changePositionItem(true, task.id || 0);
                    task.id && await updatePositionTaskItem({ id: task.id, next_or_previous: "next" });
                  }} title="Descer uma posição" className="btn py-1 px-3 my-1 btn-outline-danger fa-solid fa-arrow-down-long"></button>
                </div>
              }
              <div className="container-fluid">
                <div className="row align-items-center mb-2">
                  <div className="col-md-10 col-sm-9">
                    <div className="text-wrap text-break">
                      <InputCheckbox
                        label={task.description}
                        task={task}
                        onChange={checkedItem}
                        onPosition={() => {
                          togglePositionTask(task.id || 0);
                          setOnScrollDown(!onScrollDown);
                        }}
                        yesNo={task.yes_no || 0}
                        checked={task.check || false}
                        key={index}
                        id={(task.id || "0").toString()}
                        order={task.order || 0}
                      />
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-3 text-center">
                    <div className="mx-auto cursor-pointer userPhotoAnimation border-warning"
                      onClick={async () => {
                        if (userLog.administrator == 1 || getUser.id == userLog.id) {
                          setUserState((prev: any) => ({
                            ...prev,
                            loadingList: {
                              users: props.details.data?.task_user,
                              listTask: task
                            },
                            isListUser: true,
                            listUserBtn: { isGetTaskOrIncludeColaborator: false }
                          }));
                        } else {
                          const payload: any = {
                            id: task.id,
                            task_id: task.task_id,
                            user_id: task.assigned_to == 0 ? userLog.id : task.assigned_to
                          }
                          await updatedAddUserTaskItem(payload, setUserState);
                        }
                      }}
                    >
                      {Number(task?.assigned_to) > 0 && assignedUser ? (
                        <Image
                          title={assignedUser.name}
                          src={convertImage(assignedUser.photo) || imageUser}
                          alt={`Foto de ${assignedUser.name}`}
                          className="rounded-circle"
                          style={{ width: "30px", height: "30px", objectFit: "cover" }}
                        />
                      ) : (
                        <i className="fa my-2 fa-plus text-secondary"></i>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row justify-content-between align-items-center">
                  <div className="col-sm-6">
                    <i>
                      <small className="text-secondary">
                        Por: {task.created_by ? creator : getUser?.name}
                      </small>
                    </i>
                  </div>
                  <div className="col-sm-6 d-flex justify-content-end gap-2">
                    {task.note && (
                      <ButtonIcon
                        title="Visualizar observação"
                        color="primary"
                        icon="circle-info"
                        description=""
                        onClick={() => closeObservation(task)}
                      />
                    )}
                    <ButtonIcon
                      title="Observação"
                      color="primary"
                      icon="pencil"
                      description=""
                      onClick={() => {
                        setEditTask(task);
                        setOnEditTask(true);
                      }}
                    />

                    <ButtonIcon
                      title="Remover"
                      color="danger"
                      icon="trash"
                      description=""
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsTrashDelete(true);
                      }}
                    />

                    <AnexoImage
                      item_id={task.id || 0}
                      file={task.file || 0}
                      updateAttachmentFile={updateItemTaskFile}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
  function closeObservation(task: any) {
    setSubtask((prev) => ({ ...prev, idSubTask: task.id, openDialog: !prev.openDialog }));
  }

  async function deleteTaskItem(item: { id: number; task_id: number }) {
    const req: any = await fetchData({ method: "DELETE", params: { id: item.id, task_id: item.task_id }, pathFile: 'GTPP/TaskItem.php' });
    return req;
  }

  function removeItemOfList(id: number) {
    const indexDelete: number | undefined = taskDetails.data?.task_item.findIndex(item => item.id == id);
    if (indexDelete != undefined && indexDelete >= 0) {
      taskDetails.data?.task_item.splice(indexDelete, 1);
      setTaskDetails({ ...taskDetails });
    }
  }
};

export default SubTasksWithCheckbox;