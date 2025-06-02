import { useEffect, useState } from "react";
import { FormTextAreaDefaultProps } from "./Types";
import { useWebSocket } from "../../Context/GtppWsContext";

const FormTextAreaDefault: React.FC<FormTextAreaDefaultProps> = ({
  disabledForm = false,
  onChange,
  buttonTextOpen = "Aberto",
  buttonTextClosed = "Trancado",
  buttonClasses = "btn",
  textAreaClasses = "form-control",
  rows = 5,
  cols = 10,
  task,
  details
}) => {
  const [isOpenButton, setIsOpenButton] = useState<boolean>(false);
  const [valueChange, setValueChange] = useState<string>("");
  const {changeDescription} = useWebSocket();

  useEffect(() => {
    setValueChange(details?.full_description || "");
  }, [details?.full_description]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="d-flex align-items-end flex-column position-relative h-25">
      <textarea
        style={{ resize: "none",margin:"0px",padding:"0px" }}
        onChange={handleTextChange}
        disabled={disabledForm || !isOpenButton}
        value={valueChange}
        className={`${textAreaClasses}`}
        cols={cols}
        rows={rows}
        aria-label="Descrição da tarefa"
      />
      <button
        onClick={() => {
          changeDescription(valueChange, task.id, task.id);
          setIsOpenButton((prev) => !prev);
        }}
        className={`${buttonClasses} position-absolute`} 
        aria-label={isOpenButton ? buttonTextOpen : buttonTextClosed}
      >
        <i className={`fa fa-pencil text-${isOpenButton ? "success" : "secundary"}`}></i>
      </button>
    </div>
  );
};

export default FormTextAreaDefault;
