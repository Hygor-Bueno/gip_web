import React, { useMemo, useState, useEffect } from "react";
import NavBar from "../../../Components/NavBar";
import { useWebSocket } from "../Context/GtppWsContext";
import { useConnection } from "../../../Context/ConnContext";
import { listPath } from "../mock/configurationfile";
import { handleNotification } from "../../../Util/Util";
import { ContentDefault } from "./ContentDefault";
import { ActionModal } from "./ActionModal";
import { fieldsetFormTheme, fieldsetFormThemeUpdate } from "./Fieldset/Fiedset";

const CONFIG = {
  theme: {
    type: "theme" as const,
    modalTitle: (item: any) => item?.description_theme?.value || "Tema",
    getId: (item: any) => item?.id_theme?.value,
    deleteEnabled: true,
    deleteMessage: "Este tema será excluído permanentemente.",
    editButtonText: "Editar Tema",
  },
  task: {
    type: "task" as const,
    modalTitle: (item: any) => item?.description?.value || "Tarefa",
    getId: (item: any) => item?.id?.value,
    deleteEnabled: false, // ainda não tem delete de tarefa
    deleteMessage: "Esta tarefa será desvinculada.",
    editButtonText: "Vincular ao Tema",
  },
};

function CreateTheme() {
  const { themeList, getThemeListformations, getTask, setGetTask } = useWebSocket();
  const { fetchData } = useConnection();

  const [openMenu, setOpenMenu] = useState(true);
  const [showListTask, setShowListTask] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [description, setDescription] = useState("");
  const [themeId, setThemeId] = useState(0);
  const [themeIdFk, setThemeIdFk] = useState("");
  const [descTheme, setDescTheme] = useState("");

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"theme" | "task">("theme");

  const [selectedTasks, setSelectedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (themeList && themeList.length > 0 && !themeIdFk) {
      setThemeIdFk(themeList[0].id);
    }
  }, [themeList, themeIdFk]);

  const formattedThemeList = useMemo(() => {
    return themeList?.map((item: any) => ({
      id_theme: { value: item.id_theme, tag: "ID" },
      description_theme: { value: item.description_theme, tag: "Descrição" },
      user_id_fk: { value: item.user_id_fk, tag: "Usuário", ocultColumn: true },
    })) || [];
  }, [themeList]);

  const formattedTaskList = useMemo(() => {
    return getTask?.map((item: any) => {
      return ({
      id: { value: item.id, tag: "Número" },
      description: { value: item.description, tag: "Nome da Tarefa" },
      initial_date: { value: item.initial_date, tag: "Início" },
      final_date: { value: item.final_date, tag: "Fim" },
      state_id: { value: item.state_id, tag: "Estado" },
      theme_id_fk: {value: item.theme_id_fk, tag: "Tema", ocultColumn: true},
      description_theme: {value: item.description_theme, tag: "Tema"}
    })}) || [];
  }, [getTask]);

  const currentList = showListTask ? formattedTaskList : formattedThemeList;

  const handleConfirmList = (selected: any[]) => {
      if (!selected[0]) {
        setThemeId(0);
        setDescription("");
        return;
      };
      setSelectedItem(selected[0]);
      setSelectedType(showListTask ? "task" : "theme");
      setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedType !== "theme" || !selectedItem) return;

    const response = await fetchData({
      method: "DELETE",
      params: { id_theme: selectedItem.id_theme.value },
      pathFile: "GTPP/Theme.php",
    });

    if (!response.error) {
      handleNotification("Sucesso!", "Tema excluído com sucesso", "success");
      setShowModal(false);
      getThemeListformations();
      closeModal();
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedType("theme");
  };

  const onHandleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!description.trim()) return;

    const params: any = { description_theme: description };
    const method: "POST" | "PUT" = themeId > 0 ? "PUT" : "POST";
    if (themeId > 0) params.id_theme = themeId;

    const response = await fetchData({
      method,
      params,
      pathFile: "GTPP/Theme.php",
    });

    if (response && !response.error) {
      handleNotification("Sucesso!", themeId > 0 ? "Tema atualizado" : "Tema criado", "success");
      setThemeId(0);
      setShowModal(false);
      setDescription("");
      getThemeListformations();
    }
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    if (selectedType === "theme") {
      setThemeId(selectedItem.id_theme.value);
      setDescription(selectedItem.description_theme.value);
    }

    setShowModal(false);
  };

  const onHandleSubmitTask = async (e:any) => {
    e.preventDefault();
    
    if (selectedTasks.length === 0) return;

     // selectedTasks:  capturando os dados da tabela
     // setGetTask: estou sobrecarregando o frontend para trocar os dados localmente.
    
    for (const value of selectedTasks) {
      const response = await fetchData({
        method: "PUT",
        params: { task_id: value.id.value, theme_id_fk: themeIdFk },
        pathFile: "GTPP/Task.php",
      });

      if (!response.error) {
        // === ATUALIZA LOCALMENTE ===
        setGetTask((prev:any) =>
          prev.map((task: any) =>
            task.id === value.id.value
              ? { ...task, theme_id_fk: themeIdFk, description_theme: descTheme}
              : task
          )
        );
      }
    }

    setSelectedTasks([]);
    handleNotification("Sucesso!", "Tarefas atualizadas", "success");
  };

  const handleRemoveTheme = async (e:any) => {
    e.preventDefault();
    
    if (selectedTasks.length === 0) return;
    for (const value of selectedTasks) {
      const response = await fetchData({
        method: "PUT",
        params: { task_id: value.id.value, theme_id_fk: null },
        pathFile: "GTPP/Task.php",
      });

      if (!response.error) {
        // === ATUALIZA LOCALMENTE ===
        setGetTask((prev:any) =>
          prev.map((task: any) =>
            task.id === value.id.value
              ? { ...task, theme_id_fk: null, description_theme: null }
              : task
          )
        );
      }
    }

    setSelectedTasks([]);
    handleNotification("Sucesso!", "Tarefas desvinculadas", "success");
  };

  const getButtonTitle = () => (themeId === 0 ? "Criar Tema" : "Atualizar Tema");

  return (
    <React.Fragment>
      {openMenu && <NavBar list={listPath} />}
      <ActionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        itemName={selectedItem?.description_theme?.value}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ContentDefault
        openMenu={openMenu}
        themeId={themeId}
        formattedList={currentList}
        fieldset={[
          fieldsetFormTheme(themeId, description, setDescription),
          fieldsetFormThemeUpdate(themeIdFk, setThemeIdFk, setDescTheme, themeList),
        ]}
        showListTask={showListTask}
        setSelectedTasks={setSelectedTasks}
        setOpenMenu={setOpenMenu}
        setThemeId={setThemeId}
        setDescription={setDescription}
        getButtonTitle={getButtonTitle}
        setShowListTask={setShowListTask}
        onHandleSubmitForm={[onHandleSubmitForm, onHandleSubmitTask]}
        handleConfirmList={handleConfirmList}
        handleRemoveTheme={handleRemoveTheme}
        getDescTheme={setDescTheme}
      />
    </React.Fragment>
  );
}

export default CreateTheme;