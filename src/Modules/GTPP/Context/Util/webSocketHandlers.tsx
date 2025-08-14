import { classToJSON } from "../../../../Util/Util";
import InformSending from "../../Class/InformSending";
import User from "../../../../Class/User";
import { Dispatch } from "react";

export async function CallbackOnMessage(event: any, updateNotification: Dispatch<[any]>, task: {id: number }, setTask: Dispatch<object>, loadTasks: () => Promise<void>, itemUp: Dispatch<object>, reloadPageDeleteItem: Dispatch<object>, reloadPageItem: Dispatch<object>, setOpenCardDefault: Dispatch<boolean>, getDescription: Dispatch<object> ) {
    let response = JSON.parse(event.data);
    // console.log(event.data,localStorage.getItem("tokenGIPP"));
    if (response.error && response.message.includes("This user has been connected to another place")) {
      // handleNotification("Você será desconectado.", "Usuário logado em outro dispositivo!", "danger");
      // setTimeout(() => {
      //   navigate("/");
      //   localStorage.removeItem("tokenGIPP");
      //   localStorage.removeItem("codUserGIPP");
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
        } else if (response.object) {
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

export function DeleteItemTaskWS(object: unknown, ws: any, userLog: User, task: {id: number}) {
   return ws.current.informSending({
      user_id: userLog.id,
      object,
      task_id: task.id,
      type: 2,
    });
  }

export const CloseCardDefaultGlobally = (taskId?: number, ws?: any, userLog?: User) => {
   return ws.current.informSending({
      error: false,
      user_id: userLog?.id,
      object: { description: "O card padrão foi fechado por outro usuário.", task_id: taskId },
      task_id: taskId,
      type: 7,
    });
  };

export function InfSenStates(taskLocal: {task_id: number}, result: {percent: number, state_id: number}, task: any, setTask: any, ws: any, userLog: User) {
    task.state_id = result.state_id;
    setTask({ ...task });
    return ws.current.informSending(
      classToJSON(
        new InformSending(false, userLog.id, taskLocal.task_id, 6, {
          description: "Mudou para",
          task_id: taskLocal.task_id,
          percent: result.percent,
          state_id: result.state_id,
          task: task,
        })
      )
    );
  }

export function InfSenCheckItem(taskLocal: any, result: { percent: number }, ws: any, userLog: User) {
  return ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, { description: taskLocal.check ? "Um item foi marcado" : "Um item foi desmarcado", percent: result.percent, itemUp: taskLocal, isItemUp: true })));
}

export async function UpTask( taskId: number, resource: string | null, date: string | null, taskList: {state_id: number}, message: string, type: number, object?: {}, setLoading?: any, ws?: any, userLog?: User, loadTasks?: any) {
  try {
    setLoading(true);
    return ws.current.informSending(
      classToJSON(new InformSending(false,Number(userLog?.id),taskId,type,object || { description: message, task_id: taskId, reason: resource, days: date, taskState: taskList.state_id}))
    );
  } catch {
  } finally {
    await loadTasks();
    setLoading(false);
  }
}

 