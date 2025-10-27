import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { CustomNotification, iGtppWsContextType, iStates, iTaskReq } from "../../../Interface/iGIPP";
import GtppWebSocket from "./GtppWebSocket";
import { useMyContext } from "../../../Context/MainContext";
import InformSending from "../Class/InformSending";
import { classToJSON, handleNotification } from "../../../Util/Util";
import NotificationGTPP from "../Class/NotificationGTPP";
import soundFile from "../../../Assets/Sounds/notify.mp3";
import { useConnection } from "../../../Context/ConnContext";
import { useNavigate } from "react-router-dom";

/**
 * Contexto para gerenciamento do WebSocket e estado relacionado às tarefas no sistema GTPP.
 * @constant {React.Context<iGtppWsContextType | undefined>} GtppWsContext
 */
const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

/**
 * Provedor de contexto para WebSocket e gerenciamento de tarefas no sistema GTPP.
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Componentes filhos que serão encapsulados pelo provedor.
 * @returns {JSX.Element} Provedor do contexto WebSocket com os filhos.
 */
export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Estado que armazena o percentual de progresso da tarefa atual.
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [taskPercent, setTaskPercent] = useState<number>(0);

  /**
   * Estado que armazena os dados da tarefa atual.
   * @type {[any, React.Dispatch<React.SetStateAction<any>>]}
   */
  const [task, setTask] = useState<any>({});

  /**
   * Estado que armazena os detalhes da tarefa atual.
   * @type {[iTaskReq, React.Dispatch<React.SetStateAction<iTaskReq>>]}
   */
  const [taskDetails, setTaskDetails] = useState<iTaskReq>({});

  /**
   * Estado que controla se as notificações sonoras estão ativadas.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [onSounds, setOnSounds] = useState<boolean>(false);

  /**
   * Estado que controla se o card padrão está aberto.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);

  /**
   * Estado que armazena a lista de notificações do sistema.
   * @type {[CustomNotification[], React.Dispatch<React.SetStateAction<CustomNotification[]>>]}
   */
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);

  /**
   * Estado que armazena a lista de tarefas recuperadas.
   * @type {[any[], React.Dispatch<React.SetStateAction<any[]>>]}
   */
  const [getTask, setGetTask] = useState<any[]>([]);

  /**
   * Estado que armazena a lista de estados possíveis das tarefas.
   * @type {[iStates[], React.Dispatch<React.SetStateAction<iStates[]>>]}
   */
  const [states, setStates] = useState<iStates[]>([{ color: '', description: '', id: 0 }]);

  /**
   * Estado que indica se o usuário é administrador.
   * @type {[any, React.Dispatch<React.SetStateAction<any>>]}
   */
  const [isAdm, setIsAdm] = useState<any>(false);

  /**
   * Estado que armazena informações do usuário atual.
   * @type {[any, React.Dispatch<React.SetStateAction<any>>]}
   */
  const [getUser, setGetUser] = useState<any>("");

  /**
   * Estado que armazena a lista de vinculações de usuários às tarefas.
   * @type {[any[], React.Dispatch<React.SetStateAction<any[]>>]}
   */
  const [userTaskBind, setUserTaskBind] = useState<any[]>([]);

  /**
   * Contexto principal da aplicação, contendo informações do usuário logado e controle de loading.
   * @type {Object}
   */
  const { setLoading, userLog } = useMyContext();

  /**
   * Hook para realizar navegação entre rotas.
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Hook para realizar chamadas à API.
   * @type {Object}
   */
  const { fetchData } = useConnection();

  /**
   * Referência ao objeto WebSocket para comunicação em tempo real.
   * @type {React.MutableRefObject<GtppWebSocket>}
   */
  const ws = useRef(new GtppWebSocket());

  /**
   * Efeito que inicializa a conexão WebSocket, carrega notificações e estados iniciais.
   * @function
   */
  useEffect(() => {
    ws.current.connect();
    (async () => {
      setLoading(true);
      try {
        const getNotify: any = await fetchData({
          method: "GET",
          params: null,
          pathFile: 'GTPP/Notify.php',
          urlComplement: `&id_user=${userLog.id}`,
          exception: ["No data"]
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
        localStorage.removeItem('gtppStates');
        ws.current.disconnect();
      }
    };
  }, []);

  /**
   * Efeito que atualiza o callback de mensagens do WebSocket.
   * @function
   */
  useEffect(() => {
    ws.current.callbackOnMessage = callbackOnMessage;
  }, [task, taskDetails, notifications, onSounds, openCardDefault]);

  /**
   * Efeito que carrega detalhes da tarefa quando a tarefa muda.
   * @function
   */
  useEffect(() => {
    (async () => {
      task.id && await getTaskInformations();
    })();
  }, [task]);

  /**
   * Efeito que carrega a lista de tarefas vinculadas ao usuário.
   * @function
   */
  useEffect(() => {
    if (!userLog?.id) return;
    loadTasks();
  }, [isAdm, userLog?.id]);

  /**
   * Carrega a lista de tarefas do usuário ou administrador.
   * @function
   * @async
   */
  const loadTasks = async () => {
    try {
      await reqTasks();
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    }
  };

  /**
   * Faz a requisição de tarefas via API.
   * @function
   * @async
   */
  async function reqTasks() {
    try {
      setLoading(true);
      const getTask: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Task.php",
        urlComplement: `${isAdm ? "&administrator=1" : ""}`,
      });
      if (getTask.error) throw new Error(getTask.message);
      setGetTask(getTask.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Recupera os estados das tarefas do armazenamento local ou API.
   * @function
   * @async
   */
  async function getStateformations() {
    setLoading(true);
    let listState: iStates[] = [{ id: 0, description: '', color: '' }];
    try {
      if (localStorage.gtppStates) {
        listState = JSON.parse(localStorage.gtppStates);
      } else {
        const getStatusTask: { error: boolean, message?: string, data?: [{ id: number, description: string, color: string }] } = 
        await fetchData({ method: "GET", pathFile: "GTPP/TaskState.php", params: null, exception: ["no data"], urlComplement: "" });
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

  /**
   * Fecha o card padrão globalmente e notifica outros usuários.
   * @function
   * @param {number} [taskId] - ID da tarefa (opcional).
   */
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

  /**
   * Atualiza os estados das tarefas no armazenamento local e no estado.
   * @function
   * @param {any[]} newList - Nova lista de estados.
   */
  function updateStates(newList: any[]) {
    localStorage.gtppStates = JSON.stringify(newList);
    setStates([...newList]);
  }

  /**
   * Cria uma lista de estados para armazenamento local.
   * @function
   * @param {iStates[]} list - Lista de estados.
   * @returns {[{ id: number, description: string, color: string }]} Lista formatada.
   */
  function createStorageState(list: iStates[]) {
    let listState: [{ id: number, description: string, color: string }] = [{ id: 0, description: '', color: '' }];
    list.forEach((element: { id: number, description: string, color: string }, index) => {
      const item = { id: element.id, description: element.description, color: element.color, active: true };
      index == 0 ? listState[index] = item : listState.push(item);
    });
    return listState;
  }

  /**
   * Recupera informações detalhadas de uma tarefa específica.
   * @function
   * @async
   * @returns {Promise<void>}
   */
  async function getTaskInformations(): Promise<void> {
    try {
      setLoading(true);
      const getTaskItem: any = 
      await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", exception: ["no data"], urlComplement: `&id=${task.id}` });
      if (getTaskItem.error) throw new Error(getTaskItem.message);
      setTaskDetails(getTaskItem);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Adiciona ou remove um usuário de uma tarefa e notifica via WebSocket.
   * @function
   * @param {any} element - Dados do usuário e tarefa.
   * @param {number} type - Tipo de notificação (5 para vincular, outro para remover).
   */
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
      type: number;
    } = {
      error: false,
      user_id: element.user_id,
      send_user_id: userLog.id,
      object: {
        description: type === 5 ? `${element.name} foi vinculado a tarefa` : `${element.name} foi removido da tarefa`
      },
      task_id: element.task_id,
      type: type
    };
    if (type === 5) info.object.changeUser = element.user_id;
    if (type === 5) info.object.task_id = element.task_id;
    ws.current.informSending(info);
  }

  /**
   * Manipula mensagens recebidas via WebSocket e atualiza o estado da aplicação.
   * @function
   * @async
   * @param {any} event - Evento de mensagem do WebSocket.
   */
  async function callbackOnMessage(event: any) {
    let response = JSON.parse(event.data);
    if (
      response.error &&
      response.message.includes("This user has been connected to another place")
    ) {
      // Lógica de desconexão comentada
    }

    if (!response.error && response.send_user_id != localStorage.codUserGIPP) {
      updateNotification([response]);

      if (response.type == -1 || response.type == 2 || response.type == 6) {
        if (response.type == 6) {
          if (task.id === response.task_id) {
            const updatedTask = {
              ...task,
              state_id: response.object?.state_id,
              percent: response.object?.percent,
            };
            setTask(updatedTask);
          }
          await loadTasks();
        } else if (response.object) {
          if (response.type == 2) {
            if (response.object.isItemUp) {
              itemUp(response.object);
            } else if (response.object.remove) {
              reloadPageDeleteItem(response);
            } else if (response.object.isUserTask) {
              userTaskItem(response.object);
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

  /**
   * Solicita permissão para notificações do navegador.
   * @function
   * @async
   */
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

  /**
   * Efeito que solicita permissão para notificações ao carregar o componente.
   * @function
   */
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  /**
   * Atualiza a lista de notificações com novos itens e reproduz som se ativado.
   * @function
   * @async
   * @param {any[]} item - Lista de notificações a serem adicionadas.
   */
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

  /**
   * Atualiza a descrição completa da tarefa.
   * @function
   * @param {any} description - Objeto contendo a descrição completa.
   */
  function getDescription(description: any) {
    if (taskDetails.data) {
      taskDetails.data.full_description = description.full_description;
      setTaskDetails({ ...taskDetails });
    }
  }

  /**
   * Marca ou desmarca um item da tarefa e atualiza o estado.
   * @function
   * @async
   * @param {number} id - ID do item.
   * @param {boolean} checked - Estado do item (marcado/desmarcado).
   * @param {any} idTask - ID da tarefa.
   * @param {any} taskLocal - Dados locais da tarefa.
   * @param {number} [yes_no] - Indicador de resposta sim/não (opcional).
   */
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
  }

  /**
   * Verifica se houve mudança no estado da tarefa e atualiza se necessário.
   * @function
   * @async
   * @param {number} newState - Novo estado da tarefa.
   * @param {number} oldState - Estado anterior da tarefa.
   * @param {any} taskLocal - Dados locais da tarefa.
   * @param {any} result - Resultado da requisição.
   */
  async function verifyChangeState(newState: number, oldState: number, taskLocal: any, result: any) {
    if (newState != oldState) {
      await loadTasks();
      infSenStates(taskLocal, result);
    }
  }

  /**
   * Envia notificação de mudança de estado da tarefa via WebSocket.
   * @function
   * @param {any} taskLocal - Dados locais da tarefa.
   * @param {any} result - Resultado da requisição.
   */
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

  /**
   * Envia notificação de item marcado/desmarcado via WebSocket.
   * @function
   * @param {any} taskLocal - Dados locais da tarefa.
   * @param {any} result - Resultado da requisição.
   */
  function infSenCheckItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, {
      description: taskLocal.check ? "Um item foi marcado" : "Um item foi desmarcado",
      percent: result.percent,
      itemUp: taskLocal,
      isItemUp: true,
    })));
  }

  /**
   * Envia notificação de vinculação de usuário a um item da tarefa.
   * @function
   * @param {any} taskLocal - Dados locais da tarefa.
   * @param {any} result - Resultado da requisição.
   */
  function infSenUserTaskItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, {
      description: "usuário foi vinculado",
      percent: result.percent,
      itemUp: taskLocal,
      isItemUp: true,
    })));
  }

  /**
   * Vincula uma tarefa a uma empresa, loja ou departamento.
   * @function
   * @async
   * @param {number} task_id - ID da tarefa.
   * @param {number} company_id - ID da empresa.
   * @param {number} shop_id - ID da loja.
   * @param {number} depart_id - ID do departamento.
   * @param {any} taskLocal - Dados locais da tarefa.
   */
  async function checkTaskComShoDepSub(task_id: number, company_id: number, shop_id: number, depart_id: number, taskLocal: any) {
    setLoading(true);
    try {
      await fetchData({
        method: "POST",
        urlComplement: "",
        pathFile: "GTPP/TaskComShoDepSub.php",
        exception: ["no data"],
        params: {
          task_id: task_id,
          company_id: company_id,
          shop_id: shop_id,
          depart_id: depart_id,
        }
      });
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

  /**
   * Adiciona um novo item à tarefa e atualiza o estado.
   * @function
   * @async
   * @param {string} description - Descrição do item.
   * @param {string} task_id - ID da tarefa.
   * @param {number} yes_no - Indicador de resposta sim/não.
   * @param {string} [file] - Arquivo associado (opcional).
   */
  async function handleAddTask(description: string, task_id: string, yes_no: number, file?: string) {
    setLoading(true);
    try {
      const response: any = await fetchData({
        method: "POST",
        params: {
          description: description,
          file: file ? file : '',
          task_id: task_id,
          yes_no
        },
        pathFile: "GTPP/TaskItem.php"
      });
      if (response.error) throw new Error(response.message);

      const item = {
        id: response.data.last_id,
        description: description,
        check: false,
        task_id: parseInt(task_id),
        order: response.data.order,
        created_by: response.data.created_by,
        yes_no: response.data.yes_no,
        file: file ? 1 : 0,
        note: null
      };

      if (taskDetails.data) {
        Array.isArray(taskDetails.data?.task_item) ? taskDetails.data?.task_item.push(item) : taskDetails.data.task_item = [item];
      }

      ws.current.informSending({
        user_id: userLog,
        object: {
          description: "Novo item adicionado",
          percent: response.data.percent,
          itemUp: item,
        },
        task_id,
        type: 2
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
  }

  /**
   * Atualiza a descrição completa de uma tarefa.
   * @function
   * @async
   * @param {string} description - Nova descrição da tarefa.
   * @param {number} id - ID da tarefa.
   * @param {string} descLocal - Descrição local da tarefa.
   */
  async function changeDescription(description: string, id: number, descLocal: string) {
    setLoading(true);
    try {
      await fetchData({
        method: "PUT",
        pathFile: "GTPP/Task.php",
        exception: ["no data"],
        params: { id: id, full_description: description }
      });
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

  /**
   * Atualiza o arquivo associado a um item da tarefa.
   * @function
   * @async
   * @param {string} file - Arquivo a ser associado.
   * @param {number} [item_id] - ID do item (opcional).
   */
  async function updateItemTaskFile(file: string, item_id?: number) {
    try {
      if (item_id) {
        const req: any = await fetchData({
          method: "PUT",
          pathFile: "GTPP/TaskItem.php",
          urlComplement: "",
          exception: ["no data"],
          params: {
            task_id: task.id,
            id: item_id,
            file: file
          }
        });
        if (req.error) throw new Error();
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  /**
   * Atualiza uma observação ou descrição de um item da tarefa.
   * @function
   * @async
   * @param {number} taskId - ID da tarefa.
   * @param {number} subId - ID do subitem.
   * @param {string} value - Novo valor da observação ou descrição.
   * @param {boolean} isObservation - Indica se é uma observação.
   */
  async function changeObservedForm(taskId: number, subId: number, value: string, isObservation: boolean) {
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
      console.error("Ocorreu um erro ao salvar a tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Envia notificação de atualização de tarefa via WebSocket.
   * @function
   * @async
   * @param {number} taskId - ID da tarefa.
   * @param {string | null} resource - Recurso associado (opcional).
   * @param {string | null} date - Data associada (opcional).
   * @param {any} taskList - Dados da tarefa.
   * @param {string} message - Mensagem da notificação.
   * @param {number} type - Tipo de notificação.
   * @param {Object} [object] - Objeto adicional (opcional).
   */
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

  /**
   * Atualiza o estado de uma tarefa via API.
   * @function
   * @async
   * @param {number} taskId - ID da tarefa.
   * @param {string | null} resource - Recurso associado (opcional).
   * @param {string | null} date - Data associada (opcional).
   * @returns {Promise<any>} ID do novo estado ou resposta da API.
   */
  async function updateStateTask(taskId: number, resource: string | null, date: string | null) {
    setLoading(true);
    const req: any = await fetchData({ method: "PUT", params: { task_id: taskId, reason: resource, days: parseInt(date ? date : "0") }, pathFile: "GTPP/TaskState.php" }) || { error: false };
    setLoading(false);
    const response = req.error ? {} : req.data instanceof Array ? req.data[0].id : req.data.id;
    return response;
  }

  /**
   * Adiciona dias à data atual e retorna no formato ISO.
   * @function
   * @param {number} daysToAdd - Número de dias a adicionar.
   * @returns {string} Data no formato "YYYY-MM-DD".
   */
  function addDays(daysToAdd: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  }

  /**
   * Para ou retorna uma tarefa ao estado anterior.
   * @function
   * @async
   * @param {number} taskId - ID da tarefa.
   * @param {string | null} resource - Recurso associado (opcional).
   * @param {string | null} date - Data associada (opcional).
   * @param {any} taskList - Dados da tarefa.
   */
  async function stopAndToBackTask(taskId: number, resource: string | null, date: string | null, taskList: any) {
    try {
      const taskState: any = await updateStateTask(taskId, resource, date);
      if (!taskState || taskState.error) {
        console.error("API Error - taskState:", taskState);
        throw new Error(taskState?.message || "Falha genérica ao atualizar o estado da tarefa.");
      }
      if (!taskState.error) {
        if (taskList.state_id == 5) {
          upTask(
            taskId,
            resource,
            date,
            taskList,
            `Tarefa que estava bloqueada está de volta!`,
            6,
            {
              description: "send",
              task_id: taskId,
              state_id: taskState,
              percent: task.percent || taskList.percent,
              new_final_date: addDays(parseInt(date || "0")),
            }
          );
        } else if (taskList.state_id == 4 || taskList.state_id == 6) {
          upTask(
            taskId,
            resource,
            date,
            taskList,
            taskList.state_id == 4 ? `send` : "send",
            6,
            { description: "send", task_id: taskId, state_id: taskState }
          );
        } else if (taskList.state_id == 1 || taskList.state_id == 2) {
          upTask(taskId, resource, date, taskList, "A tarefa foi parada!", 6, {
            description: "send",
            task_id: taskId,
            state_id: taskState,
          });
        } else if (taskList.state_id == 3) {
          upTask(taskId, resource, date, taskList, "A tarefa finalizada!", 6, {
            description: "send",
            task_id: taskId,
            state_id: taskState,
            percent: task.percent || taskList.percent,
          });
        }
      }
      if (task.id && !isNaN(taskState)) {
        setTask((prevTask: any) => {
          const newState = {
            ...prevTask,
            state_id: taskState,
            percent: task.percent || prevTask.percent,
          };
          return newState;
        });
      }
      closeCardDefaultGlobally(taskId);
    } catch (error: any) {
      console.error(`[stopAndToBackTask] Caught error:`, error);
      handleNotification("Atenção!", error.message, "danger");
    }
  }

  /**
   * Atualiza um item de tarefa para questão ou item comum.
   * @function
   * @async
   * @param {Object} item - Dados do item (task_id, id, yes_no).
   */
  async function updatedForQuestion(item: { task_id: number; id: number; yes_no: number }) {
    try {
      setLoading(true);
      const req: any = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      if (req.error) throw new Error(req.message);
      const newItem = taskDetails.data?.task_item.filter((element) => element.id == item.id);
      if (!newItem) throw new Error("Falha ao recuperar a tarefa");
      newItem[0].yes_no = item.yes_no;
      console.log(newItem[0].yes_no = item.yes_no);
      itemUp({ itemUp: newItem[0], id: item.task_id, percent: task.percent });
      await upTask(item.task_id, null, null, null, "Agora é um item comum", 2, {
        description: item.yes_no == 0 ? "Alterado para um item comum" : "Alterado para questão ",
        percent: task.percent,
        itemUp: { ...newItem[0] },
        isItemUp: true
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Vincula um usuário a um item da tarefa.
   * @function
   * @async
   * @param {Object} item - Dados do item (task_id, user_id, id).
   * @param {Function} setUserState - Função para atualizar o estado do usuário.
   */
  async function updatedAddUserTaskItem(item: { task_id: number, user_id: number, id: number }, setUserState: (item: any) => void) {
    const value = { task_id: item.task_id, id: item.id, assigned_to: item.user_id };
    const { error, message } = await fetchData({ method: "PUT", params: value, pathFile: "GTPP/TaskItem.php", urlComplement: "" });
    if (!error) {
      const newItem: any = taskDetails.data?.task_item.filter((element) => element.id == item.id);
      newItem[0].assigned_to = value.assigned_to;
      ws.current.informSending(
        classToJSON(
          new InformSending(false, userLog.id, item.task_id, 2, {
            description: "Usuário vinculado ao item da tarefa.",
            itemUp: { ...newItem?.[0] },
            isUserTask: true,
          })
        )
      );
      setUserState((prev: any) => ({ ...prev, isListUser: false, loadingList: [] }));
      getTaskInformations();
      setTaskDetails({ ...taskDetails });
      handleNotification('Sucesso', 'usuário vinculado!', 'success');
    }
  }

  /**
   * Remove um item da tarefa e notifica via WebSocket.
   * @function
   * @param {any} object - Objeto contendo informações do item a ser removido.
   */
  function deleteItemTaskWS(object: any) {
    ws.current.informSending({
      user_id: userLog.id,
      object,
      task_id: task.id,
      type: 2
    });
  }

  /**
   * Atualiza o percentual de progresso da tarefa na interface.
   * @function
   * @param {any} value - Dados do percentual.
   * @param {any} taskLocal - Dados locais da tarefa.
   */
  function reloadPagePercent(value: any, taskLocal: any) {
    if (task.id == taskLocal.task_id) {
      setTaskPercent(parseInt(value.percent));
      if (getTask.length > 0) {
        getTask[getTask.findIndex(item => item.id == taskLocal.task_id)].percent = parseInt(value.percent);
        setGetTask([...getTask]);
      }
    }
  }

  /**
   * Atualiza a resposta sim/não de um item da tarefa.
   * @function
   * @param {number} yes_no - Valor da resposta sim/não.
   * @param {number} item_id - ID do item.
   */
  function reloadPageChangeQuestion(yes_no: number, item_id: number) {
    if (taskDetails.data?.task_item) {
      taskDetails.data.task_item[taskDetails.data?.task_item.findIndex(item => item.id == item_id)].yes_no = yes_no;
    }
  }

  /**
   * Remove um item da tarefa na interface.
   * @function
   * @param {any} value - Dados do item a ser removido.
   */
  function reloadPageDeleteItem(value: any) {
    const indexDelete: number | undefined = taskDetails.data?.task_item.findIndex(item => item.id == value.object.itemUp);
    if (indexDelete != undefined && indexDelete >= 0) {
      taskDetails.data?.task_item.splice(indexDelete, 1);
      setTaskDetails({ ...taskDetails });
    }
    reloadPagePercent(value.object, value);
  }

  /**
   * Atualiza a interface com novos itens ou observações.
   * @function
   * @param {any} object - Objeto contendo informações do item.
   */
  function reloadPageItem(object: any) {
    console.log(object);
    if (object.itemUp) {
      reloadPageAddItem(object);
    } else {
      reloadPageUpNoteItem(object);
    }
  }

  /**
   * Adiciona um novo item à tarefa na interface.
   * @function
   * @param {any} object - Objeto contendo o item a ser adicionado.
   */
  function reloadPageAddItem(object: any) {
    taskDetails.data?.task_item.push(object.itemUp);
    setTaskDetails({ ...taskDetails });
    reloadPagePercent(object, object.itemUp);
  }

  /**
   * Atualiza uma observação de um item na interface.
   * @function
   * @param {any} object - Objeto contendo a observação.
   */
  function reloadPageUpNoteItem(object: any) {
    const index: number = taskDetails.data?.task_item.findIndex((item) => item.id === object.id) || 0;
    if (taskDetails.data) taskDetails.data.task_item[index].note = object.note;
    setTaskDetails({ ...taskDetails });
  }

  /**
   * Atualiza um item da tarefa na interface.
   * @function
   * @param {any} value - Dados do item atualizado.
   */
  function itemUp(value: any) {
    taskDetails.data?.task_item.forEach((element, index) => {
      if (taskDetails.data && element.id == value.itemUp.id)
        taskDetails.data.task_item[index] = value.itemUp;
    });
    setTaskDetails({ ...taskDetails });
    reloadPagePercent(value, value.itemUp);
  }

  /**
   * Atualiza a vinculação de um usuário a um item da tarefa na interface.
   * @function
   * @param {any} value - Dados do item e usuário.
   */
  function userTaskItem(value: any) {
    taskDetails.data?.task_item.forEach((element, index) => {
      if (taskDetails.data && element.id == value.itemUp.id)
        taskDetails.data.task_item[index] = value.itemUp;
    });
    setTaskDetails({ ...taskDetails });
  }

  /**
   * Limpa os estados do contexto WebSocket.
   * @function
   */
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
        setIsAdm,
        getUser,
        setGetUser,
        updatedAddUserTaskItem,
      }}
    >
      {children}
    </GtppWsContext.Provider>
  );
};

/**
 * Hook personalizado para acessar o contexto do WebSocket.
 * @function
 * @returns {iGtppWsContextType} Contexto do WebSocket.
 * @throws {Error} Se usado fora de um GtppWsProvider.
 */
export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};