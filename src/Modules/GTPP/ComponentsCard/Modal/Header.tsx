import React, { useEffect, useRef, useState } from "react";
import { Connection } from "../../../../Connection/Connection";
import { useWebSocket } from "../../Context/GtppWsContext";
import { InputCheckButton } from "../../../../Components/CustomButton";
import CardUser from "../../../CLPP/Components/CardUser";
import User from "../../../../Class/User";
import { convertdate } from "../../../../Util/Util";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import { DateConverter } from "../../Class/DataConvert";

interface HeaderModalProps {
  color: string;
  description: string;
  taskParam?: any;
  onClick?: () => void;
}

const HeaderModal: React.FC<HeaderModalProps> = ({
  color,
  taskParam,
  description,
  onClick,
}) => {
  const [desc, setDesc] = React.useState<string | null>(description || "");
  const [habilitEditionOfText, setHabilitEditionOfText] = useState<boolean>(false);
  const [detailUser, setDetailUser] = useState<boolean>(false);
  const [detailTask, setDetailTask] = useState<boolean>(false);
  const [reasonCancellation, setReasonCancellation] = useState<string>('');
  const [modalConfirmCancel, setModalConfirmCancel] = useState<boolean>(false);
  const [userTask, setUserTask] = useState<User>();
  const titleTaskInput = useRef<HTMLInputElement>(null);
  const { getTask, task, loadTasks } = useWebSocket();
  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  React.useEffect(() => {
    setDesc(description);
  }, [description]);

  async function sendPut(newTitle: string) {
    try {
      const req: any = await fetchData({ method: "PUT", params: { id: taskParam.id, priority: taskParam.priority, description: newTitle }, pathFile: "GTPP/Task.php" })
      if (req.error) throw new Error(req.message);
      setDesc(newTitle);
      getTask.filter(item => item.id == task.id)[0].description = newTitle;
    } catch (error: any) {
      console.error(error.message)
    }
  }
  useEffect(() => {
    if (titleTaskInput.current) {
      if (habilitEditionOfText) {
        titleTaskInput.current.focus();
      } else {
        titleTaskInput.current.blur();
      }
    }
    (async()=>loadNameUserTask())();
  }, [habilitEditionOfText]);

  function DetailsTask() {
    return (
      <div className="d-flex flex-column h-100 border p-2 my-2 rounded cardContact">
        <span className="d-flex justify-content-between">
          <strong>Data inicial:</strong>
          <div>{`${DateConverter.formatDate(task.initial_date)}`}</div>
        </span>
        <span className="d-flex justify-content-between">
          <strong>Data Final:</strong>
          <div>{`${DateConverter.formatDate(task.final_date)}`}</div>
        </span>
        <span className="d-flex justify-content-between">
          <strong>Status:</strong>
          <div>{task.state_description}</div>
        </span>
      </div>
    );
  }

  async function loadNameUserTask() {
    try {
      setLoading(true);
      const user = new User({ id: task.user_id });
      await user.loadInfo(true);
      setUserTask(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center pt-2 px-2">
        <button title="Habilitar ou desabilitar edição do texto" className={`fa  p-1 me-2 btn btn-outline-${habilitEditionOfText ? "success fa-check" : "danger fa-pencil"}`} onClick={() => {
          setHabilitEditionOfText(!habilitEditionOfText);
        }
        }></button>
        <input
          ref={titleTaskInput}
          value={desc || ""}
          disabled={!habilitEditionOfText}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={async (e) => {
            await sendPut(e.target.value);
          }}
          className="bg-transparent w-100 font-weight-bold"
          style={{ border: "none", fontWeight: "bold" }}
        ></input>
        <div className="d-flex gap-2">
          <InputCheckButton nameButton="Dados do criador da tarefa" inputId={`task_details_user_${task.user_id}`} onAction={async (e: boolean) => {setDetailUser(e);}} labelIconConditional={["fa-solid fa-chevron-down", "fa-solid fa-chevron-up"]} />
          <InputCheckButton nameButton="Detalhes da tarefa." inputId={`task_details_${task.user_id}`} onAction={async (e: boolean) => {
            setDetailTask(e);
          }} labelIcon={"fa-solid fa-circle-info"} highlight={true} />
          <button title="Cancelar a tarefa!" className="btn p-1 border-none" onClick={() => setModalConfirmCancel(true)}>
            <i className="fa-solid fa-ban text-danger"></i>
          </button>
          <button
            onClick={onClick || (() => console.warn("Valor indefinido!"))}
            className={`btn btn-${color} text-light fa fa-x`}
            aria-label="Fechar modal"
          />
        </div>
        {modalConfirmCancel ?
          <div style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, maxWidth: "300px" }} className="d-flex flex-column position-absolute p-2 rounded shadow-lg bg-dark w-75">
            <header className="w-100 d-flex flex-column align-items-center">
              <h1 className="text-white">Cancelar tarefa</h1>
              <span className="text-white">Você está prestes a cancelar essa tarefa, informe o motivo?</span>
            </header>
            <input value={reasonCancellation} className="form-control my-2" placeholder="Informe o motivo" type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setReasonCancellation(e.currentTarget.value) }} />
            <div className="d-flex w-100 align-items-center justify-content-around">
              <button style={{ width: "40%" }} title="Confirmar cancelamento" className="btn btn-success my-2" onClick={() => cancelTask(reasonCancellation)}>Confirmar</button>
              <button style={{ width: "40%" }} title="Fechar modal cancelar tarefa." className="btn btn-danger my-2" onClick={() => setModalConfirmCancel(false)}>Fechar</button>
            </div>
          </div>
          : <React.Fragment />
        }
      </div>
      {!detailUser && <h6 className="mx-2 text-muted">Por: {userTask?.name}</h6>}
      {detailUser ? <CardUser {...userTask} name={userTask?.name} /> : <React.Fragment />}
      {detailTask ? <DetailsTask /> : <React.Fragment />}
    </div>
  );

  async function cancelTask(description: string) {
    try {
      await fetchData({ method: "PUT", params: { id: task.id, state_id: 7, description: description }, pathFile: "GTPP/Task.php" });
      await loadTasks();
      if (onClick) onClick();
    } catch (error) {
      console.error(error);
    }
  }
};

export default HeaderModal;
