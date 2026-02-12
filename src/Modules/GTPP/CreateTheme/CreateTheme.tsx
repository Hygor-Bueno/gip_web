import React, { useMemo, useState, useEffect } from "react";
import NavBar from "../../../Components/NavBar";
import { useWebSocket } from "../Context/GtppWsContext";
import { useConnection } from "../../../Context/ConnContext";
import { listPath } from "../mock/configurationfile";
import { handleNotification } from "../../../Util/Util";
import { ContentDefault } from "./ContentDefault";
import { ActionModal } from "./ActionModal";
import { fieldsetFormTheme, fieldsetFormThemeUpdate } from "./Fieldset/Fiedset";
import { DateConverter } from "../Class/DataConvert";
import { ISelectedTasks, ISelectItem, ITask, ITheme } from "./ICreateTheme";

function CreateTheme() {
  const { fetchData } = useConnection();
  const { themeList, setThemeList, getTask, setGetTask } = useWebSocket();

  const [openMenu, setOpenMenu] = useState(true);
  const [showListTask, setShowListTask] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [description, setDescription] = useState<string>("");
  const [themeId, setThemeId] = useState<number>(0);
  const [themeIdFk, setThemeIdFk] = useState<string>("");
  const [descTheme, setDescTheme] = useState<string>("");

  const [selectedItem, setSelectedItem] = useState<ISelectItem | null>(null);
  const [selectedType, setSelectedType] = useState<"theme" | "task">("theme");
  const [selectedTasks, setSelectedTasks] = useState<ISelectedTasks[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectionResetKey, setSelectionResetKey] = useState(0);

  // Define tema inicial selecionado
  useEffect(() => {
    if (themeList && themeList.length > 0 && !themeIdFk) {
      setThemeIdFk(String(themeList[0]));
    }
  }, [themeList, themeIdFk]);

  // Insere ou atualiza tema na lista
  function upsertTheme(theme: ITheme) {
    setThemeList((prev: ITheme[]) => {
      const exists = prev.some(t => String(t.id_theme) === String(theme.id_theme));
      if (exists) {
        return prev.map(t =>
          String(t.id_theme) === String(theme.id_theme) ? { ...t, ...theme } : t
        );
      }
      return [...prev, theme];
    });
  }

  // Atualiza o tema de uma task em memória (tempo real)
  function updateTaskTheme(
    taskId: number,
    themeId: number | string | null,
    descriptionTheme: string | null
  ) {
    setGetTask((prev: ITask[]) =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              theme_id_fk: themeId,
              description_theme: descriptionTheme
            }
          : task
      )
    );
  }

  const formattedThemeList = useMemo(() => {
    return (
      themeList?.map((item: ITheme) => ({
        id_theme: { value: String(item.id_theme), tag: "ID" },
        description_theme: { value: item.description_theme, tag: "Descrição" },
        user_id_fk: { value: String(item.user_id_fk ?? ""), tag: "Usuário", ocultColumn: true }
      })) || []
    );
  }, [themeList]);

  const formattedTaskList = useMemo(() => {
    return (
      getTask?.map((item: ITask) => ({
        id: { value: String(item.id), tag: "Numero" },
        description: { value: item.description, tag: "Nome da Tarefa" },
        initial_date: { value: DateConverter.formatDate(item.initial_date), tag: "Início" },
        final_date: { value: DateConverter.formatDate(item.final_date), tag: "Fim" },
        state_id: { value: item.state_description, tag: "Estado" },
        theme_id_fk: { value: String(item.theme_id_fk ?? ""), tag: "Tema", ocultColumn: true },
        description_theme: { value: String(item.description_theme ?? ""), tag: "Tema" }
      })) || []
    );
  }, [getTask]);

  const currentList = showListTask ? formattedTaskList : formattedThemeList;

  const handleConfirmList = (selected: any[]) => {
    if (!selected[0]) {
      setThemeId(0);
      setDescription("");
      return;
    }
    setSelectedItem(selected[0]);
    setSelectedType(showListTask ? "task" : "theme");
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedType !== "theme" || !selectedItem) return;

    const response = await fetchData({
      method: "DELETE",
      params: { id_theme: selectedItem.id_theme.value },
      pathFile: "GTPP/Theme.php"
    });

    if (!response.error) {
      handleNotification("Sucesso!", response.message, "success");
      setThemeList((prev: ITheme[]) =>
        prev.filter(theme => String(theme.id_theme) !== String(selectedItem.id_theme.value))
      );
      setShowModal(false);
    }
  };

  const onHandleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!description.trim()) {
      handleNotification("Atenção!", "O campo de descrição é obrigatório.", "danger");
      return;
    }

    const params: { description_theme: string; id_theme?: number } = {
      description_theme: description
    };

    const method: "POST" | "PUT" = themeId > 0 ? "PUT" : "POST";
    if (themeId > 0) params.id_theme = themeId;

    const response = await fetchData({
      method,
      params,
      pathFile: "GTPP/Theme.php"
    });

    if (response && !response.error) {
      const newId = response.data?.last_id || themeId;

      const newItem: ITheme = {
        id_theme: newId,
        description_theme: description
      };

      upsertTheme(newItem);

      handleNotification(
        "Sucesso!",
        themeId > 0 ? "Tema atualizado" : "Tema criado",
        "success"
      );

      setThemeId(0);
      setShowModal(false);
      setDescription("");
    }
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    if (selectedType === "theme") {
      setThemeId(Number(selectedItem.id_theme.value));
      setDescription(selectedItem.description_theme.value);
    }
    setShowModal(false);
  };

  const onHandleSubmitTask = async (e: React.MouseEvent, funcAss?: (value: boolean) => boolean) => {
    e.preventDefault();

    if (isProcessing) return;
    if (selectedTasks.length === 0) {
      alert("Seleção está vazia");
      return;
    }

    setIsProcessing(true);
    
    const tasksSnapshot = [...selectedTasks];
    const uniqueTasks = tasksSnapshot.filter((task, index, self) => index === self.findIndex(t => t.id.value ===  task.id.value));

    try {
      const results = await Promise.all(
        uniqueTasks.map(value =>
          fetchData({
            method: "PUT",
            params: { task_id: value.id.value, theme_id_fk: themeIdFk },
            pathFile: "GTPP/Task.php"
          }).then(response => ({ response, value }))
        )
      );

      for (const { response, value } of results) {
        if (!response?.error) {
          updateTaskTheme(Number(value.id.value), themeIdFk, descTheme);
        }
      }

      setSelectedTasks([]);
      results[0].response.error == false && handleNotification("Sucesso!", "Tarefas vinculadas ao tema", "success");
    } finally {
      setIsProcessing(false);
      setThemeIdFk("");
      funcAss?.(false);
    }
  };

  const handleRemoveTheme = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    if (selectedTasks.length === 0) return;
    setIsProcessing(true);
    const tasksSnapshot = [...selectedTasks];
    const uniqueTasks = tasksSnapshot.filter((task, index, self) => index === self.findIndex(t => t.id.value ===  task.id.value));
    try {
      const results = await Promise.all(
        uniqueTasks.map(value =>
          fetchData({
            method: "PUT",
            params: { task_id: value.id.value, theme_id_fk: null },
            pathFile: "GTPP/Task.php",
          }).then(response => ({ response, value }))
        )
      );
      for (const { response, value } of results) {
        if (!response?.error) {
          updateTaskTheme(Number(value.id.value), null, null);
        }
      }
      setSelectedTasks([]);
      setSelectionResetKey(prev => prev + 1);
      results[0].response.error == false && handleNotification("Sucesso!", "Tarefas removidas do tema", "success");
    } finally {
      setIsProcessing(false);
    }
  };


  const getButtonTitle = () => (themeId === 0 ? "Criar Tema" : "Atualizar Tema");

  return (
    <React.Fragment>
      {openMenu && <NavBar list={listPath} />}

      <ActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        itemName={selectedItem?.description_theme?.value || null}
        message={
          !showListTask
            ? "Quais operações você deseja executar?"
            : "Deseja realmente desvincular esse tema dessa tarefa?"
        }
        deleteText={!showListTask ? "Excluir" : "Desvincular"}
        editText={!showListTask ? "Editar" : "Cancelar"}
        onEdit={() => (!showListTask ? handleEdit() : setShowModal(false))}
        onDelete={(e) => {
          if (!showListTask) handleDelete();
          else {
            handleRemoveTheme(e);
            setShowModal(false);
          }
        }}
      />

      <ContentDefault
        key={selectionResetKey}
        openMenu={openMenu}
        themeId={themeId}
        formattedList={currentList}
        showListTask={showListTask}
        fieldset={[
          fieldsetFormTheme(themeId, description, setDescription),
          fieldsetFormThemeUpdate(themeIdFk, setThemeIdFk, setDescTheme, themeList)
        ]}
        setSelectedTasks={setSelectedTasks}
        setOpenMenu={setOpenMenu}
        setThemeIdFk={setThemeIdFk}
        getButtonTitle={getButtonTitle}
        setShowListTask={setShowListTask}
        onHandleSubmitForm={[onHandleSubmitForm, onHandleSubmitTask]}
        handleConfirmList={handleConfirmList}
        handleRemoveTheme={() => selectedTasks.length > 0 && setShowModal(true)}
        getDescTheme={setDescTheme}
      />
    </React.Fragment>
  );
}

export default CreateTheme;
