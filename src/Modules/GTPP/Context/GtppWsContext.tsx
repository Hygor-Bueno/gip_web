import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { iGtppWsContextType, iUserDefaultClass } from "../../../Interface/iGIPP";
import { IWsMessage } from "./types/gtppTypes";
import GtppWebSocket from "./GtppWebSocket";
import { useMyContext } from "../../../Context/MainContext";

import { useGtppStates } from "./hooks/useGtppStates";
import { useGtppNotifications } from "./hooks/useGtppNotifications";
import { useGtppTasks } from "./hooks/useGtppTasks";
import { useGtppComments } from "./hooks/useGtppComments";
import { useGtppTaskItems } from "./hooks/useGtppTaskItems";

const GtppWsContext = createContext<iGtppWsContextType | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openCardDefault, setOpenCardDefault] = useState<boolean>(false);
  const [getUser, setGetUser] = useState<iUserDefaultClass | null>(null);
  const [userTaskBind] = useState<iGtppWsContextType["userTaskBind"]>([]);

  const { userLog } = useMyContext();
  const ws = useRef(GtppWebSocket.getInstance());

  const {
    states, setStates, themeList, setThemeList,
    updateStates, getStateformations, getThemeListformations,
  } = useGtppStates();

  const {
    notifications, setNotifications, onSounds, setOnSounds,
    updateNotification, requestNotificationPermission, loadInitialNotifications,
  } = useGtppNotifications(states);

  const {
    task, setTask, taskDetails, setTaskDetails, taskPercent, setTaskPercent,
    getTask, setGetTask, isAdm, setIsAdm,
    loadTasks, reqTasks, getTaskInformations, updateCommentCount,
    reloadPagePercent, reloadPageChangeQuestion, reloadPageDeleteItem,
    reloadPageItem, itemUp, userTaskItem, getDescription, clearGtppWsContext,
  } = useGtppTasks();

  const {
    comment, setComment,
    getComment, getCountComment,
    sendComment, deleteComment, editComment, notifyMentionWs,
  } = useGtppComments(updateCommentCount, ws);

  const {
    checkedItem, checkTaskComShoDepSub, handleAddTask,
    changeDescription, updateItemTaskFile, changeObservedForm,
    upTask, stopAndToBackTask,
    updatedForQuestion, updatedAddUserTaskItem,
    deleteItemTaskWS, addUserTask,
  } = useGtppTaskItems(
    task, setTask, setTaskDetails, loadTasks, getTaskInformations,
    reloadPagePercent, reloadPageChangeQuestion, ws
  );

  // --- Lifecycle ---
  useEffect(() => {
    ws.current.connect();
    loadInitialNotifications();
    getStateformations();
    return () => {
      if (ws.current?.isConnected) {
        localStorage.removeItem("gtppStates");
        ws.current.disconnect();
      }
    };
  }, []);

  useEffect(() => { getThemeListformations(); }, []);

  useEffect(() => { requestNotificationPermission(); }, []);

  useEffect(() => {
    ws.current.setCallback("MAIN_TASK", callbackOnMessage);
  }, [task, taskDetails, notifications, onSounds, openCardDefault, userLog?.id]);

  useEffect(() => {
    if (task?.id) { void getTaskInformations(); }
  }, [task?.id]);

  useEffect(() => {
    if (!userLog?.id) return;
    void loadTasks();
  }, [isAdm, userLog?.id]);

  // --- WebSocket orchestrator ---
  async function callbackOnMessage(event: MessageEvent<string>): Promise<void> {
    const response = JSON.parse(event.data) as IWsMessage;
    const myId = userLog?.id ?? localStorage.getItem("codUserGIPP");

    if (response.send_user_id && String(response.send_user_id) === String(myId)) return;

    await updateNotification([response]);

    const isTargetingCurrentTask = task?.id != null && task.id === response.task_id;

    if (response.type === 9) {
      if (isTargetingCurrentTask && response.object?.task_item_id) {
        updateCommentCount(response.object.task_item_id, "remove");
        await getComment(response.object.task_item_id);
      }
      return;
    }

    if (response.type === 8) {
      await loadTasks(true);
      if (isTargetingCurrentTask) await getTaskInformations(true);
      return;
    }

    if (response.type === 7) {
      if (isTargetingCurrentTask && response.object?.task_item_id) {
        updateCommentCount(response.object.task_item_id, "add");
        await getComment(response.object.task_item_id);
      }
      return;
    }

    if (response.type === 6) {
      if (isTargetingCurrentTask) {
        setTask((prev) => ({
          ...prev,
          state_id: response.object?.state_id ?? prev.state_id,
          percent: Number(response.object?.percent ?? prev.percent),
        }));
      }
      await loadTasks(true);
      if (isTargetingCurrentTask) await getTaskInformations(true);
      return;
    }

    if (response.type === 2) {
      if (isTargetingCurrentTask && response.object) {
        if (response.object.isItemUp) itemUp(response.object);
        else if (response.object.remove) reloadPageDeleteItem(response);
        else if (response.object.isUserTask) userTaskItem(response.object);
        else reloadPageItem(response.object);
      }
      return;
    }

    if (response.type === -3 || response.type === 5) {
      if (isTargetingCurrentTask && response.type === -3) {
        setOpenCardDefault(false);
        clearGtppWsContext();
      }
      await loadTasks();
      return;
    }

    if (response.type === 3) {
      if (isTargetingCurrentTask && response.object) {
        getDescription(response.object);
      }
    }
  }

  // --- Memoized context value ---
  const contextValue = useMemo<iGtppWsContextType>(
    () => ({
      task, taskDetails, taskPercent, userTaskBind, notifications, states,
      onSounds, getTask, isAdm, openCardDefault, themeList, comment, getUser,

      getTaskInformations, loadTasks, reqTasks, getThemeListformations, clearGtppWsContext,
      checkedItem, handleAddTask, changeDescription, changeObservedForm,
      stopAndToBackTask, checkTaskComShoDepSub, updatedForQuestion, updatedAddUserTaskItem,
      updateItemTaskFile, deleteItemTaskWS, addUserTask, reloadPagePercent, updateStates,
      getComment, getCountComment, sendComment, deleteComment, editComment,
      notifyMentionWs, updateCommentCount,

      setOpenCardDefault, setGetTask, setOnSounds, setNotifications,
      setTaskPercent, setTask, setTaskDetails, setIsAdm, setComment,
      setThemeList, setGetUser,
    }),
    [
      task, taskDetails, taskPercent, userTaskBind, notifications, states,
      onSounds, getTask, isAdm, openCardDefault, themeList, comment, getUser,
      getComment, sendComment, handleAddTask, updateCommentCount,
    ]
  );

  return (
    <GtppWsContext.Provider value={contextValue}>
      {children}
    </GtppWsContext.Provider>
  );
};

export const useWebSocket = (): iGtppWsContextType => {
  const context = useContext(GtppWsContext);
  if (!context) throw new Error("useWebSocket deve ser usado dentro de um GtppWsProvider");
  return context;
};
