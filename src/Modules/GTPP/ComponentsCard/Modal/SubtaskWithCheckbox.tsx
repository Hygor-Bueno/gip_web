import React, { useEffect, useRef, useState } from "react";
import { InputCheckbox } from "../../../../Components/CustomForm";
import { SubTasksWithCheckboxProps } from "./Types";
import { useWebSocket } from "../../Context/GtppWsContext";
import ButtonIcon from "../Button/ButtonIcon/btnicon";
import AnexoImage from "../../../../Components/AttachmentFile";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { Connection } from "../../../../Connection/Connection";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import ModalEditTask from "./ModalEditTask";

interface iSubTask {
  isObservable: boolean;
  isQuestion: boolean;
  isAttachment: boolean;
  text: string;
  idSubTask: string | number;
  openDialog: boolean
}

const SubTasksWithCheckbox: React.FC<SubTasksWithCheckboxProps> = () => {
  const { 
    checkedItem,
    changeObservedForm,
    task, 
    taskDetails, 
    setTaskDetails, 
    reloadPagePercent, 
    deleteItemTaskWS, 
    updatedForQuestion, 
    updateItemTaskFile 
  } = useWebSocket();
  
  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();
  const [editTask, setEditTask] = useState<any>("");
  const [isObservation, setIsObservation] = useState<boolean>(false);
  const [positionTaskStates, setPositionTaskStates] = useState<{ [key: number]: boolean }>({});
  const [onScrollDown, setOnScrollDown] = useState<boolean>(true);
  const [onEditTask, setOnEditTask] = useState<boolean>(false);
  const containerTaskItemsRef = useRef<HTMLDivElement>(null);

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

  function changePositionItem(next: boolean, id: number) {
    if (taskDetails.data && taskDetails.data.task_item) {
      const items = taskDetails.data.task_item;

      // Encontra o índice do item com o ID fornecido
      const currentIndex = items.findIndex(item => item.id === id);

      // Se o item não for encontrado, retorne
      if (currentIndex === -1) return;

      // Determina a nova posição
      const newIndex = next ? currentIndex + 1 : currentIndex - 1;

      // Verifica se a nova posição está dentro dos limites do array
      if (newIndex < 0 || newIndex >= items.length) return;

      // Remove o item da posição atual
      const [movedItem] = items.splice(currentIndex, 1);

      // Insere o item na nova posição
      items.splice(newIndex, 0, movedItem);

      setTaskDetails({ ...taskDetails });
    }
  }
  async function updatePositionTaskItem(item: { id: number, next_or_previous: "next" | "previous" }) {
    const value: { task_id: number, id: number, next_or_previous: "next" | "previous" } = { task_id: task.id, id: item.id, next_or_previous: item.next_or_previous };
    await fetchData({method: "PUT", params: value, pathFile: "GTPP/TaskItem.php", exception: ["no data"], urlComplement: ""});
  }

  return (
    <div ref={containerTaskItemsRef} className="overflow-auto rounded flex-grow-1">
      <div>
        <ModalEditTask onEditTask={onEditTask} onClose={() => setOnEditTask(false)} isObservation={isObservation} setIsObservation={setIsObservation} editTask={editTask} setEditTask={setEditTask} />

        {(taskDetails.data?.task_item || []).map((task, index: number) => (
          <div
            key={task.id}
            className={"d-flex justify-content-between align-items-center mb-1 bg-light border w-100 p-1 rounded overflow-auto"}
          >
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
            <div className="GIPP-section d-flex justify-content-between align-items-center w-100">
              <div className="GIPP-section-sm">
                <div className="text-wrap text-break">
                  <InputCheckbox
                    label={task.description}
                    task={task}
                    onChange={checkedItem}
                    onPosition={() => {
                      togglePositionTask(task.id || 0);
                      setOnScrollDown(!onScrollDown)
                    }}
                    yesNo={task.yes_no || 0}
                    checked={task.check || false}
                    key={index}
                    id={(task.id || "0").toString()}
                    order={task.order || 0}
                  />
                </div>
              </div>

              <div className="GIPP-aside-sm d-flex justify-content-end gap-2 my-2">
                {task.note &&
                  <ButtonIcon title="Visualizar observação" color="primary" icon="circle-info" description="" onClick={() => {
                    closeObservation(task);
                  }} />
                }
                <ButtonIcon title="Observação" color="primary" icon="pencil" description="" onClick={() => {
                  setEditTask(task);
                  setOnEditTask(true);
                }} />
                <ButtonIcon title="Observação" color="danger" icon="trash" description="" onClick={async () => {
                  try {
                    setLoading(true);
                    if (task.id && task.task_id) {
                      const result = await deleteTaskItem({ id: task.id, task_id: task.task_id });
                      if (result.error) throw new Error(result.message);
                      removeItemOfList(task.id);
                      reloadPagePercent(result.data, task);
                      deleteItemTaskWS({
                        description: "Um item foi removido.",
                        itemUp: task.id,
                        percent: parseInt(result.data.percent),
                        remove: true
                      });
                    }
                  } catch (error: any) {
                    console.error(error.message);
                  } finally {
                    setLoading(false);
                  }
                }} />
                <AnexoImage item_id={task.id || 0} file={task.file || 0} updateAttachmentFile={updateItemTaskFile} />
              </div>
            </div>
          </div>
        ))}
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