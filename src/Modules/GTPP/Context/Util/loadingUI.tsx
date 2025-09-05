import NotificationGTPP from "../../Class/NotificationGTPP";

export function ReloadPagePercent(
  value: any,
  taskLocal: any,
  task: any,
  setTaskPercent: any,
  getTask: any,
  setGetTask: any
) {
  if (task.id == taskLocal.task_id) {
    setTaskPercent(parseInt(value.percent));
    if (getTask.length > 0) {
      getTask[
        getTask.findIndex((item: any) => item.id == taskLocal.task_id)
      ].percent = parseInt(value.percent);
      setGetTask([...getTask]);
    }
  }
}
export function ReloadPageChangeQuestion(
  yes_no: number,
  item_id: number,
  taskDetails: any
) {
  if (taskDetails.data?.task_item) {
    taskDetails.data.task_item[
      taskDetails.data?.task_item.findIndex((item: any) => item.id == item_id)
    ].yes_no = yes_no;
  }
}
export function ReloadPageDeleteItem(
  value: any,
  taskDetails: any,
  setTaskDetails: any,
  reloadPagePercent: any
) {
  const indexDelete: number | undefined = taskDetails.data?.task_item.findIndex(
    (item: any) => item.id == value.object.itemUp
  );
  if (indexDelete != undefined && indexDelete >= 0) {
    taskDetails.data?.task_item.splice(indexDelete, 1);
    setTaskDetails({ ...taskDetails });
  }
  reloadPagePercent(value.object, value);
}
export function ReloadPageItem(
  object: any,
  reloadPageAddItem: any,
  reloadPageUpNoteItem: any
) {
  if (object.itemUp) {
    reloadPageAddItem(object);
  } else {
    reloadPageUpNoteItem(object);
  }
}
export function ReloadPageAddItem(
  object: any,
  taskDetails: any,
  setTaskDetails: any,
  reloadPagePercent: any
) {
  taskDetails.data?.task_item.push(object.itemUp);
  setTaskDetails({ ...taskDetails });
  reloadPagePercent(object, object.itemUp);
}
export function ReloadPageUpNoteItem(
  object: any,
  taskDetails: any,
  setTaskDetails: any
) {
  if (taskDetails.data) taskDetails.data.task_item[0].note = object.note;
  setTaskDetails({ ...taskDetails });
}
export function ItemUp(
  value: any,
  taskDetails: any,
  setTaskDetails: any,
  reloadPagePercent: any
) {
  taskDetails.data?.task_item.forEach((element: any, index: number) => {
    if (taskDetails.data && element.id == value.itemUp.id)
      taskDetails.data.task_item[index] = value.itemUp;
  });
  setTaskDetails({ ...taskDetails });
  reloadPagePercent(value, value.itemUp);
}
export function GetDescription(
  description: any,
  taskDetails: any,
  setTaskDetails: any
) {
  if (taskDetails.data) {
    taskDetails.data.full_description = description.full_description;
    setTaskDetails({ ...taskDetails });
  }
}
export async function UpdateNotification(
  item: any[],
  setLoading: any,
  onSounds: any,
  soundFile: any,
  states: any,
  notifications: any[],
  setNotifications: any,
  handleNotification: any
) {
  try {
    setLoading(true);
    if (onSounds) {
      const audio = new Audio(soundFile);
      audio.play().catch((error: any) => {
        console.error("Erro ao reproduzir o som:", error);
      });
    }
    const notify = new NotificationGTPP();
    await notify.loadNotify(item, states);
    notifications.push(...notify.list);
    setNotifications([...notifications]);
    setNotifications((prevNotifications: any) => [
      ...prevNotifications,
      ...notify.list,
    ]);

    if (notify.list.length === 0) {
      console.warn("Nenhuma notificação foi criada. Dados recebidos:", item);
    }

    if (notify.list.length > 0) {
      const n = notify.list[0];
      handleNotification (
        n["title"] ?? "Aviso",
        n["message"] ?? "Alteração realizada.",
        n["typeNotify"] ?? "info"
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}
