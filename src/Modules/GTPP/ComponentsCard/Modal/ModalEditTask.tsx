import { useEffect, useState } from "react";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { useWebSocket } from "../../Context/GtppWsContext";

export default function ModalEditTask(props: any) {
  const { onEditTask, editTask, setEditTask, isObservation, setIsObservation, onClose } = props;
  const [note, setNote] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [confirm, setConfirm] = useState<boolean>(false);
  const [isQuest, setIsQuest] = useState<boolean>(false);

  const [msgConfirm, setMsgConfirm] = useState<{ title: string, message: string }>({ title: '', message: '' });
  useEffect(()=>{
    setDescription(editTask.description);
    setNote(editTask.note);
    setIsQuest(editTask.yes_no == 0 ? false : true);    
  },[editTask]);

  const { updatedForQuestion, changeObservedForm } = useWebSocket();
  return onEditTask && (
    <div className="d-flex align-items-center justify-content-center" style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      background: "#00000088",
      top: 0,
      left: 0
    }}>
      {confirm && <ConfirmModal {...msgConfirm} onConfirm={() => setIsObservation(!isObservation)} onClose={() => setConfirm(false)} />}
      <div
        style={{
          maxHeight: "75%",
          zIndex: 1
        }}
        className="d-flex flex-column align-items-center bg-white col-10 col-sm-8 col-md-6  p-4 rounded">
        <header className="d-flex flex-column w-100">
          <div className="d-flex align-items-center justify-content-between w-100">
            <h1>Editar item da tarefa</h1>
            <button title="Editar item da tarefa" onClick={() => onClose()} className="btn btn-danger py-0">X</button>
          </div>
          <div className="d-flex align-items-center">
            <input
              checked={isQuest}
              onChange={
                async (event: any) => {
                  await updatedForQuestion({ id: editTask.id, task_id: editTask.task_id, yes_no: event.target.checked ? -1 : 0 });
                  setIsQuest(event.target.checked);
                }
              }
              id={`item_quest_edit_${editTask.task_id}`} type="checkbox" className="form-check-input" />
            <label htmlFor={`item_quest_edit_${editTask.task_id}`} className="form-check-label ms-2">Promover para questão</label>
          </div>
        </header>
        <section className="w-100">
          <button title="Editar tarefa" onClick={() => {
            if (editTask.description != description || editTask.note != note) {
              setMsgConfirm({ title: "Atenção", message: "Salve os dados antes de trocar de aba" });
              setConfirm(true);
            } else {
              setIsObservation(!isObservation);
            }
          }} className={`btn btn-${isObservation ? 'primary' : 'secondary'} py-0`}>{isObservation ? "Observação" : "Descrição"}</button>
          <textarea rows={8} style={{ resize: "none" }} className="form-control my-4"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              const value = event.target.value;
              isObservation ? setNote(value) : setDescription(value);
            }}
            value={(isObservation ? note : description) || ""}
            placeholder={`${isObservation ? "Escreva detalhes e observações desse item" : "Edite a descrição dessa tarefa."}`}
          />
        </section>
        <button title="Alterar obervação" onClick={() => {
          if (editTask.description != description || editTask.note != note) {
            const value = editTask.description != description ? description : note;
            changeObservedForm(editTask.task_id, editTask.id, value, isObservation);
            editTask[isObservation ? 'note' : 'description'] = value;
            setEditTask({ ...editTask });
            onClose();
          }
        }} className="btn btn-success col-10 col-sm-8 col-md-6 col-lg-5 col-xl-3">Salvar</button>
      </div>
    </div>
  );
}