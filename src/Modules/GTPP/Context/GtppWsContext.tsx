import React, { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo } from "react";
import { CustomNotification, iGtppWsContextType, iStates, iTaskReq, iUserDefaultClass } from "../../../Interface/iGIPP";
import GtppWebSocket from "./GtppWebSocket";
import { useMyContext } from "../../../Context/MainContext";
import InformSending from "../Class/InformSending";
import { classToJSON, handleNotification } from "../../../Util/Util";
import NotificationGTPP from "../Class/NotificationGTPP";
import soundFile from "../../../Assets/Sounds/notify.mp3";
import { useConnection } from "../../../Context/ConnContext";
import { useNavigate } from "react-router-dom";
import { ApiResponse, ITheme } from "../CreateTheme/ICreateTheme";

const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taskPercent, setTaskPercent] = useState<number>(0);
  const [task, setTask] = useState<any>({});
  const [taskDetails, setTaskDetails] = useState<iTaskReq>({});
  const [onSounds, setOnSounds] = useState<boolean>(false);
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);
  const [comment, setComment] = useState<{ isComment: boolean; data: any[] }>({ isComment: false, data: [] });
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [getTask, setGetTask] = useState<{ id?: number; theme_id_fk?: number; description_theme?: string; percent?: number; }[]>([]);
  const [states, setStates] = useState<iStates[]>([{ color: '', description: '', id: 0 }]);
  const [themeList, setThemeList] = useState<ITheme[]>([]);
  const [isAdm, setIsAdm] = useState<any>(false);
  const [getUser, setGetUser] = useState<iUserDefaultClass | null>(null);
  const [userTaskBind, setUserTaskBind] = useState<any[]>([]);

  const { setLoading, userLog } = useMyContext();
  const navigate = useNavigate();
  const { fetchData, DataFetchForm } = useConnection();
  const ws = useRef(new GtppWebSocket());

  useEffect(() => {
    ws.current.connect();
    (async () => {
      setLoading(true);
      try {
        const getNotify: any = await fetchData({ method: "GET", params: null, pathFile: 'GTPP/Notify.php', urlComplement: `&id_user=${userLog.id}`, exception: ["No data"] });
        if (getNotify.error) throw new Error(getNotify.message);
        updateNotification(getNotify.data);
      } catch (error: any) {
        console.error(`Erro ao carregar notificações: ${error.message}`);
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

  useEffect(() => {
    getThemeListformations();
  }, []);

  // Adicionado userLog?.id nas dependências para evitar stale closure do myId
  useEffect(() => {
    ws.current.callbackOnMessage = callbackOnMessage;
  }, [task, taskDetails, notifications, onSounds, openCardDefault, userLog?.id]);

  // CORREÇÃO: Dependendo apenas do ID para evitar loops infinitos
  useEffect(() => {
    (async () => {
      if (task?.id) await getTaskInformations();
    })();
  }, [task?.id]);

  useEffect(() => {
    if (!userLog?.id) return;
    loadTasks();
  }, [isAdm, userLog?.id]);

  const loadTasks = async (silent = false) => {
    try { await reqTasks(silent); } catch (error) { console.error(`Erro ao carregar tarefas: ${error}`); }
  };

  async function reqTasks(silent = false) {
    try {
      if (!silent) setLoading(true); // Só ativa o loading se NÃO for silent
      const getTaskRes: any = await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", urlComplement: `${isAdm ? "&administrator=1" : ""}` });
      if (getTaskRes.error) throw new Error(getTaskRes.message);
      setGetTask(getTaskRes.data);
    } catch (error) { 
      console.error(`Erro ao requisitar tarefas: ${error}`); 
    } finally { 
      if (!silent) setLoading(false); 
    }
  }

  async function getStateformations() {
    setLoading(true);
    let listState: iStates[] = [{ id: 0, description: '', color: '' }];
    try {
      if (localStorage.gtppStates) {
        listState = JSON.parse(localStorage.gtppStates);
      } else {
        const getStatusTask: any = await fetchData({ method: "GET", pathFile: "GTPP/TaskState.php", params: null, exception: ["no data"], urlComplement: "" });
        if (getStatusTask.error) throw new Error(getStatusTask.message || 'Erro ao obter estados');
        const list = createStorageState(getStatusTask.data || [{ id: 0, description: '', color: '' }]);
        listState = list;
      }
    } catch (error) { console.error(`Erro ao obter estados das tarefas: ${error}`); } finally { updateStates(listState); setLoading(false); }
  }

  async function getThemeListformations() {
    setLoading(true);
    try {
      const response: ApiResponse<ITheme[]> = await fetchData({method: "GET",pathFile: "GTPP/Theme.php", params: null, urlComplement: "&user_theme=1", exception: ["No data"]});
      if (response.error) throw new Error(response.message || "Erro ao carregar temas");
      const themes = Array.isArray(response.data) ? response.data : [];
      updateThemeList(themes);
    } catch (error: any) { console.error("Erro ao carregar temas:", error.message); } finally { setLoading(false); }
  }

  const getComment = useCallback(async (taskItemId: any, count?: boolean) => {
    if (!taskItemId) return;
    try {
      const response = await fetchData({ method: "GET", params: null, pathFile: 'GTPP/TaskItemResponse.php', urlComplement: count ? `&count=${count}` : `&task_item_id=${taskItemId}`, exception: ["No data"] });
      if (response && !response.error) {
        setComment(prev => ({ ...prev, data: Array.isArray(response.data) ? response.data : [] }));
      } else {
        setComment(prev => ({ ...prev, data: [] }));
      }
    } catch (error) { console.error("Erro ao buscar comentários:", error); }
  }, [fetchData]);

  const getCountComment = async (taskItemId: any) => {
    return await fetchData({ method: "GET", params: null, pathFile: 'GTPP/TaskItemResponse.php', urlComplement: `&task_item_id=${taskItemId}&count=true` });
  }

  const closeCardDefaultGlobally = (taskId?: number) => {
    ws.current.informSending({ error: false, user_id: userLog.id, object: { description: "O card padrão foi fechado por outro usuário.", task_id: taskId }, task_id: taskId, type: 7 });
  };

  function updateStates(newList: any[]) {
    localStorage.gtppStates = JSON.stringify(newList);
    setStates([...newList]);
  }

  function updateThemeList(newList: ITheme[]) {
    localStorage.gtppThemeList = JSON.stringify(newList);
    setThemeList(newList);
  }

  function createStorageState(list: iStates[]) {
    let listState: [{ id: number, description: string, color: string }] = [{ id: 0, description: '', color: '' }];
    list.forEach((element: { id: number, description: string, color: string }, index) => {
      const item = { id: element.id, description: element.description, color: element.color, active: true };
      index == 0 ? listState[index] = item : listState.push(item);
    });
    return listState;
  }

  async function getTaskInformations(silent = false): Promise<void> {
    try {
      if (!silent) setLoading(true);
      const getTaskItem: any = await fetchData({ method: "GET", params: null, pathFile: "GTPP/Task.php", exception: ["no data"], urlComplement: `&id=${task.id}` });
      if (getTaskItem.error) throw new Error(getTaskItem.message);
      setTaskDetails(getTaskItem);
    } catch (error) { 
      console.error(`Erro ao obter detalhes: ${error}`); 
    } finally { 
      if (!silent) setLoading(false); 
    }
  }

  function addUserTask(element: any, type: number) {
    const info: any = { error: false, user_id: element.user_id, send_user_id: userLog.id, object: { description: type === 5 ? `${element.name} foi vinculado a tarefa` : `${element.name} foi removido da tarefa` }, task_id: element.task_id, type: type };
    if (type === 5) { info.object.changeUser = element.user_id; info.object.task_id = element.task_id; }
    ws.current.informSending(info);
  }

  async function callbackOnMessage(event: any) {
    const response = JSON.parse(event.data);
    const myId = userLog?.id || localStorage.codUserGIPP;
    
    if (response.send_user_id && String(response.send_user_id) === String(myId)) {
      return;
    }

    updateNotification([response]);
    const isTargetingCurrentTask = task && task.id === response.task_id;

    // Comentario removido
    if (response.type === 9) {
      if (onSounds) { new Audio(soundFile).play().catch(e => console.error(e)); }
      handleNotification("Comentario removido!", response.object?.description, "info");

      if (isTargetingCurrentTask && response.object && response.object.task_item_id) {
        await updateCommentCount(response.object.task_item_id);
        await getComment(response.object.task_item_id);
      }
    }

    if (response.type === 8) {
      if (onSounds) { new Audio(soundFile).play().catch(e => console.error(e)); }
      handleNotification("Mencionou você!", response.object?.description, "info");
      
      // RELOAD SILENCIOSO
      await loadTasks(true); 
      if (isTargetingCurrentTask) await getTaskInformations(true); 
      return;
    }

    // Comentario adicionado
    if (response.type === 7) {
      if (isTargetingCurrentTask && response.object && response.object.task_item_id) {
        await updateCommentCount(response.object.task_item_id);
        await getComment(response.object.task_item_id);
      }
    }

    if (response.type == 6) {
      if (isTargetingCurrentTask) {
        setTask((prev: any ) => ({ ...prev, state_id: response.object?.state_id, percent: response.object?.percent }));
      }
      await loadTasks(true); 
      if (isTargetingCurrentTask) {
        await getTaskInformations(true);
      }
    } 
    else if (response.type == 2) {
      if (isTargetingCurrentTask && response.object) {
        if (response.object.isItemUp) itemUp(response.object);
        else if (response.object.remove) reloadPageDeleteItem(response);
        else if (response.object.isUserTask) userTaskItem(response.object);
        else reloadPageItem(response.object);
      }
    } 
    else if (response.type == -3 || response.type == 5) {
      if (isTargetingCurrentTask && response.type == -3) { setOpenCardDefault(false); clearGtppWsContext(); }
      await loadTasks();
    }
    else if (response.type == 3) {
      if (isTargetingCurrentTask && response.object) getDescription(response.object);
    }
  }

 const updateCommentCount = async (taskItemId: number) => {
    if (!taskItemId) return;
    const res: any = await fetchData({ method: "GET", params: null, pathFile: 'GTPP/TaskItemResponse.php', urlComplement: `&task_item_id=${taskItemId}&count=true`, exception: ["No data"] });
    
    if (res && !res.error) {
      const novoTotal = Number(res.data[0]?.total_comment) || 0;

      setTaskDetails((prev: any) => {
        if (!prev.data || !prev.data.task_item) return prev;

        return {
          ...prev,
          data: {
            ...prev.data,
            task_item: prev.data.task_item.map((item: any) => {
              if (item.id === taskItemId) {
                // SÓ marcamos como novo se o número aumentou e o chat NÃO está aberto
                const antigoTotal = Number(item.total_comment) || 0;
                const temNovidade = novoTotal > antigoTotal;

                return { 
                  ...item, 
                  total_comment: novoTotal, 
                  hasNewComment: temNovidade // <-- AQUI A CHAVE DA MÁGICA
                };
              }
              return item;
            })
          }
        };
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") setOnSounds(true);
    else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") setOnSounds(true);
    }
  };

  const sendComment = useCallback(async (text: string, file: File | null, taskItemId: number, taskId: number) => {
    try {
        const dataToSend = new FormData();
        dataToSend.append('task_item_id', taskItemId.toString());
        dataToSend.append('comment', text);
        if (file) dataToSend.append('file', file);

        const response = await DataFetchForm({ method: "POST", params: dataToSend, pathFile: 'GTPP/TaskItemResponse.php' });

        if (response && !response.error) {
            await getComment(taskItemId);
            ws.current.informSending({
                error: false,
                user_id: userLog.id,
                task_id: taskId,
                type: 7,
                object: { task_item_id: taskItemId } 
            });
            
            await updateCommentCount(taskItemId);
            return response;
        }
    } catch (error) { console.error("Erro ao enviar comentário:", error); }
  }, [DataFetchForm, getComment, userLog.id]);

  const deleteComment = async (idToDelete: number, taskItemId: number, taskId: number) => {
    const response = await fetchData({ method: "PUT", params: { id: idToDelete, status: "0" }, pathFile: 'GTPP/TaskItemResponse.php' });
    if (response && !response.error) {
        await getComment(taskItemId);
        ws.current.informSending({ error: false, user_id: userLog.id, task_id: taskId, type: 9, 
          object: { 
            task_item_id: taskItemId, 
            description:  `Comentario foi removido na tarefa: (${taskId})`
          }});
        await updateCommentCount(taskItemId);
        return response;
    }
    if (!response.error) { handleNotification("Sucesso", "Comentário removido", "success"); await getComment(taskItemId); }
    return response;
  };

  // EDITAR COMENTÁRIO
  const editComment = async (idToEdit: number, newComment: string, taskItemId: number, taskId: number) => {
    const response = await fetchData({ 
        method: "PUT", 
        params: { id: idToEdit, comment: newComment }, 
        pathFile: 'GTPP/TaskItemResponse.php' 
    });

    if (response && !response.error) {
        await getComment(taskItemId);
        
        ws.current.informSending({ 
            error: false, 
            user_id: userLog.id, 
            task_id: taskId, 
            type: 7, 
            object: { task_item_id: taskItemId } 
        });
        
        handleNotification("Sucesso", "Comentário editado com sucesso!", "success");
        return response;
    } else {
        handleNotification("Erro", response?.message || "Erro ao editar comentário", "danger");
    }
    return response;
  };

  const notifyMentionWs = useCallback((mentionedUsers: any[], taskId: number, taskItemDesc: string) => {
    mentionedUsers.forEach(user => {
        ws.current.informSending({
            error: false,
            user_id: user.user_id,
            send_user_id: userLog.id,
            task_id: taskId,
            type: 8,
            object: { 
                description: `mencionou você na tarefa: (${taskId})\n no Item: "${taskItemDesc}"`, 
                isMention: true, 
                task_id: taskId 
            }
        });
    });
  }, [userLog.id]);

  useEffect(() => { requestNotificationPermission(); }, []);

  async function updateNotification(item: any[]) {
    try {
      setLoading(true);
      if (onSounds) { new Audio(soundFile).play().catch(e => console.error(e)); }
      const notify = new NotificationGTPP();
      await notify.loadNotify(item, states);
      // CORREÇÃO: Usando a forma imutável para não duplicar chamadas no estado
      setNotifications(prev => [...prev, ...notify.list]);
      handleNotification(notify.list[0]["title"], notify.list[0]["message"], notify.list[0]["typeNotify"]);
    } catch (error) { console.error(`Erro ao atualizar notificações: ${error}`); } finally { setLoading(false); }
  }

  function getDescription(description: any) {
    // CORREÇÃO: Atualização imutável
    setTaskDetails(prev => {
      if (!prev.data) return prev;
      return { ...prev, data: { ...prev.data, full_description: description.full_description } };
    });
  }

  async function checkedItem(id: number, checked: boolean, idTask: any, taskLocal: any, yes_no?: number) {
    try {
      const item = yes_no ? { id: parseInt(id.toString()), task_id: idTask.toString(), yes_no: parseInt(yes_no.toString()) } : { check: checked, id: id, task_id: idTask };
      let result: { error: boolean, data?: any, message?: string } = await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" }) || { error: false };
      if (result.error) throw new Error(result.message);
      if (!yes_no) taskLocal.check = checked;
      if (yes_no) reloadPageChangeQuestion(yes_no, id);
      reloadPagePercent(result.data, { task_id: idTask });
      await verifyChangeState(result.data.state_id, task.state_id, taskLocal, result.data);
      infSenCheckItem(taskLocal, result.data);
    } catch (error) {
      console.error(`Erro ao marcar/desmarcar item ${id}: ${error}`);
    }
  }

  async function verifyChangeState(newState: number, oldState: number, taskLocal: any, result: any) {
    if (newState != oldState) { await loadTasks(); infSenStates(taskLocal, result); }
  }

  function infSenStates(taskLocal: any, result: any) {
    setTask((prev: any) => ({ ...prev, state_id: result.state_id }));
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 6, { description: "Mudou para", task_id: taskLocal.task_id, percent: result.percent, state_id: result.state_id, task: task })));
  }

  function infSenCheckItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, { description: taskLocal.check ? "marcado" : "desmarcado", percent: result.percent, itemUp: taskLocal, isItemUp: true })));
  }

  function infSenUserTaskItem(taskLocal: any, result: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, { description: "usuário vinculado", percent: result.percent, itemUp: taskLocal, isItemUp: true })));
  }

  async function checkTaskComShoDepSub(task_id: number, company_id: number, shop_id: number, depart_id: number, taskLocal: any) {
    setLoading(true);
    try {
      await fetchData({ method: "POST", urlComplement: "", pathFile: "GTPP/TaskComShoDepSub.php", exception: ["no data"], params: { task_id, company_id, shop_id, depart_id } });
      ws.current.informSending({ error: false, user_id: userLog.id, object: { description: "Atualizada", task_id, company_id, shop_id, depart_id }, task_id: taskLocal, type: 2 });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  const handleAddTask = useCallback(async (description: string, task_id: string, yes_no: number, file?: string) => {
      setLoading(true);
      try {
        const response: any = await fetchData({ method: "POST", params: { description, file: file || '', task_id, yes_no }, pathFile: "GTPP/TaskItem.php" });
        if (response.error) throw new Error(response.message);
        const item = { id: response.data.last_id, description, check: false, task_id: parseInt(task_id), order: response.data.order, created_by: response.data.created_by, yes_no: response.data.yes_no, file: file ? 1 : 0, note: null };
        
        // CORREÇÃO: Inserção imutável
        setTaskDetails((prev: any) => {
          if (!prev.data) return prev;
          const newTaskItems = Array.isArray(prev.data.task_item) ? [...prev.data.task_item, item] : [item];
          return { ...prev, data: { ...prev.data, task_item: newTaskItems } };
        });

        ws.current.informSending({ user_id: userLog, object: { description: "Novo item", percent: response.data.percent, itemUp: item }, task_id, type: 2 });
        reloadPagePercent(response.data, { task_id });
        if (task.state_id != response.data.state_id) await verifyChangeState(response.data.state_id, task.state_id, { task_id: task.id }, response.data);
      } catch (error: any) { console.error(error.message); } finally { setLoading(false); }
  }, [fetchData, userLog, task.id, task.state_id]);

  async function changeDescription(description: string, id: number, descLocal: string) {
    setLoading(true);
    try {
      await fetchData({ method: "PUT", pathFile: "GTPP/Task.php", exception: ["no data"], params: { id, full_description: description } });
      ws.current.informSending({ error: false, user_id: userLog.id, object: { description: "Atualizada", task_id: id, full_description: description }, task_id: descLocal, type: 3 });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  async function updateItemTaskFile(file: string, item_id?: number) {
    try { if (item_id) await fetchData({ method: "PUT", pathFile: "GTPP/TaskItem.php", exception: ["no data"], params: { task_id: task.id, id: item_id, file } }); } catch (error) { console.error(error); }
  }

  async function changeObservedForm(taskId: number, subId: number, value: string, isObservation: boolean) {
    setLoading(true);
    try {
      const item: any = { id: subId, task_id: taskId }; item[isObservation ? 'note' : 'description'] = value;
      await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      await getTaskInformations();
      ws.current.informSending({ error: false, user_id: userLog.id, object: item, task_id: taskId, type: 2 });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  async function upTask(taskId: number, resource: string | null, date: string | null, taskList: any, message: string, type: number, object?: {}) {
    setLoading(true);
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskId, type, object || { description: message, task_id: taskId, reason: resource, days: date, taskState: taskList?.state_id })));
    await loadTasks(); setLoading(false);
  }

  async function updateStateTask(taskId: number, resource: string | null, date: string | null) {
    setLoading(true);
    const req: any = await fetchData({ method: "PUT", params: { task_id: taskId, reason: resource, days: parseInt(date ? date : "0") }, pathFile: "GTPP/TaskState.php" }) || { error: false };
    setLoading(false); return req.error ? {} : req.data instanceof Array ? req.data[0].id : req.data.id;
  }

  function addDays(daysToAdd: number) { const d = new Date(); d.setDate(d.getDate() + daysToAdd); return d.toISOString().split('T')[0]; }

  async function stopAndToBackTask(taskId: number, resource: string | null, date: string | null, taskList: any) {
    try {
      const taskState: any = await updateStateTask(taskId, resource, date);
      if (!taskState || taskState.error) throw new Error(taskState?.message);
      if (!taskState.error) {
        if (taskList.state_id == 5) upTask(taskId, resource, date, taskList, `Voltou!`, 6, { description: "send", task_id: taskId, state_id: taskState, percent: task.percent || taskList.percent, new_final_date: addDays(parseInt(date || "0")) });
        else if (taskList.state_id == 4 || taskList.state_id == 6) upTask(taskId, resource, date, taskList, "send", 6, { description: "send", task_id: taskId, state_id: taskState });
        else if (taskList.state_id == 1 || taskList.state_id == 2) upTask(taskId, resource, date, taskList, "Parada!", 6, { description: "send", task_id: taskId, state_id: taskState });
        else if (taskList.state_id == 3) upTask(taskId, resource, date, taskList, "Finalizada!", 6, { description: "send", task_id: taskId, state_id: taskState, percent: task.percent || taskList.percent });
      }
      if (task.id && !isNaN(taskState)) setTask((prev: any) => ({ ...prev, state_id: taskState, percent: task.percent || prev.percent }));
      closeCardDefaultGlobally(taskId);
    } catch (error: any) { console.error(error); handleNotification("Atenção!", error.message, "danger"); }
  }

  async function updatedForQuestion(item: { task_id: number; id: number; yes_no: number }) {
    try {
      setLoading(true);
      await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      
      let clonedItemUp: any = null;
      setTaskDetails((prev: any) => {
        if (!prev.data || !prev.data.task_item) return prev;
        const updatedList = prev.data.task_item.map((element: any) => {
          if (element.id == item.id) {
            clonedItemUp = { ...element, yes_no: item.yes_no };
            return clonedItemUp;
          }
          return element;
        });
        return { ...prev, data: { ...prev.data, task_item: updatedList } };
      });

      if (clonedItemUp) {
         await upTask(item.task_id, null, null, null, "item comum", 2, { description: "Alterado", percent: task.percent, itemUp: clonedItemUp, isItemUp: true });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  async function updatedAddUserTaskItem(item: { task_id: number, user_id: number, id: number }, setUserState: (item: any) => void) {
    const value = { task_id: item.task_id, id: item.id, assigned_to: item.user_id };
    const { error, message } = await fetchData({ method: "PUT", params: value, pathFile: "GTPP/TaskItem.php", urlComplement: "" });
    if (!error) {
      setUserState((prev: any) => ({ ...prev, isListUser: false, loadingList: [] }));
      await getTaskInformations(); 
      handleNotification('Sucesso', 'Vínculo ok!', 'success');
      
      // Enviando pro socket apos garantir que o DB salvou
      ws.current.informSending(classToJSON(new InformSending(false, userLog.id, item.task_id, 2, { description: "Usuário vinculado", isUserTask: true })));
    } else console.error(message);
  }

  function deleteItemTaskWS(object: any) { ws.current.informSending({ user_id: userLog.id, object, task_id: task.id, type: 2 }); }

  function reloadPagePercent(value: any, taskLocal: any) {
    if (task.id == taskLocal.task_id) {
      setTaskPercent(parseInt(value.percent));
      setGetTask(prev => prev.map(item => item.id == taskLocal.task_id ? { ...item, percent: parseInt(value.percent) } : item));
    }
  }

  function reloadPageChangeQuestion(yes_no: number, item_id: number) {
    // CORREÇÃO: Atualização imutável
    setTaskDetails((prev: any) => {
      if (!prev.data || !prev.data.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((item: any) => item.id == item_id ? { ...item, yes_no } : item)
        }
      };
    });
  }

  function reloadPageDeleteItem(value: any) {
    // CORREÇÃO: Usando filter para remover de forma imutável
    setTaskDetails((prev: any) => {
      if (!prev.data || !prev.data.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.filter((item: any) => item.id != value.object.itemUp)
        }
      };
    });
    reloadPagePercent(value.object, value);
  }

  function reloadPageItem(object: any) { if (object.itemUp) reloadPageAddItem(object); else reloadPageUpNoteItem(object); }

  function reloadPageAddItem(object: any) {
    // CORREÇÃO: Usando spread operator para não mutar
    setTaskDetails((prev: any) => {
      if (!prev.data) return prev;
      const newList = Array.isArray(prev.data.task_item) ? [...prev.data.task_item, object.itemUp] : [object.itemUp];
      return { ...prev, data: { ...prev.data, task_item: newList } };
    });
    reloadPagePercent(object, object.itemUp);
  }

  function reloadPageUpNoteItem(object: any) {
    // CORREÇÃO: Imutabilidade com map
    setTaskDetails((prev: any) => {
      if (!prev.data || !prev.data.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((item: any) => item.id === object.id ? { ...item, note: object.note } : item)
        }
      };
    });
  }

  function itemUp(value: any) {
    setTaskDetails((prev: any) => {
      if (!prev.data || !prev.data.task_item) return prev;
      return {
        ...prev, 
        data: { 
          ...prev.data, 
          task_item: prev.data.task_item.map((item: any) => item.id === value.itemUp.id ? value.itemUp : item) 
        } 
      };
    });
    reloadPagePercent(value, value.itemUp);
  }

  function userTaskItem(value: any) {
    setTaskDetails((prev: any) => {
      if (!prev.data || !prev.data.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((element: any) => element.id == value.itemUp.id ? value.itemUp : element)
        }
      };
    });
  }

  function clearGtppWsContext() { setTask({}); setTaskDetails({}); }

  // CORREÇÃO FINAL: Memoizando o Provider para evitar que a tela inteira pisque a cada renderização do Contexto
  const contextValue = useMemo(() => ({
    taskDetails, task, taskPercent, userTaskBind, notifications, states, onSounds, getTask, isAdm, openCardDefault, themeList, comment,
    setThemeList, updateItemTaskFile, updatedForQuestion, reloadPagePercent, deleteItemTaskWS, addUserTask, getTaskInformations,
    setOpenCardDefault, loadTasks, reqTasks, setGetTask, updateStates, setOnSounds, setNotifications, setTaskPercent, setTask, handleAddTask,
    setTaskDetails, clearGtppWsContext, checkedItem, checkTaskComShoDepSub, changeDescription, stopAndToBackTask, changeObservedForm,
    setIsAdm, getCountComment, updateCommentCount, getUser, setGetUser, getComment, updatedAddUserTaskItem, getThemeListformations,
    setComment, deleteComment, sendComment, 
    editComment, notifyMentionWs
  }), [
    taskDetails, task, taskPercent, userTaskBind, notifications, states, onSounds, getTask, isAdm, openCardDefault, themeList, comment,
    getComment, sendComment, handleAddTask 
  ]);

  return (
    <GtppWsContext.Provider value={contextValue}>
      {children}
    </GtppWsContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) throw new Error("useWebSocket deve ser usado dentro de um GtppWsProvider");
  return context;
};