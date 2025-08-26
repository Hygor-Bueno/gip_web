import React, { useEffect, useState } from "react";
import "./style.css";
import AvatarGroup from "../Avatar/AvatarGroup/AvatarGroup";
import { TaskItem } from "./Types";
import HeaderModal from "./Header";
import ProgressBar from "./Progressbar";
import FormTextAreaDefault from "./FormTextAraeaDefault";
import SubTasksWithCheckbox from "./SubtaskWithCheckbox";
import SelectTaskItem from "./SelectTaskItem";
import { useWebSocket } from "../../Context/GtppWsContext";
import MessageModal from "../ModalMessage/messagemodal";
import ButtonIcon from "../Button/ButtonIcon/btnicon";
import AttachmentFile from "../../../../Components/AttachmentFile";
import "./style.css";
import { handleNotification } from "../../../../Util/Util";

interface BodyDefaultProps {
  disabledForm?: boolean;
  renderList?: any;
  listSubTasks?: any;
  taskCheckReset?: any;
  getPercent?: any;
  reset?: any;
  details?: any;
  message?: any;
}

interface ValueStateTask {
  stopTask: boolean;
  openModalQuastionTask: boolean;
  description: string;
  isCompShopDep: boolean;
  isChat: boolean;
  isObservable: boolean;
  isQuastion: boolean;
  isAttachment: boolean;
}

const BodyDefault: React.FC<BodyDefaultProps> = (props) => {
  const [valueNewTask, setValueNewTask] = useState<string>("");
  const [valueTask, setValueTask] = useState<boolean>(true);
  const [expand, setExpand] = useState<boolean>(false);
  const [attachmentFile, setAttachmentFile] = useState<string>('');
  const [isQuest, setIsQuest] = useState<number>(0);
  const {taskDetails, task, stopAndToBackTask, handleAddTask, updateItemTaskFile, setOpenCardDefault} = useWebSocket();
  const currentTask = task;

  const [ListTask, setListTask] = useState<ValueStateTask>({
    stopTask: false,
    openModalQuastionTask: false,
    description: "",
    isCompShopDep: false,
    isChat: false,
    isObservable: false,
    isQuastion: false,
    isAttachment: false,
  });

  const buttonConfig:any = {
    1: { color: "danger", icon: "power-off", description: "Parar tarefas" },
    2: { color: "danger", icon: "power-off", description: "Parar tarefas" },
    3: { color: "success", icon: "check", description: "Deseja finalizar a tarefa?" },
    4: { color: "success", icon: "power-off", description: "Retomar tarefas" },
    5: { color: "dark", icon: "clock", description: "Quantos dias precisa?" },
    6: { color: "dark", icon: "arrow-left", description: "Deseja retomar a tarefa?" }
  }

  const currentButton = buttonConfig[currentTask.state_id];

  return (
    <div className="d-flex flex-column h-100 p-2">
      <div style={{ height: "10%" }} className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <AvatarGroup
            dataTask={currentTask}
            users={taskDetails.data ? taskDetails.data?.task_user : []} />
        </div>
        <div className="">
          {ListTask.openModalQuastionTask ? (
            <MessageModal
              typeInput={
                currentTask.state_id == 1 || currentTask.state_id == 2
                  ? "text"
                  : currentTask.state_id == 5
                    ? "number"
                    : null
              }
              title={
                currentTask.state_id == 1 || currentTask.state_id == 2
                  ? "Alterar tarefa para o estado Parado (informe o motivo)?"
                  : currentTask.state_id == 4
                    ? "Por quê deseja reabrir a tarefa?"
                    : currentTask.state_id == 3
                      ? "Deseja finalizar essa tarefa?"
                      : currentTask.state_id == 5
                        ? "Insira o total de dias que você precisa."
                        : currentTask.state_id == 6
                          ? "Deseja mesmo retomar a tarefa?"
                          : null
              }
              onChange={(e: any) => {
                setListTask((prev) => {
                  return ({
                    ...prev,
                    description: e.target.value,
                  })
                });
              }}
              onClose={() =>
                setListTask((prev) => ({...prev, openModalQuastionTask: !prev.openModalQuastionTask }))
              }
              openClock={ListTask}
              isInput={currentTask.state_id != 3}
              onClick={() => {
                try {
                  if (currentTask.state_id != 3 && ListTask.description == '') throw new Error("Preencha o campo obrigatório");
                  let object: { taskId: number, resource: string | null, date: string | null, taskList: any } = {
                    taskId: currentTask?.id,
                    resource: null,
                    date: null,
                    taskList: currentTask
                  };

                  switch (currentTask.state_id) {
                    case 4:
                      object.resource = null;
                      object.date = null;
                      break;
                    case 5: 
                      object.resource = "";
                      object.date = ListTask.description;
                      break;
                    default:
                      object.resource = ListTask.description;
                      object.date = null;
                      break;
                  }

                  stopAndToBackTask(object.taskId, object.resource, object.date, object.taskList);
                  setListTask((prev) => ({...prev, openModalQuastionTask: !prev.openModalQuastionTask,}));
                } catch (error:any) {
                  handleNotification("Atenção!",error.message,"danger");
                }
              }}
            />
          ) : null}
          <div>
            <div
              className="cursor-pointer"
              onClick={() => {
                setListTask((prev) => ({...prev, openModalQuastionTask: !prev.openModalQuastionTask}));
              }}>
              {currentButton && (
                <ButtonIcon 
                  color={currentButton.color}
                  icon={currentButton.icon}
                  description={currentButton.description}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: "90%" }} className="d-flex flex-column justify-content-between">
        <FormTextAreaDefault
          task={currentTask}
          details={props?.details?.data}
          disabledForm={props.disabledForm}
        />
        <div className={expand ? "expandFullScreen" : "d-flex flex-column h-75"}>
          <div className="d-flex justify-content-between gap-2 my-2">
            <div className="d-flex flex-wrap gap-2 my-2">
              <ButtonIcon
                onClick={() => {
                  setListTask((prev) => ({
                    ...prev,
                    isChat: false,
                    isCompShopDep: false,
                    isAttachment: false,
                    isObservable: false,
                    isQuastion: false,
                  }));
                  setValueTask(true);
                }}
                color="secondary"
                icon="tasks"
                description="Tarefas"
              />
              <ButtonIcon
                onClick={() => {
                  setListTask((prev) => ({
                    ...prev,
                    isCompShopDep: !prev.isCompShopDep,
                    isChat: false,
                    isAttachment: false,
                    isObservable: false,
                    isQuastion: false,
                  }));
                  setValueTask(false);
                }}
                color="secondary"
                icon="shop"
                description="Comp/Loj/Dep"
              />
            </div>
            <div className="d-flex -2 my-2">
              <ButtonIcon
                onClick={() => {
                  setExpand(!expand);
                }}
                color="secondary"
                icon={expand ? "down-left-and-up-right-to-center" : "up-right-and-down-left-from-center"}
                description={expand ? "Retrair" : "Expandir"}
              />
            </div>
          </div>
          {valueTask && (
            <SubTasksWithCheckbox
              message={props.message}
              onTaskChange={(e) => console.log(e)}
              allData={props}
            />
          )}

          {valueTask && (
            <div className="d-flex justify-content-between align-items-center GIPP-section my-2">
              <div className="d-flex justify-content-around col-12 col-sm-4 col-md-3 ">
                <ButtonIcon
                  color="success"
                  description=""
                  icon="arrow-right"
                  onClick={async () => { await insertItemTask() }}
                />
                <AttachmentFile 
                  reset={attachmentFile ? false : true}
                  file={0}
                  onClose={(value) => setAttachmentFile(value)}
                  updateAttachmentFile={updateItemTaskFile}
                />
                <button title="Marca como questão?" className={`btn btn-primary fa-solid fa-question ${isQuest == 0 ? 'opacity-25' : 'opacity-100'}`} onClick={() => { 
                  setIsQuest(isQuest == 0 ? -1 : 0) 
                }}></button>
              </div>
              <div className="col-12 col-sm-8 col-md-9 my-2">
                <input
                  type="text"
                  className="form-control d-block"
                  onChange={(e) => setValueNewTask(e.target.value)}
                  onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key.includes("Enter")) {
                      await insertItemTask();
                    }
                  }}
                  value={valueNewTask}
                />
              </div>
            </div>
          )}
          {!valueTask && (
            <div className={"col-md-12 d-flex flex-column justify-content-between"}>
              <SelectTaskItem data={currentTask} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
  async function insertItemTask() {
    await handleAddTask(valueNewTask, currentTask.id, isQuest, attachmentFile);
    setValueNewTask("");
    setAttachmentFile("");
    setIsQuest(0);
  }
};

const ModalDefault: React.FC<TaskItem> = (props) => {
  const [_, seNotificationMessage] = useState<{
    message: string;
    error: boolean;
  }>({
    message: "",
    error: true,
  });

  const { task, taskPercent } = useWebSocket();

  return (
    <div className="zIndex99 row">
      <div className="col-11 col-sm-10 col-md-8 col-lg-8 col-xl-6 h-100 position-relative" style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: "calc((1vh + 1vw) / 2)"
      }}>

        <section className="header-modal-default my-2">
          <HeaderModal color="danger" description={task.description} taskParam={task} onClick={props.close_modal} />
          <ProgressBar progressValue={taskPercent} colorBar="#006645" />
        </section>
        <section style={{ overflow: "auto", backgroundColor: 'white' }} className="d-felx body-modal-default flex-grow-1">
          <BodyDefault message={seNotificationMessage} details={props.details} />
        </section>
      </div>
    </div>
  );
};

export default ModalDefault;
