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
  details,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [valueChange, setValueChange] = useState<string>("");
  const { changeDescription } = useWebSocket();

  useEffect(() => {
    setValueChange(details?.full_description || "");
  }, [details?.full_description]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      const trimmedCurrent = (details?.full_description || "").trim();
      const trimmedNew = valueChange.trim();

      if (trimmedNew !== trimmedCurrent) {
        changeDescription(trimmedNew, task.id, task.id);
      }
    }

    setIsEditing(!isEditing);
  };

  return (
    <div className="d-flex align-items-end flex-column position-relative h-25">
      <textarea
        style={{ resize: "none", margin: "0px", padding: "0px" }}
        onChange={handleTextChange}
        disabled={disabledForm || !isEditing}
        value={valueChange}
        className={textAreaClasses}
        cols={cols}
        rows={rows}
        aria-label="Descrição da tarefa"
      />
      <button
        onClick={handleToggleEdit}
        className={`${buttonClasses} position-absolute`}
        aria-label={isEditing ? buttonTextOpen : buttonTextClosed}
      >
        <i className={`fa fa-pencil text-${isEditing ? "success" : "secondary"}`}></i>
      </button>
    </div>
  );
};

export default FormTextAreaDefault;
