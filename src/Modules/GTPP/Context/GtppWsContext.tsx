import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useReducer, // Adicionado
} from "react";
import { CustomNotification, iGtppWsContextType, iStates, iTaskReq } from "../../../Interface/iGIPP";
import GtppWebSocket from "./GtppWebSocket";
import { useMyContext } from "../../../Context/MainContext";
import InformSending from "../Class/InformSending";
import { classToJSON, handleNotification } from "../../../Util/Util";
import NotificationGTPP from "../Class/NotificationGTPP";
import soundFile from "../../../Assets/Sounds/notify.mp3";
import { useConnection } from "../../../Context/ConnContext";
import { useNavigate } from "react-router-dom";

// =================================================================
// ESTADO INICIAL E REDUCER PARA GERENCIAMENTO CENTRALIZADO
// =================================================================

const initialState = {
  task: {},
  taskDetails: {},
  taskPercent: 0,
  getTask: [],
  states: [{ color: '', description: '', id: 0 }],
  notifications: [],
  isAdm: false,
  userTaskBind: [],
};

function gtppReducer(state: any, action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'SET_TASK':
      return { ...state, task: action.payload };
    case 'SET_TASK_DETAILS':
      return { ...state, taskDetails: action.payload };
    case 'SET_TASK_PERCENT':
      return { ...state, taskPercent: action.payload };
    case 'SET_TASKS_LIST':
      return { ...state, getTask: action.payload };
    case 'SET_STATES':
      return { ...state, states: action.payload };
    case 'ADD_NOTIFICATION':
      // Evita duplicatas de notificações
      const newNotifications = action.payload.filter(
        (newItem: any) => !state.notifications.some((existingItem: any) => existingItem.id === newItem.id)
      );
      return { ...state, notifications: [...state.notifications, ...newNotifications] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_IS_ADM':
      return { ...state, isAdm: action.payload };
    case 'UPDATE_TASK_PERCENT_IN_LIST':
      const { taskId, percent } = action.payload;
      const updatedTasks = state.getTask.map((task: any) =>
        task.id === taskId ? { ...task, percent: percent } : task
      );
      return { ...state, getTask: updatedTasks };
    case 'RESET_CONTEXT':
      return { ...initialState, states: state.states }; // Mantém os estados que não devem ser resetados
    default:
      return state;
  }
}


// =================================================================
// CONTEXTO
// =================================================================
const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  // ================================================================= //
  // 1. GERENCIAMENTO DE ESTADO (AGORA COM useReducer)                 //
  // ================================================================= //
  const [state, dispatch] = useReducer(gtppReducer, initialState);
  const { task, taskDetails, taskPercent, getTask, states, notifications, isAdm, userTaskBind } = state;

  // Estados que permanecem com useState por serem mais simples ou de UI
  const [onSounds, setOnSounds] = useState<boolean>(false);
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);

  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();
  const ws = useRef(new GtppWebSocket());

  // Funções de dispatch para facilitar o uso
  const setTask = (payload: any) => dispatch({ type: 'SET_TASK', payload });
  const setTaskDetails = (payload: any) => dispatch({ type: 'SET_TASK_DETAILS', payload });
  const setTaskPercent = (payload: any) => dispatch({ type: 'SET_TASK_PERCENT', payload });
  const setGetTask = (payload: any[]) => dispatch({ type: 'SET_TASKS_LIST', payload });
  const setStates = (payload: any[]) => dispatch({ type: 'SET_STATES', payload });
  const setNotifications = (payload: any[]) => dispatch({ type: 'SET_NOTIFICATIONS', payload });
  const setIsAdm = (payload: boolean) => dispatch({ type: 'SET_IS_ADM', payload });

  // =================================================================
  // 2. CICLO DE VIDA E EFEITOS (useEffect)
  // =================================================================

  // Efeito de inicialização: Conecta ao WS, busca dados iniciais.
  useEffect(() => {
    ws.current.connect();

    (async () => {
      setLoading(true);
      try {
        const getNotify: any = await fetchData({ method: "GET", params: null, pathFile: 'GTPP/Notify.php', urlComplement: `&id_user=${userLog.id}`, exception: ["No data"] });
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
        localStorage.removeItem('gtppStates');
        ws.current.disconnect();
      }
    }
  }, []);

  // Garante a atualização do callback do WebSocket.
  useEffect(() => {
    ws.current.callbackOnMessage = callbackOnMessage;
  }, [state, onSounds, openCardDefault]); // Agora depende do objeto state inteiro

  // Recupera as informações detalhadas da tarefa.
  useEffect(() => {
    if (task.id) {
      getTaskInformations();
    }
  }, [task.id]); // Dependência mais específica

  // Carrega lista de tarefas.
  useEffect(() => {
    loadTasks();
  }, []);

  // Pede permissão para notificações.
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // =================================================================
  // 3. GERENCIAMENTO DO WEBSOCKET E NOTIFICAÇÕES
  // =================================================================

  /**
   * Callback principal que processa as mensagens recebidas do WebSocket.
   */
  async function callbackOnMessage(event: any) {
    let response = JSON.parse(event.data);
    if (response.error && response.message.includes("This user has been connected to another place")) {
      // Lógica de desconexão
    }

    if (!response.error && response.send_user_id != localStorage.codUserGIPP) {
      updateNotification([response]);

      if (response.type == -1 || response.type == 2 || response.type == 6) {
        if (response.type == 6) {
          if (task.id === response.task_id) {
            const updatedTask = { ...task, state_id: response.object?.state_id, percent: response.object?.percent };
            setTask(updatedTask);
          }
          await loadTasks();
        } else if (response.object) {
          if (response.type == 2) {
            if (response.object.isItemUp) itemUp(response.object);
            else if (response.object.remove) reloadPageDeleteItem(response);
            else reloadPageItem(response.object);
          }
        }
      } else if (response.type == -3 || response.type == 5) {
        if (task.id == response.task_id && response.type == -3) {
          setOpenCardDefault(false);
        }
        await loadTasks();
      }
    }

    if (!response.error && response.type == 3) {
      if (response.object) {
        getDescription(response.object);
      }
    }
  };

  const closeCardDefaultGlobally = (taskId?: number) => {
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: { description: "O card padrão foi fechado por outro usuário.", task_id: taskId },
      task_id: taskId,
      type: 7,
    });
  };

  function addUserTask(element: any, type: number) {
    const info: any = {
      "error": false,
      "user_id": element.user_id,
      "send_user_id": userLog.id,
      "object": { "description": type === 5 ? `${element.name} foi vinculado a tarefa` : `${element.name} foi removido da tarefa` },
      "task_id": element.task_id,
      "type": type
    };
    if (type === 5) {
      info.object.changeUser = element.user_id;
      info.object.task_id = element.task_id;
    }
    ws.current.informSending(info);
  };
  
  function infSenStates(taskLocal: any, result: any) {
    task.state_id = result.state_id;
    setTask({ ...task });
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 6, {
      description: "Mudou para",
      task_id: taskLocal.task_id,
      percent: result.percent,
      state_id: result.state_id,
      task: task,
    })));
  };

  function infSenCheckItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, {
      description: taskLocal.check ? "Um item foi marcado" : "Um item foi desmarcado",
      percent: result.percent,
      itemUp: taskLocal,
      isItemUp: true,
    })));
  };

  function deleteItemTaskWS(object: any) {
    ws.current.informSending({
      "user_id": userLog.id,
      object,
      "task_id": task.id,
      "type": 2
    });
  };

  // =================================================================
  // 4. CHAMADAS À API E DADOS (FETCHING)
  // =================================================================
  
  async function reqTasks(admin?: boolean) {
    try {
      setIsAdm(admin || false);
      setLoading(true);
      const result: any = await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", urlComplement: `${admin ? '&administrator=1' : ''}` });
      if (result.error) throw new Error(result.message);
      setGetTask(result.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  async function getStateformations() {
    setLoading(true);
    let listState: iStates[] = [{ id: 0, description: '', color: '' }];
    try {
      if (localStorage.gtppStates) {
        listState = JSON.parse(localStorage.gtppStates);
      } else {
        const getStatusTask: any = await fetchData({ method: "GET", pathFile: "GTPP/TaskState.php", params: null, exception: ["no data"], urlComplement: "" });
        if (getStatusTask.error) throw new Error(getStatusTask.message || 'Error generic');
        listState = createStorageState(getStatusTask.data || []);
      }
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      updateStates(listState);
      setLoading(false);
    }
  };

  async function getTaskInformations(): Promise<void> {
    try {
      setLoading(true);
      const getTaskItem: any = await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", exception: ["no data"], urlComplement: `&id=${task.id}` });
      if (getTaskItem.error) throw new Error(getTaskItem.message);
      setTaskDetails(getTaskItem);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  async function updateItemTaskFile(file: string, item_id?: number) {
    try {
      if (item_id) {
        const req: any = await fetchData({
          method: "PUT", pathFile: "GTPP/TaskItem.php", urlComplement: "", exception: ["no data"], params: {
            "task_id": task.id, "id": item_id, "file": file
          }
        });
        if (req.error) throw new Error();
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  async function updateStateTask(taskId: number, resource: string | null, date: string | null) {
    setLoading(true);
    const req: any = await fetchData({ method: "PUT", params: { task_id: taskId, reason: resource, days: parseInt(date ? date : "0") }, pathFile: "GTPP/TaskState.php" }) || { error: false };
    setLoading(false);
    const response = req.error ? {} : req.data instanceof Array ? req.data[0].id : req.data.id;
    return response;
  };
  
  // =================================================================
  // 5. AÇÕES E MANIPULADORES DE LÓGICA (HANDLERS)
  // =================================================================

  async function loadTasks(admin?: boolean) {
    try {
      await reqTasks(admin);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    }
  };

  async function checkedItem(id: number, checked: boolean, idTask: any, taskLocal: any, yes_no?: number) {
    try {
      setLoading(true);
      const item = yes_no ? { id: parseInt(id.toString()), task_id: idTask.toString(), yes_no: parseInt(yes_no.toString()) } : { check: checked, id: id, task_id: idTask };
      let result: { error: boolean, data?: any, message?: string } = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" }) || { error: false };

      if (result.error) throw new Error(result.message);
      if (!yes_no) taskLocal.check = checked;
      if (yes_no) reloadPageChangeQuestion(yes_no, id);

      reloadPagePercent(result.data, { task_id: idTask });
      await verifyChangeState(result.data.state_id, task.state_id, taskLocal, result.data);
      infSenCheckItem(taskLocal, result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleAddTask(description: string, task_id: string, yes_no: number, file?: string) {
    setLoading(true);
    try {
      const response: any = await fetchData({
        method: "POST", params: { description: description, file: file ? file : '', task_id: task_id, yes_no }, pathFile: "GTPP/TaskItem.php"
      });
      if (response.error) throw new Error(response.message);

      const item = {
        "id": response.data.last_id, "description": description, "check": false, "task_id": parseInt(task_id),
        "order": response.data.order, "yes_no": response.data.yes_no, "file": file ? 1 : 0, "note": null
      };

      if (taskDetails.data) {
        Array.isArray(taskDetails.data?.task_item) ? taskDetails.data?.task_item.push(item) : taskDetails.data.task_item = [item];
      }

      ws.current.informSending({
        user_id: userLog, object: { "description": "Novo item adicionado", "percent": response.data.percent, "itemUp": item },
        task_id, type: 2
      });
      setTaskDetails({ ...taskDetails });
      reloadPagePercent(response.data, { task_id: task_id });

      if (task.state_id != response.data.state_id) {
        await verifyChangeState(response.data.state_id, task.state_id, { task_id: task.id }, response.data);
      }
    } catch (error: any) {
      console.error("Error adding task:" + error.message);
    } finally {
      setLoading(false);
    }
  };

  async function changeDescription(description: string, id: number, descLocal: string) {
    setLoading(true);
    try {
      await fetchData({ method: "PUT", pathFile: "GTPP/Task.php", exception: ["no data"], params: { id: id, full_description: description } });
      ws.current.informSending({
        error: false, user_id: userLog.id,
        object: { description: "A descrição completa da tarefa foi atualizada", task_id: id, full_description: description },
        task_id: descLocal, type: 3,
      });
    } catch (error) {
      console.error("erro ao fazer o PUT em Task.php");
    } finally {
      setLoading(false);
    }
  };

  async function changeObservedForm(taskId: number, subId: number, value: string, isObservation: boolean) {
    setLoading(true);
    try {
      const item: any = { id: subId, task_id: taskId };
      item[isObservation ? 'note' : 'description'] = value;
      const response: any = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      if (response.error) throw new Error(response.message);

      await getTaskInformations();
      ws.current.informSending({
        error: false, user_id: userLog.id, object: item, task_id: taskId, type: 2,
      });
    } catch (error) {
      console.error("Ocorreu um erro ao salvar a tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  async function stopAndToBackTask(taskId: number, resource: string | null, date: string | null, taskList: any) {
    try {
      const taskState: any = await updateStateTask(taskId, resource, date);
      if (!taskState || taskState.error) {
        throw new Error(taskState?.message || "Falha genérica ao atualizar o estado da tarefa.");
      }

      if (task.id === taskId) {
        setTask((prevTask: any) => ({ ...prevTask, state_id: taskState, percent: task.percent || prevTask.percent }));
      }
      
      if (taskList.state_id == 5) {
        upTask(taskId, resource, date, taskList, `Tarefa que estava bloqueada está de volta!`, 6, { "description": "send", "task_id": taskId, "state_id": taskState, "percent": task.percent || taskList.percent, "new_final_date": addDays(parseInt(date || "0")) });
      } else if (taskList.state_id == 4 || taskList.state_id == 6) {
        upTask(taskId, resource, date, taskList, taskList.state_id == 4 ? `send` : 'send', 6, { "description": "send", "task_id": taskId, "state_id": taskState });
      } else if (taskList.state_id == 1 || taskList.state_id == 2) {
        upTask(taskId, resource, date, taskList, "A tarefa foi parada!", 6, { "description": "send", "task_id": taskId, "state_id": taskState });
      } else if (taskList.state_id == 3) {
        upTask(taskId, resource, date, taskList, "A tarefa finalizada!", 6, { "description": "send", "task_id": taskId, "state_id": taskState, "percent": task.percent || taskList.percent });
      }
      closeCardDefaultGlobally(taskId);
    } catch (error: any) {
      console.error(`[stopAndToBackTask] Caught error:`, error);
      handleNotification("Atenção!", error.message, "danger");
    }
  };

  async function updatedForQuestion(item: { task_id: number; id: number; yes_no: number }) {
    try {
      setLoading(true);
      const req: any = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      if (req.error) throw new Error(req.message);
      const newItem = taskDetails.data?.task_item.filter((element:any) => element.id == item.id);
      if (!newItem) throw new Error("Falha ao recuperar a tarefa");
      newItem[0].yes_no = item.yes_no;
      itemUp({ itemUp: newItem[0], id: item.task_id, percent: task.percent });
      await upTask(item.task_id, null, null, null, "Agora é um item comum", 2, {
        "description": item.yes_no == 0 ? "Alterado para um item comum" : "Alterado para questão ",
        "percent": task.percent, "itemUp": { ...newItem[0] }, isItemUp: true
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  async function verifyChangeState(newState: number, oldState: number, taskLocal: any, result: any) {
    if (newState != oldState) {
      await loadTasks();
      infSenStates(taskLocal, result);
    }
  };

  async function upTask(taskId: number, resource: string | null, date: string | null, taskList: any, message: string, type: number, object?: {}) {
    setLoading(true);
    ws.current.informSending(
      classToJSON(new InformSending(false, userLog.id, taskId, type, object || { description: message, task_id: taskId, reason: resource, days: date, taskState: taskList.state_id }))
    );
    await loadTasks();
    setLoading(false);
  };

  // =================================================================
  // 6. FUNÇÕES DE ATUALIZAÇÃO DE UI (SINCRONIZAÇÃO DE ESTADO)
  // =================================================================

  function updateStates(newList: any[]) {
    localStorage.gtppStates = JSON.stringify(newList);
    setStates(newList);
  };

  function reloadPagePercent(value: any, taskLocal: any) {
    if (task.id == taskLocal.task_id) {
      setTaskPercent(parseInt(value.percent));
      dispatch({ type: 'UPDATE_TASK_PERCENT_IN_LIST', payload: { taskId: taskLocal.task_id, percent: parseInt(value.percent) } });
    }
  };

  function reloadPageChangeQuestion(yes_no: number, item_id: number) {
    if (taskDetails.data?.task_item) {
      const newItems = taskDetails.data.task_item.map((item: any) => 
        item.id === item_id ? { ...item, yes_no } : item
      );
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, task_item: newItems } });
    }
  };

  function reloadPageDeleteItem(value: any) {
    if (taskDetails.data?.task_item) {
      const newItems = taskDetails.data.task_item.filter((item: any) => item.id !== value.object.itemUp);
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, task_item: newItems } });
    }
    reloadPagePercent(value.object, value);
  };

  function reloadPageItem(object: any) {
    if (object.itemUp) reloadPageAddItem(object);
    else reloadPageUpNoteItem(object);
  };

  function reloadPageAddItem(object: any) {
    if (taskDetails.data) {
      const newItems = [...(taskDetails.data.task_item || []), object.itemUp];
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, task_item: newItems } });
    }
    reloadPagePercent(object, object.itemUp);
  };

  function reloadPageUpNoteItem(object: any) {
    if (taskDetails.data?.task_item) {
      const newItems = taskDetails.data.task_item.map((item: any) => 
        item.id === object.id ? { ...item, note: object.note } : item
      );
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, task_item: newItems } });
    }
  };

  function itemUp(value: any) {
    if (taskDetails.data?.task_item) {
      const newItems = taskDetails.data.task_item.map((element: any) => 
        element.id === value.itemUp.id ? value.itemUp : element
      );
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, task_item: newItems } });
    }
    reloadPagePercent(value, value.itemUp);
  };

  function getDescription(description: any) {
    if (taskDetails.data) {
      setTaskDetails({ ...taskDetails, data: { ...taskDetails.data, full_description: description.full_description } });
    }
  };

  function clearGtppWsContext() {
    dispatch({ type: 'RESET_CONTEXT' });
  };

  // =================================================================
  // 7. LÓGICA AUXILIAR E NOTIFICAÇÕES
  // =================================================================

  function createStorageState(list: iStates[]) {
    return list.map(element => ({ ...element, active: true }));
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notificações não são suportadas neste navegador.");
      return;
    }
    if (Notification.permission === "granted") {
      setOnSounds(true);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") setOnSounds(true);
    }
  };

  async function updateNotification(item: any[]) {
    try {
      setLoading(true);
      if (onSounds) {
        const audio = new Audio(soundFile);
        audio.play().catch((error) => console.error('Erro ao reproduzir o som:', error));
      }
      const notify = new NotificationGTPP();
      await notify.loadNotify(item, states);
      dispatch({ type: 'ADD_NOTIFICATION', payload: notify.list });
      handleNotification(notify.list[0]["title"], notify.list[0]["message"], notify.list[0]["typeNotify"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function addDays(daysToAdd: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };
  
  // =================================================================
  // 8. RETORNO DO PROVIDER
  // =================================================================
  return (
    <GtppWsContext.Provider
      value={{
        // Expondo o estado do reducer
        taskDetails, task, taskPercent, userTaskBind, notifications, states, onSounds, getTask, isAdm, openCardDefault,
        
        // Funções
        updateItemTaskFile, updatedForQuestion, reloadPagePercent, deleteItemTaskWS, addUserTask, getTaskInformations,
        setOpenCardDefault, loadTasks, reqTasks, setGetTask, updateStates, setOnSounds, setNotifications,
        setTaskPercent, setTask, handleAddTask, setTaskDetails, clearGtppWsContext, checkedItem,
        checkTaskComShoDepSub: () => {},
        changeDescription, stopAndToBackTask, changeObservedForm
      }}
    >
      {children}
    </GtppWsContext.Provider>
  );
};

// =================================================================
// HOOK CUSTOMIZADO DE ACESSO AO CONTEXTO
// =================================================================
export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
