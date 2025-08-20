export function UpdateStates(newList: any[], setStates: any) {
  localStorage.gtppStates = JSON.stringify(newList);
  setStates([...newList]);
}
export function CreateStorageState(list: any[]) {
  let listState: [{ id: number; description: string; color: string }] = [
    { id: 0, description: "", color: "" },
  ];
  list.forEach((element: any, index: number) => {
    const item = {
      id: element.id,
      description: element.description,
      color: element.color,
      active: true,
    };
    index == 0 ? (listState[index] = item) : listState.push(item);
  });
  return listState;
}
export function AddDays(daysToAdd: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}
export function ClearGtppWsContext(setTask: any, setTaskDetails: any) {
  setTask({});
  setTaskDetails({});
}
export const RequestNotificationPermission = async (setOnSounds: any) => {
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
