import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/MainContext";
import { useWebSocket } from "./Context/GtppWsContext";
import { iPropsInputCheckButton } from "../../Interface/iGTPP";
import FlowBoard from "./ComponentsCard/FlowBoard/FlowBoard";

export default function Gtpp(): JSX.Element {
  const { setTitleHead, setModalPage, setModalPageElement, userLog } = useMyContext();
  const { clearGtppWsContext, setOnSounds, updateStates, setOpenCardDefault, loadTasks, reqTasks, openCardDefault, taskDetails, states, onSounds, themeList, task, getTask, setIsAdm, isAdm } = useWebSocket();

  const [openFilter, setOpenFilter] = useState(false);
  const [openFilterGolbal, setOpenFilterGolbal] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const [isHeader, setIsHeader] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedThemeIds, setSelectedThemeIds] = useState<string>("");
  const [isOpenTheme, setIsOpenTheme] = useState<boolean>(false);
  const [idTheme, getIdTheme] = useState<string>("");

  const listButtonInputs: iPropsInputCheckButton[] = [
    { inputId: `check_adm_${userLog.id}`, nameButton: "Elevar como administrador", onAction: (e) => setIsAdm(e), labelIcon: "fa-solid fa-user-tie", highlight: true },
    { inputId: "gttp_exp_ret", nameButton: "Exibir usuários", onAction: () => setIsHeader(!isHeader), labelIconConditional: ["fa-solid fa-chevron-up", "fa-solid fa-chevron-down"] },
    { inputId: "check_filter", nameButton: "Filtros da página", onAction: (e) => setOpenFilterGolbal(e), labelIcon: "fa-solid fa-filter", highlight: true },
    { inputId: "reload_tasks", nameButton: "Recarregar as tarefas", onAction: () => {reqTasks();clearFiltersInput();}, labelIcon: "fa fa-refresh" },
  ];

  useEffect(() => {
    setTitleHead({
      title: "Gerenciador de Tarefas Peg Pese - GTPP",
      simpleTitle: "Gerenciador de Tarefas",
      icon: "fa fa-home",
    });
  }, [setTitleHead]);

  const handleCheckboxChange = (stateId: number) => {
    const newStates:any  = [...states];
    const idx = newStates.findIndex((s:any) => s.id === stateId);
    newStates[idx].active = !newStates[idx].active;
    updateStates(newStates);
  };

  const handleOpenFilter = () => setOpenFilter((prev) => !prev);

  const clearFiltersInput = () => {
    setSelectedThemeIds("");
    getIdTheme("");
    setSelectedTasks([]);
  };

  return (
    <React.Fragment>
      <FlowBoard
        openMenu={openMenu}
        isHeader={isHeader}
        openFilterGolbal={openFilterGolbal}
        userLog={userLog}
        listButtonInputs={listButtonInputs}
        openFilter={openFilter}
        states={states}
        onSounds={onSounds}
        selectedThemeIds={selectedThemeIds}
        themeList={themeList}
        idTheme={idTheme}
        getTask={getTask}
        selectedTasks={selectedTasks}
        task={task}
        taskDetails={taskDetails}
        openCardDefault={openCardDefault}
        openThemeModal={isOpenTheme}
        setOpenMenu={setOpenMenu}
        handleOpenFilter={handleOpenFilter}
        handleCheckboxChange={handleCheckboxChange}
        setOnSounds={setOnSounds}
        setSelectedThemeIds={setSelectedThemeIds}
        getIdTheme={getIdTheme}
        setSelectedTasks={setSelectedTasks}
        setOpenCardDefault={setOpenCardDefault}
        setModalPage={setModalPage}
        setModalPageElement={setModalPageElement}
        loadTasks={loadTasks}
        clearGtppWsContext={clearGtppWsContext}
        setOpenThemeModal={setIsOpenTheme}
      />
    </React.Fragment>
  );
}