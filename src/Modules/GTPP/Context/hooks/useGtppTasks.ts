import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { iTaskReq } from "../../../../Interface/iGIPP";
import { IApiResponse, IGtppActiveTask, IGtppTaskSummary, ITaskItem, ITaskItemResult } from "../types/gtppTypes";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";

export function useGtppTasks() {
  const [task, setTask] = useState<Partial<IGtppActiveTask>>({});
  const [taskDetails, setTaskDetails] = useState<iTaskReq>({});
  const [taskPercent, setTaskPercent] = useState<number>(0);
  const [getTask, setGetTask] = useState<IGtppTaskSummary[]>([]);
  const [isAdm, setIsAdm] = useState<boolean>(false);

  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  const loadTasks = async (silent = false): Promise<void> => {
    try {
      await reqTasks(silent);
    } catch (error: unknown) {
      console.error(`Erro ao carregar tarefas: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  async function reqTasks(silent = false): Promise<void> {
    try {
      if (!silent) setLoading(true);
      const res = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Task.php",
        urlComplement: isAdm ? "&administrator=1" : "",
      }) as IApiResponse<IGtppTaskSummary[]>;
      if (res.error) throw new Error(res.message);
      setGetTask(res.data ?? []);
    } catch (error: unknown) {
      console.error(`Erro ao requisitar tarefas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function getTaskInformations(silent = false): Promise<void> {
    if (!task.id) return;
    try {
      if (!silent) setLoading(true);
      const res = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Task.php",
        exception: ["no data"],
        urlComplement: `&id=${task.id}`,
      }) as IApiResponse<iTaskReq["data"]>;
      if (res.error) throw new Error(res.message);
      setTaskDetails(res as iTaskReq);
    } catch (error: unknown) {
      console.error(`Erro ao obter detalhes: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const updateCommentCount = useCallback(
    (taskItemId: number, action: "add" | "remove"): void => {
      if (!taskItemId) return;
      setTaskDetails((prev: iTaskReq) => {
        if (!prev.data?.task_item) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            task_item: prev.data.task_item.map((item: ITaskItem) => {
              if (Number(item.id) === Number(taskItemId)) {
                const currentTotal = Number(item.total_comment) || 0;
                const newTotal = action === "add" ? currentTotal + 1 : Math.max(0, currentTotal - 1);
                return { ...item, total_comment: newTotal };
              }
              return item;
            }),
          },
        };
      });
    },
    [setTaskDetails]
  );

  function reloadPagePercent(
    value: { percent?: number | string },
    taskLocal: { task_id?: number | string }
  ): void {
    if (task.id == taskLocal.task_id) {
      const pct = Number(value.percent ?? 0);
      setTaskPercent(pct);
      setGetTask((prev) =>
        prev.map((item) =>
          item.id == taskLocal.task_id ? { ...item, percent: pct } : item
        )
      );
    }
  }

  function reloadPageChangeQuestion(yes_no: number, item_id: number): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data?.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((item: ITaskItem) =>
            item.id === item_id ? { ...item, yes_no } : item
          ),
        },
      };
    });
  }

  function reloadPageDeleteItem(value: { object?: { itemUp?: ITaskItem | number; percent?: number | string }; task_id?: number }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data?.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.filter(
            (item: ITaskItem) => item.id !== Number(value.object?.itemUp)
          ),
        },
      };
    });
    reloadPagePercent(
      { percent: value.object?.percent },
      { task_id: value.task_id }
    );
  }

  function reloadPageItem(object: { itemUp?: ITaskItem | number; id?: number; note?: string; percent?: number | string }): void {
    if (object.itemUp) reloadPageAddItem(object);
    else reloadPageUpNoteItem(object);
  }

  function reloadPageAddItem(object: { itemUp?: ITaskItem | number; percent?: number | string }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data) return prev;
      const newList = Array.isArray(prev.data.task_item)
        ? [...prev.data.task_item, object.itemUp as ITaskItem]
        : [object.itemUp as ITaskItem];
      return { ...prev, data: { ...prev.data, task_item: newList } };
    });
    if (object.itemUp && typeof object.itemUp !== "number") {
      reloadPagePercent(object, { task_id: object.itemUp.task_id });
    }
  }

  function reloadPageUpNoteItem(object: { id?: number; note?: string }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data?.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((item: ITaskItem) =>
            item.id === object.id ? { ...item, note: object.note ?? null } : item
          ),
        },
      };
    });
  }

  function itemUp(value: { itemUp?: ITaskItem | number; percent?: number | string }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data?.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((item: ITaskItem) =>
            item.id === (value.itemUp as ITaskItem)?.id
              ? (value.itemUp as ITaskItem)
              : item
          ),
        },
      };
    });
    if (value.itemUp && typeof value.itemUp !== "number") {
      reloadPagePercent(value, { task_id: value.itemUp.task_id });
    }
  }

  function userTaskItem(value: { itemUp?: ITaskItem | number }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data?.task_item) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          task_item: prev.data.task_item.map((element: ITaskItem) =>
            element.id === (value.itemUp as ITaskItem)?.id
              ? (value.itemUp as ITaskItem)
              : element
          ),
        },
      };
    });
  }

  function getDescription(description: { full_description?: string }): void {
    setTaskDetails((prev: iTaskReq) => {
      if (!prev.data) return prev;
      return { ...prev, data: { ...prev.data, full_description: description.full_description } };
    });
  }

  function clearGtppWsContext(): void {
    setTask({});
    setTaskDetails({});
  }

  return {
    task, setTask,
    taskDetails, setTaskDetails,
    taskPercent, setTaskPercent,
    getTask, setGetTask,
    isAdm, setIsAdm,
    loadTasks, reqTasks, getTaskInformations, updateCommentCount,
    reloadPagePercent, reloadPageChangeQuestion, reloadPageDeleteItem,
    reloadPageItem, itemUp, userTaskItem, getDescription, clearGtppWsContext,
  };
}
