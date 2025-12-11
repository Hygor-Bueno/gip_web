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

function CreateTheme() {
  const { themeList, setThemeList, getTask, setGetTask } = useWebSocket();
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
      initial_date: { value: DateConverter.formatDate(item.initial_date), tag: "Início" },
      final_date: { value: DateConverter.formatDate(item.final_date), tag: "Fim" },
      state_id: { value: item.state_description, tag: "Estado" },
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
      handleNotification("Sucesso!", response.message, "success");
      setThemeList((prev: any[]) =>
        prev.filter((theme) => theme.id_theme !== selectedItem.id_theme.value)
      );
      setShowModal(false);
    }
  };

  const onHandleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!description.trim()) {
      handleNotification( "Atenção!", "O campo de descrição é obrigatório.", "danger");
      return;
    }

    const params: any = { description_theme: description };
    const method: "POST" | "PUT" = themeId > 0 ? "PUT" : "POST";
    if (themeId > 0) params.id_theme = themeId;

    const response = await fetchData({
      method,
      params,
      pathFile: "GTPP/Theme.php",
    });

    if (response && !response.error) {
      handleNotification(
        "Sucesso!",
        themeId > 0 ? "Tema atualizado" : "Tema criado",
        "success"
      );

      const newItem = {
        id_theme: response.data.last_id || themeId,
        description_theme: description,
      };

      setThemeList((prev: any) => {
        if (themeId > 0) {
          return prev?.map((theme: any) =>
            theme?.id_theme === themeId ? { ...theme, ...newItem } : theme
          );
        } else {
          return [...prev, newItem];
        }
      });

      setThemeId(0);
      setShowModal(false);
      setDescription("");
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

    let captureError:any = []; 

     // selectedTasks:  capturando os dados da tabela.
     // setGetTask: estou sobrecarregando o frontend para trocar os dados localmente.
    for (const value of selectedTasks) {
      const response = await fetchData({
        method: "PUT",
        params: { task_id: value.id.value, theme_id_fk: themeIdFk },
        pathFile: "GTPP/Task.php"
      });

      captureError.push(response)

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
        showListTask={showListTask}
        fieldset={[fieldsetFormTheme(themeId, description, setDescription),fieldsetFormThemeUpdate(themeIdFk, setThemeIdFk, setDescTheme, themeList)]}
        setSelectedTasks={setSelectedTasks}
        setOpenMenu={setOpenMenu}
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