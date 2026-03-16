import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../Context/GtppWsContext";
import { InputCheckButton } from "../../../../Components/CustomButton";
import CardUser from "../../../CLPP/Components/CardUser";
import User from "../../../../Class/User";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import { DateConverter } from "../../Class/DataConvert";

// ==========================================
// INTERFACES FORTES
// ==========================================
interface ITaskParam {
  id: number | string;
  priority: number | string;
  description?: string;
  [key: string]: unknown;
}

interface HeaderModalProps {
  color: string;
  description: string;
  taskParam?: ITaskParam;
  onClick?: () => void;
}

const HeaderModal: React.FC<HeaderModalProps> = ({
  color,
  taskParam,
  description,
  onClick,
}) => {
  // ==========================================
  // 1. STATES & REFS
  // ==========================================
  const [desc, setDesc] = useState<string | null>(description || "");
  const [habilitEditionOfText, setHabilitEditionOfText] = useState<boolean>(false);
  const [detailUser, setDetailUser] = useState<boolean>(false);
  const [detailTask, setDetailTask] = useState<boolean>(false);
  const [reasonCancellation, setReasonCancellation] = useState<string>('');
  const [modalConfirmCancel, setModalConfirmCancel] = useState<boolean>(false);
  const [userTask, setUserTask] = useState<User>();
  const titleTaskInput = useRef<HTMLInputElement>(null);

  // ==========================================
  // 2. CONTEXTS
  // ==========================================
  const { getTask, task, loadTasks, setGetUser } = useWebSocket();
  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  // ==========================================
  // 3. REGRAS DE NEGÓCIO E UI
  // ==========================================
  
  // Array com os IDs dos status que NÃO permitem cancelamento.
  // IMPORTANTE: Sabemos que 7 é Cancelado. Substitua o 3 e 4 pelos IDs corretos de "Feito" e "Parado" do seu Banco de Dados!
  const invalidStatesForCancel = [3, 4, 7]; 
  const isTaskExpired = DateConverter.isAfter(new Date(), task.final_date);
  
  // Apenas mostra o botão se não estiver expirada E não estiver em um status bloqueado
  const showCancelButton = !isTaskExpired && !invalidStatesForCancel.includes(task.state_id);

  // ==========================================
  // 4. EFFECTS
  // ==========================================
  useEffect(() => {
    setDesc(description);
  }, [description]);

  useEffect(() => {
    if (titleTaskInput.current) {
      habilitEditionOfText 
        ? titleTaskInput.current.focus() 
        : titleTaskInput.current.blur();
    }
  }, [habilitEditionOfText]);

  useEffect(() => {
    if (task?.user_id) {
      (async () => loadNameUserTask())();
    }
  }, [task?.user_id]);

  // ==========================================
  // 5. HANDLERS & LOGIC
  // ==========================================
  async function loadNameUserTask() {
    try {
      setLoading(true);
      const user = new User({ id: task.user_id });
      await user.loadInfo(true);
      setGetUser(user);
      setUserTask(user);
    } catch (error) {
      console.error("Erro ao carregar usuário da tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendPut(newTitle: string) {
    if (!taskParam) return; 

    try {
      const req = await fetchData({ 
        method: "PUT", 
        params: { id: taskParam.id, priority: taskParam.priority, description: newTitle }, 
        pathFile: "GTPP/Task.php" 
      });
      
      if (req.error) throw new Error(req.message);
      
      setDesc(newTitle);
      await loadTasks(); 

    } catch (error: any) {
      console.error("Erro ao atualizar a tarefa:", error.message);
      setDesc(description); 
    }
  }

  async function cancelTask(reason: string) {
    try {
      const cancelDateStr = DateConverter.toDatabaseFormat(new Date());
      await fetchData({ 
        method: "PUT", 
        params: { id: task.id, state_id: 7, description: reason, canceled_at: cancelDateStr }, 
        pathFile: "GTPP/Task.php" 
      });
      await loadTasks();
      if (onClick) onClick();
      setModalConfirmCancel(false);
    } catch (error) {
      console.error("Erro ao cancelar a tarefa:", error);
    }
  }

  // ==========================================
  // 6. SUB-RENDERS
  // ==========================================
  function DetailsTask() {
    const diffDays = DateConverter.getDaysDifference(new Date(), task.final_date);
    let timeStatus = null;
    
    if (diffDays !== null) {
      if (diffDays < 0) {
        timeStatus = <span className="badge bg-danger ms-2" style={{ fontSize: '0.8em' }}>Atrasado {Math.abs(diffDays)} dia(s)</span>;
      } else if (diffDays === 0) {
        timeStatus = <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.8em' }}>Vence hoje!</span>;
      } else {
        timeStatus = <span className="badge bg-info ms-2" style={{ fontSize: '0.8em' }}>Faltam {diffDays} dia(s)</span>;
      }
    }

    return (
      <div className="d-flex flex-column h-100 border p-2 my-2 rounded cardContact">
        <span className="d-flex justify-content-between">
          <strong>Data inicial:</strong>
          <div>{`${DateConverter.formatDate(task.initial_date)}`}</div>
        </span>
        <span className="d-flex justify-content-between align-items-center">
          <strong>Data Final:</strong>
          <div className="d-flex align-items-center">
            {timeStatus} {`${DateConverter.formatDate(task.final_date)}`}
          </div>
        </span>
        <span className="d-flex justify-content-between">
          <strong>Status:</strong>
          <div>{task.state_description}</div>
        </span>
      </div>
    );
  }

  // ==========================================
  // 7. MAIN RENDER
  // ==========================================
  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center pt-2 px-2">
        <button 
          title="Habilitar ou desabilitar edição do texto" 
          className={`fa p-1 me-2 btn btn-outline-${habilitEditionOfText ? "success fa-check" : "danger fa-pencil"}`} 
          onClick={() => setHabilitEditionOfText(!habilitEditionOfText)}
        />
        
        <input
          ref={titleTaskInput}
          value={desc || ""}
          disabled={!habilitEditionOfText}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={async (e) => await sendPut(e.target.value)}
          className="bg-transparent w-100 font-weight-bold"
          style={{ border: "none", fontWeight: "bold" }}
        />
        
        <div className="d-flex gap-2 align-items-center">
          <InputCheckButton nameButton="Dados do criador da tarefa" inputId={`task_details_user_${task.user_id}`} onAction={async (e: boolean) => setDetailUser(e)} labelIconConditional={["fa-solid fa-chevron-down", "fa-solid fa-chevron-up"]} />
          <InputCheckButton nameButton="Detalhes da tarefa." inputId={`task_details_${task.user_id}`} onAction={async (e: boolean) => setDetailTask(e)} labelIcon={"fa-solid fa-circle-info"} highlight={true} />
          
          {/* O botão agora só é renderizado se a variável showCancelButton for verdadeira */}
          {showCancelButton && (
            <button 
              title="Cancelar a tarefa!" 
              className="btn p-1 border-none" 
              onClick={() => setModalConfirmCancel(true)}
            >
              <i className="fa-solid fa-ban text-danger"></i>
            </button>
          )}
          
          <button onClick={onClick || (() => console.warn("Valor indefinido!"))} className={`btn btn-${color} text-light fa fa-x`} aria-label="Fechar modal" />
        </div>

        {modalConfirmCancel && (
          <div style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, maxWidth: "300px" }} className="d-flex flex-column position-absolute p-2 rounded shadow-lg bg-dark w-75">
            <header className="w-100 d-flex flex-column align-items-center">
              <h1 className="text-white fs-5">Cancelar tarefa</h1>
              <span className="text-white text-center" style={{ fontSize: '0.9em' }}>Você está prestes a cancelar essa tarefa, informe o motivo:</span>
            </header>
            <input value={reasonCancellation} className="form-control my-2" placeholder="Informe o motivo" type="text" onChange={(e) => setReasonCancellation(e.currentTarget.value)} />
            <div className="d-flex w-100 align-items-center justify-content-around">
              <button style={{ width: "40%" }} title="Confirmar cancelamento" className="btn btn-success my-2" onClick={() => cancelTask(reasonCancellation)}>Confirmar</button>
              <button style={{ width: "40%" }} title="Fechar modal cancelar tarefa." className="btn btn-danger my-2" onClick={() => setModalConfirmCancel(false)}>Fechar</button>
            </div>
          </div>
        )}
      </div>

      {!detailUser && <h6 className="mx-2 text-muted mt-2" style={{ fontSize: '0.9em' }}>Por: {userTask?.name}</h6>}
      {detailUser && userTask && <CardUser {...userTask} name={userTask.name} />}
      {detailTask && DetailsTask()} 
    </div>
  );
};

export default HeaderModal;