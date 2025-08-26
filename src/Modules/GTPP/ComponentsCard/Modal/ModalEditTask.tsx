import { useEffect, useState } from "react";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { useWebSocket } from "../../Context/GtppWsContext";

export default function ModalEditTask(props: any) {
  const {
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

  const { updatedForQuestion, changeObservedForm } = useWebSocket();

  useEffect(() => {
    setDescription(editTask.description);
    setNote(editTask.note);
    setIsQuest(editTask.yes_no === 1);
  }, [editTask]);

  const [isQuest, setIsQuest] = useState<boolean>(true);

  const handleConfirm = () => {
    const value = isObservation ? note : description;
    changeObservedForm(editTask.task_id, editTask.id, value, isObservation);
    editTask[isObservation ? "note" : "description"] = value;
    setEditTask({ ...editTask });

    // Executa ação pendente
    if (pendingAction === "switchToDescription") {
      setIsObservation(false);
    } else if (pendingAction === "switchToObservation") {
      setIsObservation(true);
    }

    // Limpa estados de controle
    setConfirm(false);
    setPendingAction(null);
  };

  const handleCloseModal = () => {
    setConfirm(false);
    setPendingAction(null);
  };

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
          style={{ maxHeight: "75%", zIndex: 1 }}
          className="d-flex flex-column align-items-center bg-white col-10 col-sm-8 col-md-6 p-4 rounded"
        >
          <header className="d-flex flex-column w-100">
            <div className="d-flex align-items-center justify-content-between w-100">
              <h1>Editar item da tarefa</h1>
              <button title="Fechar" onClick={onClose} className="btn btn-danger py-0">
                X
              </button>
            </div>
            <div className="d-flex align-items-center">
              <input
                checked={isQuest}
                onChange={(event: any) => {
                  setIsQuest(event.target.checked);
                  updatedForQuestion({
                    id: editTask.id,
                    task_id: editTask.task_id,
                    yes_no: event.target.checked ? 1 : 0,
                  });
                }}
                id={`item_quest_edit_${editTask.task_id}`}
                type="checkbox"
                className="form-check-input"
              />
              <label
                htmlFor={`item_quest_edit_${editTask.task_id}`}
                className="form-check-label ms-2"
              >
                Promover para questão
              </label>
            </div>
          </header>

          <section className="w-100">
            <button
              title="Editar Descrição"
              className={`btn btn-secondary py-0 opacity-${isObservation ? "25" : "100"}`}
              onClick={() => {
                if (editTask.description !== description || editTask.note !== note) {
                  setMsgConfirm({
                    title: "Atenção",
                    message: "Salve os dados antes de trocar de aba",
                  });
                  setPendingAction("switchToDescription");
                  setConfirm(true);
                } else {
                  setIsObservation(false);
                }
              }}
            >
              Descrição
            </button>

            <button
              className={`btn btn-secondary py-0 mx-2 ${!isObservation ? "opacity-25" : "opacity-100"}`}
              title="Editar Observação"
              onClick={() => {
                if (editTask.description !== description || editTask.note !== note) {
                  setMsgConfirm({
                    title: "Atenção",
                    message: "Salve os dados antes de trocar de aba",
                  });
                  setPendingAction("switchToObservation");
                  setConfirm(true);
                } else {
                  setIsObservation(true);
                }
              }}
            >
              Observação
            </button>

            <textarea
              rows={8}
              style={{ resize: "none" }}
              className="form-control my-4"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = event.target.value;
                isObservation ? setNote(value) : setDescription(value);
              }}
              value={(isObservation ? note : description) || ""}
              placeholder={
                isObservation
                  ? "Escreva detalhes e observações desse item"
                  : "Edite a descrição dessa tarefa."
              }
            />
          </section>

          <button
            title="Salvar alterações"
            className="btn btn-success col-10 col-sm-8 col-md-6 col-lg-5 col-xl-3"
            onClick={() => {
              if (editTask.description !== description || editTask.note !== note) {
                const value = isObservation ? note : description;
                changeObservedForm(editTask.task_id, editTask.id, value, isObservation);
                editTask[isObservation ? "note" : "description"] = value;
                setEditTask({ ...editTask });
                onClose();
              }
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    )
  );
}
