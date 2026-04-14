import React, { useEffect, useRef, useState } from "react";
import { SubTasksWithCheckboxProps } from "./Types";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import ModalEditTask from "./ModalEditTask";
import ModalConfirm from "./ModalConfirm";
import SocialCommentFeed from "./Comment/SocialCommentFeed";
import UserLinkingList from "./TaskItem/components/UserLinkingList";
import { getCompleteUserList } from "./TaskItem/utils/utilsTaskItem";
import TaskItemList from "./TaskItem/components/TaskItemList";
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
  const { task, taskDetails, updateCommentCount, getUser, reloadPagePercent, deleteItemTaskWS, updateItemTaskFile, 
  setTaskDetails, updatedAddUserTaskItem, getTaskInformations, checkedItem } = useWebSocket();

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

  const [showUserLinkedList, setShowUserLinkedList] = useState(false);

  const [showChat, setShowChat] = useState(false);

  const [userState, setUserState] = useState<any>({
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
  
  useEffect(() => {
    if (task.id) {
      getTaskInformations();
    }
  }, [task.id]);

  const [subTask, setSubtask] = useState<iSubTask>({
    isObservable: false,
    isQuestion: false,
    isAttachment: false,
    text: "",
    idSubTask: "",
    openDialog: false
  });

  const togglePositionTask = (taskId: number) => {
    setPositionTaskStates((prevStates) => ({
      ...prevStates,
      [taskId]: !prevStates[taskId],
    }));
  };

  function isMissing(value: any) {
    return !value;
  }

  

  async function handleTrashDelete(taskItemObj: any) {
    try {
      setLoading(true);
      if (taskItemObj.id && taskItemObj.task_id) {
        const result = await deleteTaskItem({
          id: taskItemObj.id,
          task_id: taskItemObj.task_id,
        });
        if (result.error) throw new Error(result.message);
        removeItemOfList(taskItemObj.id);
        reloadPagePercent(result.data, taskItemObj);
        deleteItemTaskWS({
          description: "Um item foi removido.",
          itemUp: taskItemObj.id,
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

  function listWithUser() {
    return getCompleteUserList(props.details.data?.task_user, getUser, task, users);
  }

  async function updatePositionTaskItem(item: { id: number, next_or_previous: "next" | "previous" }) {
    const value: { task_id: number, id: number, next_or_previous: "next" | "previous" } = { task_id: task.id ?? 0, id: item.id, next_or_previous: item.next_or_previous };
    await fetchData({ method: "PUT", params: value, pathFile: "GTPP/TaskItem.php", exception: ["no data"], urlComplement: "" });
  }
  
  const assinatura = userState.loadingList?.listTask?.assigned_to;

  return (
    <div ref={containerTaskItemsRef} className="overflow-auto rounded flex-grow-1">
      <ModalEditTask 
        userList={listWithUser()} 
        onEditTask={onEditTask} 
        onClose={() => setOnEditTask(false)} 
        isObservation={isObservation} 
        setIsObservation={setIsObservation} 
        editTask={editTask}
        setEditTask={setEditTask}
      />

      <ModalConfirm isOpen={isTrashDelete} onCancel={async () => setIsTrashDelete(false)} onSave={async () => {
        await handleTrashDelete(taskToDelete);
        setIsTrashDelete(false);
      }} title="Atenção" children="Deseja apagar esse conteúdo?" cancelText="Voltar" saveText="Confirmar" />
      
      {showUserLinkedList && <UserLinkingList 
        getUser={getUser} 
        setUserState={setUserState} 
        signature={assinatura} 
        updatedAddUserTaskItem={updatedAddUserTaskItem}
        userState={userState} />}

      <div>
        {showChat && (
          <SocialCommentFeed 
            key={editTask?.id}
            userList={listWithUser()} 
            editTask={editTask} 
            onClose={() => {
              setShowChat(false)
            }} 
          />
        )}

        <TaskItemList
          props={props}
          users={users}
          getUser={getUser}
          onScrollDown={onScrollDown}
          positionTaskStates={positionTaskStates}
          showChat={showChat}
          subTask={subTask}
          taskDetails={taskDetails}
          updateCommentCount={updateCommentCount}
          userLog={userLog}
          userState={userState}
          setShowUserLinkedList={setShowUserLinkedList}
          setTaskDetails={setTaskDetails}
          checkedItem={checkedItem}
          closeObservation={closeObservation}
          isMissing={isMissing}
          setEditTask={setEditTask}
          setIsTrashDelete={setIsTrashDelete}
          setOnEditTask={setOnEditTask}
          setOnScrollDown={setOnScrollDown}
          setShowChat={setShowChat}
          setTaskToDelete={setTaskToDelete}
          setUserState={setUserState}
          updateItemTaskFile={updateItemTaskFile}
          updatePositionTaskItem={updatePositionTaskItem}
          updatedAddUserTaskItem={updatedAddUserTaskItem}
          togglePositionTask={togglePositionTask}
        />
      </div>
    </div>
  );
  
  function closeObservation(taskObj: any) {
    setSubtask((prev) => ({ ...prev, idSubTask: taskObj.id, openDialog: !prev.openDialog }));
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