import { classToJSON } from "../../../Util/Util";
import InformSending from "../Class/InformSending";

// ======================
// Tipos base
// ======================

type User = {
  id: number;
};

type Task = {
  id: number;
  state_id?: number;
  percent?: number;
};

type WSMessage<T = any> = {
  error: boolean;
  message?: string;
  user_id?: number;
  send_user_id?: number;
  task_id?: number;
  type: number;
  object?: T;
};

type WSRef = {
  current: {
    informSending: (data: unknown) => void;
  };
};

// ======================
// callbackOnMessage
// ======================

export async function callbackOnMessage(
  event: MessageEvent<string>,
  updateNotification: (data: WSMessage[]) => void,
  setTask: React.Dispatch<React.SetStateAction<Task>>,
  task: Task,
  loadTasks: () => Promise<void>,
  itemUp: (data: unknown) => void,
  reloadPageDeleteItem: (data: WSMessage) => void,
  reloadPageItem: (data: unknown) => void,
  setOpenCardDefault: (value: boolean) => void,
  getDescription: (data: unknown) => void
): Promise<void> {
  const response: WSMessage = JSON.parse(event.data);

  if (
    response.error &&
    response.message?.includes("This user has been connected to another place")
  ) {
    return;
  }

  if (!response.error && response.send_user_id !== Number(localStorage.codUserGIPP)) {
    updateNotification([response]);

    if ([ -1, 2, 6 ].includes(response.type)) {
      if (response.type === 6) {
        if (task.id === response.task_id) {
          setTask(prev => ({
            ...prev,
            state_id: response.object?.state_id,
            percent: response.object?.percent
          }));
        }
        await loadTasks();
      } else if (response.object && response.type === 2) {
        if (response.object.isItemUp) itemUp(response.object);
        else if (response.object.remove) reloadPageDeleteItem(response);
        else reloadPageItem(response.object);
      }
    } else if ([ -3, 5 ].includes(response.type)) {
      if (task.id === response.task_id && response.type === -3) {
        setOpenCardDefault(false);
      }
      await loadTasks();
    }
  }

  if (!response.error && response.type === 3 && response.object) {
    getDescription(response.object);
  }
}

// ======================
// closeCardDefaultGlobally
// ======================

export const closeCardDefaultGlobally = (
  taskId?: number,
  ws?: WSRef,
  userLog?: User
): void => {
  ws?.current.informSending({
    error: false,
    user_id: userLog?.id,
    object: {
      description: "O card padrão foi fechado por outro usuário.",
      task_id: taskId
    },
    task_id: taskId,
    type: 7
  });
};

// ======================
// addUserTask
// ======================

type UserTaskElement = {
  user_id: number;
  name: string;
  task_id: number;
};

export function addUserTask(
  element: UserTaskElement,
  type: 5 | number,
  userLog: User,
  ws: WSRef
): void {
  const info: WSMessage = {
    error: false,
    user_id: element.user_id,
    send_user_id: userLog.id,
    object: {
      description:
        type === 5
          ? `${element.name} foi vinculado a tarefa`
          : `${element.name} foi removido da tarefa`
    },
    task_id: element.task_id,
    type
  };

  if (type === 5 && info.object) {
    info.object.changeUser = element.user_id;
    info.object.task_id = element.task_id;
  }

  ws.current.informSending(info);
}

// ======================
// infSenStates
// ======================

export function infSenStates(
  taskLocal: { task_id: number },
  result: { state_id: number; percent: number },
  task: Task,
  setTask: React.Dispatch<React.SetStateAction<Task>>,
  ws: WSRef,
  userLog: User
): void {
  setTask(prev => ({
    ...prev,
    state_id: result.state_id,
    percent: result.percent
  }));

  ws.current.informSending(
    classToJSON(
      new InformSending(false, userLog.id, taskLocal.task_id, 6, {
        description: "Mudou para",
        task_id: taskLocal.task_id,
        percent: result.percent,
        state_id: result.state_id,
        task
      })
    )
  );
}

// ======================
// infSenCheckItem
// ======================

export function infSenCheckItem(
  taskLocal: { check: boolean },
  result: { percent: number },
  ws: WSRef,
  userLog: User
): void {
  ws.current.informSending(
    classToJSON(
      // @ts-ignore 
      new InformSending(false, userLog.id, undefined, 2, {
        description: taskLocal.check
          ? "Um item foi marcado"
          : "Um item foi desmarcado",
        percent: result.percent,
        itemUp: taskLocal,
        isItemUp: true
      })
    )
  );
}

// ======================
// deleteItemTaskWS
// ======================

export function deleteItemTaskWS(
  object: unknown,
  ws: WSRef,
  userLog: User,
  task: Task
): void {
  ws.current.informSending({
    user_id: userLog.id,
    object,
    task_id: task.id,
    type: 2
  });
}
