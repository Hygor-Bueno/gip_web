import { useCallback, MutableRefObject, Dispatch, SetStateAction } from "react";
import { iTaskReq } from "../../../../Interface/iGIPP";
import {
  IGtppActiveTask,
  IGtppTaskSummary,
  IApiResponse,
  ITaskItem,
  ITaskItemResult,
  IUserAssignState,
  IUserTaskElement,
  IWsObject,
} from "../types/gtppTypes";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import { classToJSON, handleNotification } from "../../../../Util/Utils";
import InformSending from "../../Class/InformSending";
import { addDays } from "../helpers/taskPageHelpers";
import GtppWebSocket from "../GtppWebSocket";

export function useGtppTaskItems(
  task: Partial<IGtppActiveTask>,
  setTask: Dispatch<SetStateAction<Partial<IGtppActiveTask>>>,
  setTaskDetails: Dispatch<SetStateAction<iTaskReq>>,
  loadTasks: (silent?: boolean) => Promise<void>,
  getTaskInformations: (silent?: boolean) => Promise<void>,
  reloadPagePercent: (value: { percent?: number | string }, taskLocal: { task_id?: number | string }) => void,
  reloadPageChangeQuestion: (yes_no: number, item_id: number) => void,
  ws: MutableRefObject<GtppWebSocket>
) {
  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();

  const closeCardDefaultGlobally = (taskId?: number): void => {
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: { description: "O card padrão foi fechado por outro usuário.", task_id: taskId },
      task_id: taskId,
      type: 7,
    });
  };

  function addUserTask(element: IUserTaskElement, type: number): void {
    const info = {
      error: false,
      user_id: element.user_id,
      send_user_id: userLog.id,
      object: {
        description:
          type === 5
            ? `${element.name} foi vinculado a tarefa`
            : `${element.name} foi removido da tarefa`,
        ...(type === 5 && { changeUser: element.user_id, task_id: element.task_id }),
      },
      task_id: element.task_id,
      type,
    };
    ws.current.informSending(info);
  }

  function infSenStates(taskLocal: { task_id: number }, result: { state_id: number; percent: number | string }): void {
    setTask((prev) => ({ ...prev, state_id: result.state_id }));
    ws.current.informSending(
      classToJSON(
        new InformSending(false, userLog.id, taskLocal.task_id, 6, {
          description: "Mudou para",
          task_id: taskLocal.task_id,
          percent: result.percent,
          state_id: result.state_id,
          task,
        })
      )
    );
  }

  function infSenCheckItem(taskLocal: ITaskItem, result: { percent: number | string }): void {
    ws.current.informSending(
      classToJSON(
        new InformSending(false, userLog.id, taskLocal.task_id ?? 0, 2, {
          description: taskLocal.check ? "marcado" : "desmarcado",
          percent: result.percent,
          itemUp: taskLocal,
          isItemUp: true,
        })
      )
    );
  }

  async function verifyChangeState(
    newState: number,
    oldState: number,
    taskLocal: { task_id: number },
    result: { state_id: number; percent: number | string }
  ): Promise<void> {
    if (newState !== oldState) {
      await loadTasks();
      infSenStates(taskLocal, result);
    }
  }

  async function checkedItem(
    id: number,
    checked: boolean,
    idTask: number | string,
    taskLocal: ITaskItem,
    yes_no?: number
  ): Promise<void> {
    try {
      const item = yes_no
        ? { id: Number(id), task_id: String(idTask), yes_no: Number(yes_no) }
        : { check: checked, id, task_id: idTask };

      const res = (await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" }) ??
        { error: false }) as IApiResponse<ITaskItemResult>;

      if (res.error) throw new Error(res.message);
      if (!yes_no) taskLocal.check = checked;
      if (yes_no) reloadPageChangeQuestion(yes_no, Number(id));
      reloadPagePercent(res.data, { task_id: idTask });
      await verifyChangeState(res.data.state_id, task.state_id ?? 0, { task_id: Number(idTask) }, res.data);
      infSenCheckItem(taskLocal, res.data);
    } catch (error: unknown) {
      console.error(`Erro ao marcar/desmarcar item ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function checkTaskComShoDepSub(
    task_id: number,
    company_id: number,
    shop_id: number,
    depart_id: number,
    taskLocal: number
  ): Promise<void> {
    setLoading(true);
    try {
      await fetchData({
        method: "POST",
        urlComplement: "",
        pathFile: "GTPP/TaskComShoDepSub.php",
        exception: ["no data"],
        params: { task_id, company_id, shop_id, depart_id },
      });
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: { description: "Atualizada", task_id, company_id, shop_id, depart_id },
        task_id: taskLocal,
        type: 2,
      });
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  const handleAddTask = useCallback(
    async (description: string, task_id: string, yes_no: number, file?: string): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetchData({
          method: "POST",
          params: { description, file: file ?? "", task_id, yes_no },
          pathFile: "GTPP/TaskItem.php",
        }) as IApiResponse<ITaskItemResult>;

        if (res.error) throw new Error(res.message);

        const item: ITaskItem = {
          id: (res.data as ITaskItemResult & { last_id: number }).last_id,
          description,
          check: false,
          task_id: parseInt(task_id),
          order: res.data.order,
          created_by: res.data.created_by,
          yes_no: res.data.yes_no,
          file: file ? 1 : 0,
          note: null,
        };

        setTaskDetails((prev: iTaskReq) => {
          if (!prev.data) return prev;
          const newItems = Array.isArray(prev.data.task_item)
            ? [...prev.data.task_item, item]
            : [item];
          return { ...prev, data: { ...prev.data, task_item: newItems } };
        });

        ws.current.informSending({
          user_id: userLog.id,
          object: { description: "Novo item", percent: res.data.percent, itemUp: item },
          task_id,
          type: 2,
        });
        reloadPagePercent(res.data, { task_id });

        if (task.state_id !== res.data.state_id) {
          await verifyChangeState(res.data.state_id, task.state_id ?? 0, { task_id: task.id ?? 0 }, res.data);
        }
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [fetchData, userLog.id, task.id, task.state_id]
  );

  async function changeDescription(description: string, id: number, descLocal: string): Promise<void> {
    setLoading(true);
    try {
      await fetchData({
        method: "PUT",
        pathFile: "GTPP/Task.php",
        exception: ["no data"],
        params: { id, full_description: description },
      });
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: { description: "Atualizada", task_id: id, full_description: description },
        task_id: descLocal,
        type: 3,
      });
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function updateItemTaskFile(file: string, item_id?: number): Promise<void> {
    try {
      if (item_id) {
        await fetchData({
          method: "PUT",
          pathFile: "GTPP/TaskItem.php",
          exception: ["no data"],
          params: { task_id: task.id, id: item_id, file },
        });
      }
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  }

  async function changeObservedForm(
    taskId: number,
    subId: number,
    value: string,
    isObservation: boolean
  ): Promise<void> {
    setLoading(true);
    try {
      const item: Record<string, string | number> = { id: subId, task_id: taskId };
      item[isObservation ? "note" : "description"] = value;
      await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });
      await getTaskInformations();
      ws.current.informSending({ error: false, user_id: userLog.id, object: item as IWsObject, task_id: taskId, type: 2 });
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function upTask(
    taskId: number,
    resource: string | null,
    date: string | null,
    taskList: Partial<IGtppActiveTask> | null,
    message: string,
    type: number,
    object?: IWsObject
  ): Promise<void> {
    setLoading(true);
    ws.current.informSending(
      classToJSON(
        new InformSending(
          false,
          userLog.id,
          taskId,
          type,
          object ?? { description: message, task_id: taskId, reason: resource, days: date ?? undefined, taskState: taskList?.state_id }
        )
      )
    );
    await loadTasks();
    setLoading(false);
  }

  async function updateStateTask(
    taskId: number,
    resource: string | null,
    date: string | null
  ): Promise<number | null> {
    setLoading(true);
    try {
      const res = await fetchData({
        method: "PUT",
        params: { task_id: taskId, reason: resource, days: parseInt(date ?? "0") },
        pathFile: "GTPP/TaskState.php",
      }) as IApiResponse<Array<{ id: number }> | { id: number }>;
      if (!res || res.error) return null;
      if (Array.isArray(res.data)) return res.data[0]?.id ?? null;
      return (res.data as { id: number })?.id ?? null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function stopAndToBackTask(
    taskId: number,
    resource: string | null,
    date: string | null,
    taskList: Partial<IGtppActiveTask>
  ): Promise<void> {
    try {
      const taskState = await updateStateTask(taskId, resource, date);
      if (taskState === null) throw new Error("Erro ao atualizar estado da tarefa");

      const stateObj: IWsObject = { description: "send", task_id: taskId, state_id: taskState };

      if (taskList.state_id === 5) {
        await upTask(taskId, resource, date, taskList, "Voltou!", 6, {
          ...stateObj,
          percent: task.percent ?? taskList.percent,
          new_final_date: addDays(parseInt(date ?? "0")),
        });
      } else if (taskList.state_id === 4 || taskList.state_id === 6) {
        await upTask(taskId, resource, date, taskList, "send", 6, stateObj);
      } else if (taskList.state_id === 1 || taskList.state_id === 2) {
        await upTask(taskId, resource, date, taskList, "Parada!", 6, stateObj);
      } else if (taskList.state_id === 3) {
        await upTask(taskId, resource, date, taskList, "Finalizada!", 6, {
          ...stateObj,
          percent: task.percent ?? taskList.percent,
        });
      }

      if (task.id) {
        setTask((prev) => ({ ...prev, state_id: taskState, percent: task.percent ?? prev.percent }));
      }
      closeCardDefaultGlobally(taskId);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(msg);
      handleNotification("Atenção!", msg, "danger");
    }
  }

  async function updatedForQuestion(item: { task_id: number; id: number; yes_no: number }): Promise<void> {
    try {
      setLoading(true);
      await fetchData({ method: "PUT", params: item, pathFile: "GTPP/TaskItem.php" });

      let clonedItemUp: ITaskItem | null = null;
      setTaskDetails((prev: iTaskReq) => {
        if (!prev.data?.task_item) return prev;
        const updatedList = prev.data.task_item.map((element: ITaskItem) => {
          if (element.id === item.id) {
            clonedItemUp = { ...element, yes_no: item.yes_no };
            return clonedItemUp;
          }
          return element;
        });
        return { ...prev, data: { ...prev.data, task_item: updatedList } };
      });

      if (clonedItemUp) {
        await upTask(item.task_id, null, null, null, "item comum", 2, {
          description: "Alterado",
          percent: task.percent,
          itemUp: clonedItemUp,
          isItemUp: true,
        });
      }
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function updatedAddUserTaskItem(
    item: { task_id: number; user_id: number; id: number },
    setUserState: Dispatch<SetStateAction<IUserAssignState>>
  ): Promise<void> {
    const value = { task_id: item.task_id, id: item.id, assigned_to: item.user_id };
    const res = await fetchData({
      method: "PUT",
      params: value,
      pathFile: "GTPP/TaskItem.php",
      urlComplement: "",
    }) as IApiResponse<unknown>;

    if (!res.error) {
      setUserState((prev) => ({ ...prev, isListUser: false, loadingList: [] }));
      await getTaskInformations();
      handleNotification("Sucesso", "Vínculo ok!", "success");
      ws.current.informSending(
        classToJSON(new InformSending(false, userLog.id, item.task_id, 2, { description: "Usuário vinculado", isUserTask: true }))
      );
    } else {
      console.error(res.message);
    }
  }

  function deleteItemTaskWS(object: IWsObject): void {
    ws.current.informSending({ user_id: userLog.id, object, task_id: task.id ?? 0, type: 2 });
  }

  return {
    checkedItem, checkTaskComShoDepSub, handleAddTask,
    changeDescription, updateItemTaskFile, changeObservedForm,
    upTask, updateStateTask, stopAndToBackTask,
    updatedForQuestion, updatedAddUserTaskItem,
    deleteItemTaskWS, addUserTask, closeCardDefaultGlobally,
  };
}
