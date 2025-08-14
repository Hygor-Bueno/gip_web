import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useMyContext } from "../../../Context/MainContext";
import { useConnection } from "../../../Context/ConnContext";

import GtppWebSocket from "./GtppWebSocket";
import InformSending from "../Class/InformSending";
import NotificationGTPP from "../Class/NotificationGTPP";

import { classToJSON, handleNotification } from "../../../Util/Util";
import {
  CustomNotification,
  iGtppWsContextType,
  iStates,
  iTaskReq,
} from "../../../Interface/iGIPP";

import soundFile from "../../../Assets/Sounds/notify.mp3";
import { GetStateformations, GetTaskInformations, ReqTasks } from "./Util/LoadingTasks"
import { CallbackOnMessage, CloseCardDefaultGlobally, DeleteItemTaskWS, InfSenCheckItem, InfSenStates, UpTask } from "./Util/webSocketHandlers";
import { AddUserTask, ChangeDescription, ChangeObservedForm, CheckedItem, CheckTaskComShoDepSub, HandleAddTask, StopAndToBackTask, UpdatedForQuestion, UpdateItemTaskFile, UpdateStateTask, VerifyChangeState } from "./Util/taskActions";
import { GetDescription, ItemUp, ReloadPageAddItem, ReloadPageChangeQuestion, ReloadPageDeleteItem, ReloadPageItem, ReloadPagePercent, ReloadPageUpNoteItem, UpdateNotification } from "./Util/loadingUI";
import { AddDays, ClearGtppWsContext, CreateStorageState, RequestNotificationPermission, UpdateStates } from "./Util/util";

const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // AQUI COMEÇA GERENCIAMENTO DE ESTADOS
  const [taskPercent, setTaskPercent] = useState<number>(0);
  const [task, setTask] = useState<any>({}); // achei
  const [taskDetails, setTaskDetails] = useState<iTaskReq>({});
  const [onSounds, setOnSounds] = useState<boolean>(false);
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [getTask, setGetTask] = useState<any[]>([]);
  const [states, setStates] = useState<iStates[]>([
    { color: "", description: "", id: 0 },
  ]);
  const [isAdm, setIsAdm] = useState<any>(false);
  const [userTaskBind, setUserTaskBind] = useState<any[]>([]);

  const navigate = useNavigate();

  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();
  const { userLog } = useMyContext();

  const ws = useRef(new GtppWebSocket());
  // AQUI TERMINA GERENCIAMENTO DE ESTADOS

  // AQUI COMEÇA USEEFFECTS
  useEffect(() => {
    ws.current.connect();

    (async () => {
      setLoading(true);
      try {
        const getNotify: any = await fetchData({
          method: "GET",
          params: null,
          pathFile: "GTPP/Notify.php",
          urlComplement: `&id_user=${userLog.id}`,
          exception: ["No data"],
        });
        if (getNotify.error) throw new Error(getNotify.message);
        updateNotification(getNotify.data);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    })();

    getStateformations();
    return () => {
      if (ws.current && ws.current.isConnected) {
        localStorage.removeItem("gtppStates");
        ws.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    ws.current.callbackOnMessage = callbackOnMessage;
  }, [task, taskDetails, notifications, onSounds, openCardDefault]);

  useEffect(() => {
    (async () => {
      task.id && (await getTaskInformations());
    })();
  }, [task]);

  useEffect(() => {
    (async () => {
      await loadTasks();
    })();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  // AQUI TERMINA USEEFFECTS

  // AQUI COMEÇA CARREGAMENTO DE DADOS (fetch/load)
  async function loadTasks(admin?: boolean) {
    try {
      setIsAdm(admin);
      await reqTasks(admin);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    }
  }

  async function reqTasks(admin?: boolean) {
    return ReqTasks (admin, setIsAdm, setLoading, fetchData, setGetTask);
  }

  async function getTaskInformations(): Promise<void> {
    return GetTaskInformations (setLoading, fetchData, setTaskDetails, task);
  }

  async function getStateformations() {
    return GetStateformations(setLoading, fetchData, createStorageState, updateStates);
  }
  // AQUI TERMINA CARREGAMENTO DE DADOS (fetch/load)

  // AQUI COMEÇA WEBSOCKET (mensagens, callbacks)
  async function callbackOnMessage(event: any) {
    return CallbackOnMessage(event, updateNotification, task, setTask, loadTasks, itemUp, reloadPageDeleteItem, reloadPageItem, setOpenCardDefault, getDescription);
  }

  function deleteItemTaskWS(object: any) {
    return DeleteItemTaskWS(object, ws, userLog, task);
  }

  const closeCardDefaultGlobally = (taskId?: number) => {
    return CloseCardDefaultGlobally(taskId, ws, userLog);
  };

  function infSenStates(taskLocal: any, result: any) {
    return InfSenStates(taskLocal, result, task, setTask, ws, userLog);
  }

  function infSenCheckItem(taskLocal: any, result: any) {
    return InfSenCheckItem(taskLocal, result, ws, userLog);
  }

  async function upTask(taskId: number,resource: string | null,date: string | null,taskList: any,message: string,type: number,object?: {}) {
    return UpTask(taskId, resource, date, taskList, message, type, object, setLoading, ws, userLog, loadTasks);
  }
  // AQUI TERMINA WEBSOCKET (mensagens, callbacks)

  // AQUI COMEÇA AÇÕES SOBRE TAREFAS (adicionar, editar, checar, remover)
  async function checkedItem(id: number,checked: boolean,idTask: any,taskLocal: any,yes_no?: number) {
    return CheckedItem(id, checked, idTask, taskLocal, fetchData, reloadPageChangeQuestion, reloadPagePercent, verifyChangeState, infSenCheckItem, setLoading, task, yes_no);
  }

  async function verifyChangeState(newState: number,oldState: number,taskLocal: any,result: any) {
    return VerifyChangeState(newState, oldState, taskLocal, result,loadTasks,infSenStates);
  }

  async function checkTaskComShoDepSub(task_id: number, company_id: number, shop_id: number, depart_id: number, taskLocal: any) {
    return CheckTaskComShoDepSub(task_id, company_id, shop_id, depart_id, taskLocal, setLoading, fetchData, ws, userLog);
  }

  async function handleAddTask(description: string, task_id: string, yes_no: number, file?: string) {
    return HandleAddTask(description, task_id, yes_no, fetchData, taskDetails, ws, userLog, reloadPagePercent, setTaskDetails, task, verifyChangeState, setLoading);
  }

  async function changeDescription(description: string,id: number,descLocal: string) {
    return ChangeDescription(description, id, descLocal, fetchData, ws, userLog, setLoading);
  }

  async function updateItemTaskFile(file: string, item_id?: number) {
    return UpdateItemTaskFile(file, Number(item_id), fetchData, task)
  }

  async function changeObservedForm(taskId: number,subId: number,value: string,isObservation: boolean) {
    return ChangeObservedForm(taskId, subId, value, isObservation, fetchData, getTaskInformations, ws, userLog, setLoading);
  }

  async function updateStateTask(taskId: number,resource: string | null,date: string | null) {
    return UpdateStateTask(taskId, resource, date, fetchData, setLoading);
  }

  async function stopAndToBackTask(taskId: number,resource: string | null,date: string | null,taskList: any) {
    return StopAndToBackTask(taskId, resource, date, taskList, updateStateTask, setTask, task, upTask, addDays, closeCardDefaultGlobally, handleNotification);
  }

  async function updatedForQuestion(item: {task_id: number;id: number;yes_no: number;}){
    return UpdatedForQuestion(item, setLoading, fetchData, taskDetails, itemUp, task, upTask);
  }

  function addUserTask(element: any, type: number) {
    return AddUserTask(element, type, userLog, ws);
  }
  // AQUI TERMINA AÇÕES SOBRE TAREFAS (adicionar, editar, checar, remover)

  // AQUI COMEÇA ATUALIZAÇÕES DE UI (reload de tela, updates locais)
  function reloadPagePercent(value: any, taskLocal: any) {
    return ReloadPagePercent(value, taskLocal, task, setTaskPercent, getTask, setGetTask);
  }

  function reloadPageChangeQuestion(yes_no: number, item_id: number) {
    return ReloadPageChangeQuestion(yes_no, item_id, taskDetails);
  }

  function reloadPageDeleteItem(value: any) {
    return ReloadPageDeleteItem(value, taskDetails, setTaskDetails, reloadPagePercent);
  }

  function reloadPageItem(object: any) {
    return ReloadPageItem(object, reloadPageAddItem, reloadPageUpNoteItem);
  }

  function reloadPageAddItem(object: any) {
    return ReloadPageAddItem(object, taskDetails, setTaskDetails, reloadPagePercent);
  }

  function reloadPageUpNoteItem(object: any) {
    return ReloadPageUpNoteItem(object, taskDetails, setTaskDetails);
  }

  function itemUp(value: any) {
    return ItemUp(value, taskDetails, setTaskDetails, reloadPagePercent);
  }

  function getDescription(description: any) {
    return GetDescription(description, taskDetails, setTaskDetails);
  }

  async function updateNotification(item: any[]) {
    return UpdateNotification(item, setLoading, onSounds, soundFile, states, notifications, setNotifications, handleNotification);
  }
  // AQUI TERMINA ATUALIZAÇÕES DE UI (reload de tela, updates locais)

  // AQUI COMEÇA FUNÇÕES UTILITÁRIAS
  function updateStates(newList: any[]) { return UpdateStates(newList, setStates); }
  function createStorageState(list: iStates[]) { return CreateStorageState(list); }
  function addDays(daysToAdd: number) { return AddDays(daysToAdd); }
  function clearGtppWsContext() { return ClearGtppWsContext(setTask, setTaskDetails); }
  const requestNotificationPermission = async () => { return await RequestNotificationPermission(setOnSounds);};
  // AQUI TERMINA FUNÇÕES UTILITÁRIAS

  // AQUI COMEÇA RETORNO DO PROVIDER
  return (
    <GtppWsContext.Provider
      value={{
        taskDetails,
        task,
        taskPercent,
        userTaskBind,
        notifications,
        states,
        onSounds,
        getTask,
        isAdm,
        openCardDefault,
        updateItemTaskFile,
        updatedForQuestion,
        reloadPagePercent,
        deleteItemTaskWS,
        addUserTask,
        getTaskInformations,
        setOpenCardDefault,
        loadTasks,
        reqTasks,
        setGetTask,
        updateStates,
        setOnSounds,
        setNotifications,
        setTaskPercent,
        setTask,
        handleAddTask,
        setTaskDetails,
        clearGtppWsContext,
        checkedItem,
        checkTaskComShoDepSub,
        changeDescription,
        stopAndToBackTask,
        changeObservedForm,
      }}
    >
      {children}
    </GtppWsContext.Provider>
  );
  // AQUI TERMINA RETORNO DO PROVIDER
};

// AQUI COMEÇA HOOK CUSTOMIZADO
export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
// AQUI TERMINA HOOK CUSTOMIZADO