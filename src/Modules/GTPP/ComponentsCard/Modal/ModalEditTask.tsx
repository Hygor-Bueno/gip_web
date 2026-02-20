import React, { useEffect, useState, useCallback } from "react";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useConnection } from "../../../../Context/ConnContext";
import SocialCommentFeed from "./Comment.tsx/Comment";

export default function ModalEditTask(props: any) {
  const {
    userList,
    onEditTask,
    editTask,
    setEditTask,
    isObservation,
    setIsObservation,
    onClose,
  } = props;

  const [note, setNote] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [confirm, setConfirm] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<null | "switchToDescription" | "switchToObservation">(null);
  const [msgConfirm, setMsgConfirm] = useState<{ title: string; message: string }>({ title: "", message: "" });
  const [isQuest, setIsQuest] = useState<boolean>(false);

  // Estado de comentários centralizado no Modal
  const [comment, setComment] = useState<{ isComment: boolean; data: any[] }>({
    isComment: false,
    data: []
  });

  const { updatedForQuestion, changeObservedForm } = useWebSocket();
  const { fetchData } = useConnection();

  /**
   * Busca comentários na API.
   * Usamos useCallback para que a função possa ser passada via props para o Feed
   * sem causar re-renderizações infinitas.
   */
  const getComment = useCallback(async () => {
    if (!editTask?.id) return;

    try {
      const response = await fetchData({
        method: "GET",
        params: null,
        pathFile: 'GTPP/TaskItemResponse.php',
        urlComplement: `&task_item_id=${editTask.id}`,
        exception: ["No data"]
      });

      if (response && !response.error) {
        setComment(prev => ({
          ...prev,
          data: Array.isArray(response.data) ? response.data : []
        }));
      } else {
        setComment(prev => ({ ...prev, data: [] }));
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    }
  }, [editTask?.id, fetchData]);

  /**
   * Sincroniza os estados locais com a tarefa selecionada
   */
  useEffect(() => {
    if (onEditTask && editTask) {
      setDescription(editTask.description || "");
      setNote(editTask.note || "");
      setIsQuest(editTask.yes_no === 1 || editTask.yes_no === 2 || editTask.yes_no === 3);
      
      // Carrega os comentários ao abrir o modal ou mudar de item
      getComment();
    }
  }, [editTask?.id, onEditTask, getComment]);

  const handleConfirm = () => {
    const value = isObservation ? note : description;
    changeObservedForm(editTask.task_id, editTask.id, value, isObservation);
    
    const updatedTask = { ...editTask, [isObservation ? "note" : "description"]: value };
    setEditTask(updatedTask);

    if (pendingAction === "switchToDescription") {
      setIsObservation(false);
    } else if (pendingAction === "switchToObservation") {
      setIsObservation(true);
    }

    setConfirm(false);
    setPendingAction(null);
  };

  const handleCloseModal = () => {
    setConfirm(false);
    setPendingAction(null);
  };

  console.log(editTask);

  return (
    onEditTask && (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          background: "#00000088",
          top: 0,
          left: 0,
          zIndex: 1000
        }}
      >
        {confirm && (
          <ConfirmModal
            {...msgConfirm}
            onConfirm={handleConfirm}
            onClose={handleCloseModal}
          />
        )}
        
        <div
          style={{ maxHeight: "85%", overflowY: "auto", minWidth: "400px" }}
          className="d-flex flex-column align-items-center bg-white col-11 col-sm-10 col-md-8 col-lg-6 p-4 rounded shadow-lg"
        >
          <header className="d-flex flex-column w-100 border-bottom pb-2">
            <div className="d-flex align-items-center justify-content-between w-100">
              <h4 className="m-0 fw-bold">Editar item da tarefa</h4>
              <button title="Fechar" onClick={onClose} className="btn btn-danger btn-sm rounded-circle">
                <i className="text-white fa-solid fa-x fa p-1"></i>
              </button>
            </div>
            
            <div className="form-check form-switch mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="promoteQuest"
                checked={isQuest}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsQuest(checked);
                  updatedForQuestion({ id: editTask.id, task_id: editTask.task_id, yes_no: checked ? 3 : 0 });
                }}
              />
              <label className="form-check-label small" htmlFor="promoteQuest">
                Promover para questão
              </label>
            </div>
          </header>

          <section className="w-100 flex-grow-1">
            <div className="d-flex mt-3 gap-2">
              <button
                className={`btn btn-sm ${!isObservation && !comment.isComment ? "btn-primary" : "btn-light border"}`}
                onClick={() => {
                  if (editTask.description !== description || editTask.note !== note) {
                    setMsgConfirm({ title: "Atenção", message: "Existem alterações não salvas. Deseja continuar?" });
                    setPendingAction("switchToDescription");
                    setConfirm(true);
                  } else {
                    setIsObservation(false);
                    setComment(prev => ({ ...prev, isComment: false }));
                  }
                }}
              >
                Descrição
              </button>

              <button
                className={`btn btn-sm ${isObservation && !comment.isComment ? "btn-primary" : "btn-light border"}`}
                onClick={() => {
                  if (editTask.description !== description || editTask.note !== note) {
                    setMsgConfirm({ title: "Atenção", message: "Existem alterações não salvas. Deseja continuar?" });
                    setPendingAction("switchToObservation");
                    setConfirm(true);
                  } else {
                    setIsObservation(true);
                    setComment(prev => ({ ...prev, isComment: false }));
                  }
                }}
              >
                Observação
              </button>

              <button
                className={`btn btn-sm ${comment.isComment ? "btn-primary" : "btn-light border"}`}
                onClick={() => setComment(prev => ({ ...prev, isComment: !prev.isComment }))}
              >
                <i className="fa fa-solid fa-chat me-3"></i>
                Comentários ({comment.data.filter((i: any) => i.status > 0).length})
              </button>
            </div>

            <div className="mt-3">
              {!comment.isComment ? (
                <textarea
                  rows={10}
                  style={{ resize: "none" }}
                  className="form-control"
                  onChange={(e) => isObservation ? setNote(e.target.value) : setDescription(e.target.value)}
                  value={isObservation ? note : description}
                  placeholder={isObservation ? "Adicione observações detalhadas..." : "Descreva a tarefa..."}
                />
              ) : (
                <SocialCommentFeed
                  userList={userList}
                  initialComments={comment.data}
                  editTask={editTask}
                  onSubmit={getComment}
                />
              )}
            </div>
          </section>

          <footer className="w-100 d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button className="btn btn-light border px-4" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-success px-5 shadow-sm"
              onClick={() => {
                const value = isObservation ? note : description;
                changeObservedForm(editTask.task_id, editTask.id, value, isObservation);
                onClose();
              }}
            >
              <i className="bi bi-check2-circle me-1"></i> Salvar
            </button>
          </footer>
        </div>
      </div>
    )
  );
}