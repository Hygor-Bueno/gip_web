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
  const { themeList, getThemeListformations, getTask } = useWebSocket();
  const { fetchData } = useConnection();

  const [openMenu, setOpenMenu] = useState(true);
  const [description, setDescription] = useState("");
  const [themeId, setThemeId] = useState(0);
  const [numberTask, setNumberTask] = useState("");
  const [themeIdFk, setThemeIdFk] = useState("");
  const [showListTask, setShowListTask] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"theme" | "task">("theme");
  const [showModal, setShowModal] = useState(false);

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
    return getTask?.map((item: any) => ({
      id: { value: item.id, tag: "Número" },
      description: { value: item.description, tag: "Nome da Tarefa" },
      initial_date: { value: item.initial_date, tag: "Início" },
      final_date: { value: item.final_date, tag: "Fim" },
      state_id: { value: item.state_id, tag: "Estado" },
      theme_id_fk: {value: item.theme_id_fk, tag: "Tema"}
    })) || [];
  }, [getTask]);

  const currentList = showListTask ? formattedTaskList : formattedThemeList;
  const config = showListTask ? CONFIG.task : CONFIG.theme;

  const handleConfirmList = (selected: any[]) => {
    if (!selected[0]) return;
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
      getThemeListformations();
      closeModal();
    }
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    if (selectedType === "theme") {
      setThemeId(selectedItem.id_theme.value);
      setDescription(selectedItem.description_theme.value);
    } else if (selectedType === "task") {
      setNumberTask(selectedItem.id.value);
      setThemeIdFk(themeList?.[0]?.id || "");
    }

    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
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
      setDescription("");
      getThemeListformations();
    }
  };

  const onHandleSubmitTask = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!numberTask || !themeIdFk) return;

    const response = await fetchData({
      method: "PUT",
      params: { id: numberTask, theme_id_fk: themeIdFk },
      pathFile: "GTPP/Task.php",
    });

    if (response && !response.error) {
      handleNotification("Sucesso!", "Tarefa vinculada com sucesso!", "success");
      setNumberTask("");
    }
  };

  const getButtonTitle = () => (themeId === 0 ? "Criar Tema" : "Atualizar Tema");

  return (
    <>
      {openMenu && <NavBar list={listPath} />}

      <ContentDefault
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        themeId={themeId}
        setThemeId={setThemeId}
        description={description}
        setDescription={setDescription}
        fieldset={[
          fieldsetFormTheme(themeId, description, setDescription),
          fieldsetFormThemeUpdate(numberTask, setNumberTask, themeIdFk, setThemeIdFk, themeList),
        ]}
        onHandleSubmitForm={[onHandleSubmitForm, onHandleSubmitTask]}
        getButtonTitle={getButtonTitle}
        formattedList={currentList}
        showListTask={showListTask}
        setShowListTask={setShowListTask}
        handleConfirmList={handleConfirmList}
      />

      <ActionModal
        isOpen={showModal}
        onClose={closeModal}
        itemName={selectedItem ? config.modalTitle(selectedItem) : ""}
        message={config.deleteMessage}
        onDelete={config.deleteEnabled ? handleDelete : undefined}
        onEdit={handleEdit}
        editText={selectedType === "task" ? "Editar" : "Editar"}
        deleteText={selectedType === "theme" ? "Excluir" : undefined}
      />
    </>
  );
}

export default CreateTheme;