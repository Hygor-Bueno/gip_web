import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CustomNotification, iGtppWsContextType, iStates, iTaskReq } from "../../../Interface/iGIPP";
import GtppWebSocket from "./GtppWebSocket";
import { Connection } from "../../../Connection/Connection";
import { useMyContext } from "../../../Context/MainContext";
import InformSending from "../Class/InformSending";
import { classToJSON, handleNotification } from "../../../Util/Util";
import NotificationGTPP from "../Class/NotificationGTPP";
import soundFile from "../../../Assets/Sounds/notify.mp3";
import { useConnection } from "../../../Context/ConnContext";
import { useNavigate } from "react-router-dom";

const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [taskPercent, setTaskPercent] = useState<number>(0);
  const [task, setTask] = useState<any>({}); // achei
  const [taskDetails, setTaskDetails] = useState<iTaskReq>({});
  const [onSounds, setOnSounds] = useState<boolean>(false);
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [getTask, setGetTask] = useState<any[]>([]);
  const [states, setStates] = useState<iStates[]>([{ color: '', description: '', id: 0 }]);

  const navigate = useNavigate();

  // GET
  const [userTaskBind, setUserTaskBind] = useState<any[]>([]);
  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  const ws = useRef(new GtppWebSocket());
  const { userLog } = useMyContext();

  useEffect(() => {
    // Abre a coonexão com o websocket.
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

  // Garante a atualização do callback.
  useEffect(() => {
    ws.current.callbackOnMessage = callbackOnMessage;
  }, [task, taskDetails, notifications, onSounds, openCardDefault]);

  // Recupera as informações detalhadas da tarefa.
  useEffect(() => {
    (
      async () => {
        task.id && await getTaskInformations();
      }
    )();
  }, [task]);

  // Carrega lista de tarefas que você criou ou você foi vínculado.
  useEffect(() => {
    (
      async () => {
        await loadTasks();
      }
    )();
  }, []);

  async function loadTasks(admin?: boolean) {
    try {
      await reqTasks(admin);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    }
  }

  async function reqTasks(admin?: boolean) {
    setLoading(true);
    const getTask: any = await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", urlComplement: `${admin ? '&administrator=1' : ''}` });
    if (getTask.error) throw new Error(getTask.message);
    setGetTask(getTask.data);
    setLoading(false);
  }

  async function getStateformations() {
    setLoading(true);
    let listState: iStates[] = [{ id: 0, description: '', color: '' }];
    try {
      if (localStorage.gtppStates) {
        listState = JSON.parse(localStorage.gtppStates);
      } else {
        const connection = new Connection("18", true);
        const getStatusTask: { error: boolean, message?: string, data?: [{ id: number, description: string, color: string }] } = await connection.get("", "GTPP/TaskState.php") || { error: false };
        if (getStatusTask.error) throw new Error(getStatusTask.message || 'Error generic');
        const list = createStorageState(getStatusTask.data || [{ id: 0, description: '', color: '' }]);
        listState = list;
      }
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      updateStates(listState);
      setLoading(false);
    }
  }

  // Criei uma função necessaria
  const closeCardDefaultGlobally = (taskId?: number) => {
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: {
        description: "O card padrão foi fechado por outro usuário.",
        task_id: taskId,
      },
      task_id: taskId,
      type: 7,
    });
  };

  function updateStates(newList: any[]) {
    localStorage.gtppStates = JSON.stringify(newList);
    setStates([...newList]);
  }

  function createStorageState(list: iStates[]) {
    let listState: [{ id: number, description: string, color: string }] = [{ id: 0, description: '', color: '' }];
    list.forEach((element: { id: number, description: string, color: string }, index) => {
      const item = { id: element.id, description: element.description, color: element.color, active: true }
      index == 0 ? listState[index] = item : listState.push(item);
    });
    return listState
  }
  async function getTaskInformations(): Promise<void> {
    try {
      setLoading(true);
      const connection = new Connection("18", true);
      const getTaskItem: any = await connection.get(`&id=${task.id}`, "GTPP/Task.php");
      if (getTaskItem.error) throw new Error(getTaskItem.message);
      setTaskDetails(getTaskItem);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  function addUserTask(element: any, type: number) {
    const info: {
      error: boolean;
      user_id: number;
      send_user_id: number;
      object: {
        description: string;
        changeUser?: number;
        task_id?: number;
      };
      task_id: number;
      type: number
    } = {
      "error": false,
      "user_id": element.user_id,
      "send_user_id": userLog.id,
      "object": {
        "description": type === 5 ? `${element.name} foi vinculado a tarefa` : `${element.name} foi removido da tarefa`
      },
      "task_id": element.task_id,
      "type": type
    }
    if (type === 5) info.object.changeUser = element.user_id;
    if (type === 5) info.object.task_id = element.task_id;
    ws.current.informSending(info);
  }

  async function callbackOnMessage(event: any) {
    let response = JSON.parse(event.data);
    // console.log(event.data,localStorage.getItem("tokenGIPP"));
    if (
      response.error &&
      response.message.includes("This user has been connected to another place")
    ) {
      // handleNotification("Você será desconectado.", "Usuário logado em outro dispositivo!", "danger");
      // setTimeout(() => {
      //   navigate("/");
      //   localStorage.removeItem("tokenGIPP");
      //   localStorage.removeItem("codUserGIPP");
      // }, 5000);
    }

    if (!response.error && response.send_user_id != localStorage.codUserGIPP) {
      updateNotification([response]);

      if (response.type == -1 || response.type == 2 || response.type == 6) {
        if (response.type == 6) {
          if (task.id === response.task_id) {

            console.log("[websocket response]", response);
            console.log("[websocket task]", task);

            const updatedTask = {
              ...task,
              state_id: response.object?.state_id,
              percent: response.object?.percent,
            };
            setTask(updatedTask);
          }
          await loadTasks();
        }else if (response.object) {
          if (response.type == 2) {
            if (response.object.isItemUp) {
              itemUp(response.object);
            } else if (response.object.remove) {
              reloadPageDeleteItem(response);
            } else {
              reloadPageItem(response.object);
            }
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
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notificações não são suportadas neste navegador.");
      return;
    }

    if (Notification.permission === "granted") {
      setOnSounds(true);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setOnSounds(true);
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);


  async function updateNotification(item: any[]) {
    try {
      setLoading(true);
      if (onSounds) {
        const audio = new Audio(soundFile);
        audio.play().catch((error) => {
          console.error('Erro ao reproduzir o som:', error);
        });
      }

      const notify = new NotificationGTPP();
      await notify.loadNotify(item, states);
      notifications.push(...notify.list);
      setNotifications([...notifications]);
      setNotifications((prevNotifications) => [...prevNotifications, ...notify.list]);

      handleNotification(notify.list[0]["title"], notify.list[0]["message"], notify.list[0]["typeNotify"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getDescription(description: any) {
    if (taskDetails.data) {
      taskDetails.data.full_description = description.full_description;
      setTaskDetails({ ...taskDetails });
    }
  }

  async function checkedItem(
    id: number,
    checked: boolean,
    idTask: any,
    taskLocal: any,
    yes_no?: number
  ) {
    try {
      setLoading(true);

      const item = yes_no ? { id: parseInt(id.toString()), task_id: idTask.toString(), yes_no: parseInt(yes_no.toString()) } : { check: checked, id: id, task_id: idTask }

      let result: { error: boolean, data?: any, message?: string } = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" }) || { error: false };

      if (result.error) throw new Error(result.message);
      if (!yes_no) taskLocal.check = checked;
      if (yes_no) reloadPageChangeQuestion(yes_no, id);

      // Atualiza o percentual da tarafa na tela principal. 
      reloadPagePercent(result.data, { task_id: idTask });

      // Verifica se o checked realizado alterou o status da tarefa. Se sim ele envia um alerta!
      await verifyChangeState(result.data.state_id, task.state_id, taskLocal, result.data);

      //Informa que um item foi marcado.
      infSenCheckItem(taskLocal, result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyChangeState(newState: number, oldState: number, taskLocal: any, result: any) {
    if (newState != oldState) {
      await loadTasks();
      infSenStates(taskLocal, result);
    }
  }

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
  }

  function infSenCheckItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, {
      description: taskLocal.check
        ? "Um item foi marcado"
        : "Um item foi desmarcado",
      percent: result.percent,
      itemUp: taskLocal,
      isItemUp: true,
    })));
  }

  async function checkTaskComShoDepSub(
    task_id: number,
    company_id: number,
    shop_id: number,
    depart_id: number,
    taskLocal: any
  ) {
    setLoading(true);
    try {
      const connection = new Connection("18");
      await connection.post(
        {
          task_id: task_id,
          company_id: company_id,
          shop_id: shop_id,
          depart_id: depart_id,
        },
        "GTPP/TaskComShoDepSub.php"
      );
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: {
          description: "A descrição completa da tarefa foi atualizada",
          task_id: task_id,
          company_id: company_id,
          shop_id: shop_id,
          depart_id: depart_id,
        },
        task_id: taskLocal,
        type: 2,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(
    description: string,
    task_id: string,
    yes_no: number,
    file?: string
  ) {
    setLoading(true);
    try {
      const response: any = await fetchData({
        method: "POST", params: {
          description: description,
          file: file ? file : '',
          task_id: task_id,
          yes_no
        }, pathFile: "GTPP/TaskItem.php"
      });
      if (response.error) throw new Error(response.message);

      const item = {
        "id": response.data.last_id,
        "description": description,
        "check": false,
        "task_id": parseInt(task_id),
        "order": response.data.order,
        "yes_no": response.data.yes_no,
        "file": file ? 1 : 0,
        "note": null
      };

      if (taskDetails.data) {
        Array.isArray(taskDetails.data?.task_item) ? taskDetails.data?.task_item.push(item) : taskDetails.data.task_item = [item];
      }

      ws.current.informSending({
        user_id: userLog,
        object: {
          "description": "Novo item adicionado",
          "percent": response.data.percent,
          "itemUp": item,
        },
        task_id,
        type: 2
      });
      setTaskDetails({ ...taskDetails });
      reloadPagePercent(response.data, { task_id: task_id });

      // Verifica se o checked realizado alterou o status da tarefa. Se sim ele envia um alerta!
      if (task.state_id != response.data.state_id) {
        await verifyChangeState(response.data.state_id, task.state_id, { task_id: task.id }, response.data);
      }

    } catch (error: any) {
      console.error("Error adding task:" + error.message);

    } finally {
      setLoading(false);
    }
  };

  // Aqui podemos trabalhar de forma horizontal para atualizar a descrição da tarefa de ponta a ponta.
  async function changeDescription(
    description: string,
    id: number,
    descLocal: string
  ) {
    setLoading(true);
    try {
      const connection = new Connection("18");
      await connection.put(
        { id: id, full_description: description },
        "GTPP/Task.php"
      );
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: {
          description: "A descrição completa da tarefa foi atualizada",
          task_id: id,
          full_description: description,
        },
        task_id: descLocal,
        type: 3,
      });
    } catch (error) {
      console.error("erro ao fazer o PUT em Task.php");
    } finally {
      setLoading(false);
    }
  }
  async function updateItemTaskFile(file: string, item_id?: number) {
    try {
      if (item_id) {
        const connection = new Connection("18");
        const req: any = await connection.put({
          "task_id": task.id,
          "id": item_id,
          "file": file
        }, 'GTPP/TaskItem.php');
        if (req.error) throw new Error();
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  // AQUI VOU PRECISAR MONTAR UMA CONDICIONAL PARA MUDAR A DESCRIÇÃO E COLOCAR UMA OBSERVAÇÃO.
  async function changeObservedForm(
    taskId: number,
    subId: number,
    value: string,
    isObservation: boolean,
  ) {
    setLoading(true);
    try {
      const item: any = {
        id: subId,
        task_id: taskId
      };
      item[isObservation ? 'note' : 'description'] = value;

      const response: any = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });

      if (response.error) throw new Error(response.message);

      await getTaskInformations();
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: item,
        task_id: taskId,
        type: 2,
      });

    } catch (error) {
      console.error("Ocorreu um erro ao salvar a tarefa. Tente novamente."); // Notificação amigável ao usuário
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  }

  async function upTask(taskId: number, resource: string | null, date: string | null, taskList: any, message: string, type: number, object?: {}) {
    setLoading(true);
    ws.current.informSending(
      classToJSON(
        new InformSending(false, userLog.id, taskId, type, object || { description: message, task_id: taskId, reason: resource, days: date, taskState: taskList.state_id })
      )
    );
    await loadTasks();
    setLoading(false);
  }

  async function updateStateTask(taskId: number, resource: string | null, date: string | null) {
    setLoading(true);
    const req: any = await fetchData({ method: "PUT", params: { task_id: taskId, reason: resource, days: parseInt(date ? date : "0") }, pathFile: "GTPP/TaskState.php" }) || { error: false };
    setLoading(false);
    const response = req.error ? {} : req.data instanceof Array ? req.data[0].id : req.data.id;
    return response;
  }

  function addDays(daysToAdd: number) {
    const date = new Date(); // Pega a data atual
    date.setDate(date.getDate() + daysToAdd); // Adiciona os dias
    return date.toISOString().split('T')[0]; // Retorna no formato "YYYY-MM-DD"
  }

  // estou resolvendo os botões aqui!
  async function stopAndToBackTask(
  taskId: number,
  resource: string | null,
  date: string | null,
  taskList: any
) {
    try {
      const taskState: any = await updateStateTask(taskId, resource, date);

      if (!taskState || taskState.error) {
        console.error("API Error - taskState:", taskState);
        throw new Error(taskState?.message || "Falha genérica ao atualizar o estado da tarefa.");
      }

      if (task.id === taskId) {
        setTask((prevTask: any) => {
          const newState = {
            ...prevTask,
            state_id: taskState,
            percent: task.percent || prevTask.percent,
          }
          return newState;
        });
      }

      if (taskList.state_id == 5) {
        upTask(taskId, resource, date, taskList, `Tarefa que estava bloqueada está de volta!`, 6, {
          "description": "send",
          "task_id": taskId,
          "state_id": taskState,
          "percent": task.percent || taskList.percent,
          "new_final_date": addDays(parseInt(date || "0"))
        });
      }
      else if (taskList.state_id == 4 || taskList.state_id == 6) {
        upTask(taskId, resource, date, taskList, taskList.state_id == 4 ? `send` : 'send', 6, {
          "description": "send",
          "task_id": taskId,
          "state_id": taskState
        });
      }
      else if (taskList.state_id == 1 || taskList.state_id == 2) {
        upTask(taskId, resource, date, taskList, "A tarefa foi parada!", 6, {
          "description": "send",
          "task_id": taskId,
          "state_id": taskState
        });
      }
      else if (taskList.state_id == 3) {
        upTask(taskId, resource, date, taskList, "A tarefa finalizada!", 6, {
          "description": "send",
          "task_id": taskId,
          "state_id": taskState,
          "percent": task.percent || taskList.percent,
        });
      }
      closeCardDefaultGlobally(taskId);
    } catch (error: any) {
      console.error(`[stopAndToBackTask] Caught error:`, error);
      handleNotification("Atenção!", error.message, "danger");
    }
  }

  async function updatedForQuestion(item: { task_id: number; id: number; yes_no: number }) {
    try {
      setLoading(true);
      const req: any = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      if (req.error) throw new Error(req.message);
      const newItem = taskDetails.data?.task_item.filter((element) => element.id == item.id);
      if (!newItem) throw new Error("Falha ao recuperar a tarefa");
      newItem[0].yes_no = item.yes_no;
      itemUp({ itemUp: newItem[0], id: item.task_id, percent: task.percent });
      await upTask(item.task_id, null, null, null, "Agora é um item comum", 2, {
        "description": item.yes_no == 0 ? "Alterado para um item comum" : "Alterado para questão ",
        "percent": task.percent,
        "itemUp": {
          ...newItem[0]
        },
        isItemUp: true
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function deleteItemTaskWS(object: any) {
    ws.current.informSending({
      "user_id": userLog.id,
      object,
      "task_id": task.id,
      "type": 2
    });
  }
  // FUNÇÕES PARA ATUALIZAR AS INFORMAÇÕES DA PÁGINA:
  function reloadPagePercent(value: any, taskLocal: any) {
    if (task.id == taskLocal.task_id) {
      setTaskPercent(parseInt(value.percent));
      if (getTask.length > 0) {
        getTask[getTask.findIndex(item => item.id == taskLocal.task_id)].percent = parseInt(value.percent);
        setGetTask([...getTask]);
      }
    }
  }

  function reloadPageChangeQuestion(yes_no: number, item_id: number) {
    if (taskDetails.data?.task_item) {
      taskDetails.data.task_item[taskDetails.data?.task_item.findIndex(item => item.id == item_id)].yes_no = yes_no;
    }
  }

  function reloadPageDeleteItem(value: any) {
    const indexDelete: number | undefined = taskDetails.data?.task_item.findIndex(item => item.id == value.object.itemUp);
    if (indexDelete != undefined && indexDelete >= 0) {
      taskDetails.data?.task_item.splice(indexDelete, 1);
      setTaskDetails({ ...taskDetails });
    }
    reloadPagePercent(value.object, value);
  }

  function reloadPageItem(object: any) {
    if (object.itemUp) {
      reloadPageAddItem(object);
    } else {
      reloadPageUpNoteItem(object)
    }
  }
  function reloadPageAddItem(object: any) {
    taskDetails.data?.task_item.push(object.itemUp);
    setTaskDetails({ ...taskDetails });
    reloadPagePercent(object, object.itemUp);
  }

  function reloadPageUpNoteItem(object: any) {
    if (taskDetails.data) taskDetails.data.task_item[0].note = object.note;
    setTaskDetails({ ...taskDetails });
  }

  function itemUp(value: any) {
    taskDetails.data?.task_item.forEach((element, index) => {
      if (taskDetails.data && element.id == value.itemUp.id)
        taskDetails.data.task_item[index] = value.itemUp;
    });

    setTaskDetails({ ...taskDetails });
    reloadPagePercent(value, value.itemUp);
  }

  function clearGtppWsContext() {
    setTask({});
    setTaskDetails({});
  }

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
        changeObservedForm
      }}
    >
      {children}
    </GtppWsContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
