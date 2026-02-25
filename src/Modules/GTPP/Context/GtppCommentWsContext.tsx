import React, { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo } from "react";
import GtppWebSocket from "./GtppWebSocket"; 
import { useMyContext } from "../../../Context/MainContext";
import { useConnection } from "../../../Context/ConnContext";
import { handleNotification } from "../../../Util/Util";
import soundFile from "../../../Assets/Sounds/notify.mp3";

export interface iGtppCommentWsContext {
  comment: { isComment: boolean; data: any[] };
  setComment: React.Dispatch<React.SetStateAction<{ isComment: boolean; data: any[] }>>;
  getComment: (taskItemId: any, count?: boolean) => Promise<void>;
  getCountComment: (taskItemId: any) => Promise<any>;
  sendComment: (text: string, file: File | null, taskItemId: number, taskId: number) => Promise<any>;
  deleteComment: (idToDelete: number, taskItemId: number, taskId: number) => Promise<any>;
  editComment: (idToEdit: number, newComment: string, taskItemId: number, taskId: number) => Promise<any>;
  notifyMentionWs: (mentionedUsers: any[], taskId: number, taskItemDesc: string) => void;
  activeTaskItemId: number | null;
  setActiveTaskItemId: (id: number | null) => void;
}

const GtppCommentWsContext = createContext<iGtppCommentWsContext | undefined>(undefined);

export const GtppCommentWsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comment, setComment] = useState<{ isComment: boolean; data: any[] }>({ isComment: false, data: [] });
  const [onSounds, setOnSounds] = useState<boolean>(false);
  const [activeTaskItemId, setActiveTaskItemId] = useState<number | null>(null);

  const activeTaskItemIdRef = useRef<number | null>(null);

  const { userLog } = useMyContext();
  const { fetchData, DataFetchForm } = useConnection();
  
  const ws = useRef(GtppWebSocket.getInstance());

  useEffect(() => {
    activeTaskItemIdRef.current = activeTaskItemId;
  }, [activeTaskItemId]);

  useEffect(() => {
    ws.current.connect();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") setOnSounds(true);
    else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") setOnSounds(true);
    }
  };

  // 1º: CRIAMOS O GETCOMMENT PRIMEIRO
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

  // 2º: AGORA O CALLBACK PODE USAR O GETCOMMENT SEM DAR ERRO
  const callbackOnMessage = useCallback(async (event: any) => {
    const response = JSON.parse(event.data);
    const myId = userLog?.id || localStorage.getItem('codUserGIPP');
    
    if (response.send_user_id && String(response.send_user_id) === String(myId)) return;

    if (response.type === 9) {
      if (onSounds) new Audio(soundFile).play().catch(e => console.error(e));
      handleNotification("Comentário removido!", response.object?.description, "info");

      if (activeTaskItemIdRef.current && response.object?.task_item_id === activeTaskItemIdRef.current) {
        await getComment(activeTaskItemIdRef.current);
      }
    }

    if (response.type === 8) {
      if (onSounds) new Audio(soundFile).play().catch(e => console.error(e));
      handleNotification("Mencionou você!", response.object?.description, "info");
    }

    if (response.type === 7) {
      if (onSounds) new Audio(soundFile).play().catch(e => console.error(e));
      
      if (activeTaskItemIdRef.current && response.object?.task_item_id === activeTaskItemIdRef.current) {
        await getComment(activeTaskItemIdRef.current);
      }
    }
  }, [userLog?.id, onSounds, getComment]);

  useEffect(() => {
    ws.current.setCallback("CHAT_COMMENT", callbackOnMessage);
  }, [callbackOnMessage]);

  const sendComment = useCallback(async (text: string, file: File | null, taskItemId: number, taskId: number) => {
    try {
        const dataToSend = new FormData();
        dataToSend.append('task_item_id', taskItemId.toString());
        dataToSend.append('comment', text);
        if (file) dataToSend.append('file', file);

        const response = await DataFetchForm({ method: "POST", params: dataToSend, pathFile: 'GTPP/TaskItemResponse.php' });

        if (response && !response.error) {
            await getComment(taskItemId);
            
            // ws.current.informSending({
            //     error: false,
            //     user_id: userLog.id,
            //     task_id: taskId,
            //     type: 7,
            //     object: { task_item_id: taskItemId } 
            // });
            
            return response;
        }
    } catch (error) { console.error("Erro ao enviar comentário:", error); }
  }, [DataFetchForm, getComment, userLog.id]);

  const deleteComment = async (idToDelete: number, taskItemId: number, taskId: number) => {
    const response = await fetchData({ method: "PUT", params: { id: idToDelete, status: "0" }, pathFile: 'GTPP/TaskItemResponse.php' });
    if (response && !response.error) {
        await getComment(taskItemId);
        // ws.current.informSending({ error: false, user_id: userLog.id, task_id: taskId, type: 9, 
        //   object: { 
        //     task_item_id: taskItemId, 
        //     description:  `Comentário foi removido na tarefa: (${taskId})`
        //   }});
        return response;
    }
    if (!response.error) { handleNotification("Sucesso", "Comentário removido", "success"); await getComment(taskItemId); }
    return response;
  };

  const editComment = async (idToEdit: number, newComment: string, taskItemId: number, taskId: number) => {
    const response = await fetchData({ method: "PUT", params: { id: idToEdit, comment: newComment }, pathFile: 'GTPP/TaskItemResponse.php' });
    if (response && !response.error) {
        await getComment(taskItemId);
        // ws.current.informSending({ error: false, user_id: userLog.id, task_id: taskId, type: 7, object: { task_item_id: taskItemId } });
        handleNotification("Sucesso", "Comentário editado com sucesso!", "success");
        return response;
    } else {
        handleNotification("Erro", response?.message || "Erro ao editar comentário", "danger");
    }
    return response;
  };

  const notifyMentionWs = useCallback((mentionedUsers: any[], taskId: number, taskItemDesc: string) => {
    /* mentionedUsers.forEach(user => {
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
    });*/ 
  }, [userLog.id]);

  const contextValue = useMemo(() => ({
    comment, setComment, getComment, getCountComment, sendComment, deleteComment, editComment, notifyMentionWs, activeTaskItemId, setActiveTaskItemId
  }), [
    comment, getComment, sendComment, notifyMentionWs, activeTaskItemId
  ]);

  return (
    <GtppCommentWsContext.Provider value={contextValue}>
      {children}
    </GtppCommentWsContext.Provider>
  );
};

export const useCommentWebSocket = () => {
  const context = useContext(GtppCommentWsContext);
  if (!context) throw new Error("useCommentWebSocket deve ser usado dentro de um GtppCommentWsProvider");
  return context;
};