import { classToJSON } from "../../../Util/Util";
import InformSending from "../Class/InformSending";

export async function callbackOnMessage(event: any, updateNotification:any, setTask: any, task: any, loadTasks: any, itemUp: any, reloadPageDeleteItem: any, reloadPageItem: any, setOpenCardDefault: any, getDescription: any) {
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

// @ts-ignore
export const closeCardDefaultGlobally = (taskId?: number, ws: any, userLog: any) => {
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: { description: "O card padrão foi fechado por outro usuário.", task_id: taskId },
      task_id: taskId,
      type: 7,
    });
  };

export function addUserTask(element: any, type: number, userLog: any, ws: any) {
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
  
export function infSenStates(taskLocal: any, result: any, task: any, setTask: any, ws: any, userLog: any) {
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

export function infSenCheckItem(taskLocal: any, result: any, ws: any, userLog: any) {
    ws.current.informSending(classToJSON(new InformSending(false, userLog.id, taskLocal.task_id, 2, {
      description: taskLocal.check ? "Um item foi marcado" : "Um item foi desmarcado",
      percent: result.percent,
      itemUp: taskLocal,
      isItemUp: true,
    })));
  };

export function deleteItemTaskWS(object: any, ws: any, userLog: any, task: any) {
    ws.current.informSending({
        "user_id": userLog.id,
        object,
        "task_id": task.id,
        "type": 2
    });
};