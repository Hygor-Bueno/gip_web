import React, { useState } from "react";
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
import AttachmentFile from "../../../../Components/Attachment/AttachmentFile";
import { handleNotification } from "../../../../Util/Utils";
import ButtonIcon from "../Button/ButtonIcon/btnicon";

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

  const { taskDetails, task, stopAndToBackTask, handleAddTask, updateItemTaskFile } = useWebSocket();

  const [valueNewTask, setValueNewTask] = useState("");
  const [valueTask, setValueTask] = useState(true);
  const [expand, setExpand] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState("");
  const [isQuest, setIsQuest] = useState(0);

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

  const buttonConfig: any = {
    1: { color: "danger", icon: "power-off", description: "Parar tarefas" },
    2: { color: "danger", icon: "power-off", description: "Parar tarefas" },
    3: { color: "success", icon: "check", description: "Deseja finalizar a tarefa?" },
    4: { color: "success", icon: "power-off", description: "Retomar tarefas" },
    5: { color: "dark", icon: "clock", description: "Quantos dias precisa?" },
    6: { color: "dark", icon: "arrow-left", description: "Deseja retomar a tarefa?" }
  };

  const modalStateConfig: any = {
    1: { type: "text", title: "Alterar tarefa para o estado Parado (informe o motivo)?" },
    2: { type: "text", title: "Alterar tarefa para o estado Parado (informe o motivo)?" },
    3: { type: null, title: "Deseja finalizar essa tarefa?" },
    4: { type: "text", title: "Por quê deseja reabrir a tarefa?" },
    5: { type: "number", title: "Insira o total de dias que você precisa." },
    6: { type: null, title: "Deseja mesmo retomar a tarefa?" }
  };

  const currentButton = buttonConfig[task.state_id ?? 0];
  const modalConfig = modalStateConfig[task.state_id ?? 0] || {};

  const resetPanels = () => {
    setListTask((prev) => ({
      ...prev,
      isChat: false,
      isCompShopDep: false,
      isAttachment: false,
      isObservable: false,
      isQuastion: false
    }));
  };

  const toggleModal = () => {
    setListTask((prev) => ({
      ...prev,
      openModalQuastionTask: !prev.openModalQuastionTask
    }));
  };

  const insertItemTask = async () => {
    await handleAddTask(valueNewTask, String(task.id ?? 0), isQuest, attachmentFile);
    setValueNewTask("");
    setAttachmentFile("");
    setIsQuest(0);
  };

  const handleStopTask = () => {
    try {
      if (task.state_id !== 3 && !ListTask.description) {
        throw new Error("Preencha o campo obrigatório");
      }

      let resource: string | null = null;
      let date: string | null = null;

      if (task.state_id === 5) {
        resource = "";
        date = ListTask.description;
      } else if (task.state_id !== 4) {
        resource = ListTask.description;
      }

      stopAndToBackTask(task.id ?? 0, resource, date, task);

      toggleModal();

    } catch (error: any) {
      handleNotification("Atenção!", error.message, "danger");
    }
  };

  return (
    <div className="d-flex flex-column h-100 p-2">

      <div className="d-flex justify-content-between align-items-center" style={{ height: "10%" }}>

        <AvatarGroup
          dataTask={task}
          users={taskDetails.data ? taskDetails.data.task_user : []}
        />

        <div>

          {ListTask.openModalQuastionTask && (
            <MessageModal
              typeInput={modalConfig.type}
              title={modalConfig.title}
              openClock={ListTask}
              isInput={task.state_id !== 3}
              onChange={(e: any) =>
                setListTask((prev) => ({
                  ...prev,
                  description: e.target.value
                }))
              }
              onClose={toggleModal}
              onClick={handleStopTask}
            />
          )}

          {currentButton && (
            <div className="cursor-pointer" onClick={toggleModal}>
              <ButtonIcon {...currentButton} />
            </div>
          )}

        </div>

      </div>

      <div className="d-flex flex-column justify-content-between" style={{ height: "90%" }}>

        <FormTextAreaDefault
          task={task}
          details={props?.details?.data}
          disabledForm={props.disabledForm}
        />

        <div className={expand ? "expandFullScreen" : "d-flex flex-column h-75"}>

          <div className="d-flex justify-content-between gap-2 my-2">

            <div className="d-flex flex-wrap gap-2">

              <ButtonIcon
                color="secondary"
                icon="tasks"
                description="Tarefas"
                onClick={() => {
                  resetPanels();
                  setValueTask(true);
                }}
              />

              <ButtonIcon
                color="secondary"
                icon="shop"
                description="Comp/Loj/Dep"
                onClick={() => {
                  resetPanels();
                  setListTask((prev) => ({
                    ...prev,
                    isCompShopDep: !prev.isCompShopDep
                  }));
                  setValueTask(false);
                }}
              />

            </div>

            <ButtonIcon
              color="secondary"
              icon={expand ? "down-left-and-up-right-to-center" : "up-right-and-down-left-from-center"}
              description={expand ? "Retrair" : "Expandir"}
              onClick={() => setExpand(!expand)}
            />

          </div>

          {valueTask && (
            <>
              <SubTasksWithCheckbox
                props={props}
                users={props.details.data?.task_user}
                message={props.message}
                onTaskChange={(e) => console.log(e)}
                allData={props}
              />

              <div className="d-flex justify-content-between align-items-center GIPP-section my-2">

                <div className="d-flex justify-content-around col-md-3">

                  <ButtonIcon
                    description=""
                    color="success"
                    icon="arrow-right"
                    onClick={insertItemTask}
                  />

                  <AttachmentFile
                    reset={!attachmentFile}
                    file={0}
                    onClose={(value) => setAttachmentFile(value)}
                    updateAttachmentFile={updateItemTaskFile}
                  />

                  <button
                    className="btn btn-primary"
                    title="Marca como questão?"
                    onClick={() => setIsQuest(isQuest === 0 ? -1 : 0)}
                  >
                    <i className={`fa-solid fa-question text-white ${isQuest === 0 ? "opacity-75" : ""}`}></i>
                  </button>

                </div>

                <div className="col-md-9">

                  <input
                    type="text"
                    className="form-control"
                    value={valueNewTask}
                    onChange={(e) => setValueNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && insertItemTask()}
                  />

                </div>

              </div>
            </>
          )}

          {!valueTask && (
            <div className="d-flex flex-column">
              <SelectTaskItem data={task} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ModalDefault: React.FC<TaskItem> = (props) => {

  const [_, seNotificationMessage] = useState({
    message: "",
    error: true
  });

  const { task, taskPercent } = useWebSocket();

  return (
    <div className="zIndex99 row">

      <div className="col-11 col-sm-10 col-md-8 col-lg-8 col-xl-6 h-100 position-relative modal-flex">

        <section className="header-modal-default my-2">
          <HeaderModal
            color="danger"
            description={task.description ?? ""}
            taskParam={task}
            onClick={props.close_modal}
          />
          <ProgressBar progressValue={taskPercent} colorBar="#006645" />
        </section>

        <section className="body-modal-default flex-grow-1" style={{ overflow: "auto", backgroundColor: "white" }}>
          <BodyDefault message={seNotificationMessage} details={props.details} />
        </section>

      </div>

    </div>
  );
};

export default ModalDefault;