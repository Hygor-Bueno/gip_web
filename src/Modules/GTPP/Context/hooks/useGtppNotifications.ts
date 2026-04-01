import { useState } from "react";
import { CustomNotification, iStates } from "../../../../Interface/iGIPP";
import { IApiResponse, IWsMessage } from "../types/gtppTypes";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import NotificationGTPP from "../../Class/NotificationGTPP";
import { handleNotification } from "../../../../Util/Utils";
import soundFile from "../../../../Assets/Sounds/notify.mp3";

export function useGtppNotifications(states: iStates[]) {
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [onSounds, setOnSounds] = useState<boolean>(false);

  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();

  async function updateNotification(items: IWsMessage[]): Promise<void> {
    try {
      setLoading(true);
      if (onSounds) {
        new Audio(soundFile).play().catch((e: unknown) => console.error(e));
      }
      const notify = new NotificationGTPP();
      const req = await notify.loadNotify(items, states);
      if (req === undefined) throw new Error("No data");
      if (notify.list.length === 0) return;
      setNotifications((prev) => [...prev, ...notify.list]);
      handleNotification(notify.list[0]["title"], notify.list[0]["message"], notify.list[0]["typeNotify"]);
    } catch (error: unknown) {
      console.error(`Erro ao atualizar notificações: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  const requestNotificationPermission = async (): Promise<void> => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setOnSounds(true);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") setOnSounds(true);
    }
  };

  async function loadInitialNotifications(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Notify.php",
        urlComplement: `&id_user=${userLog.id}`,
        exception: ["No data"],
      }) as IApiResponse<IWsMessage[]>;
      if (res.error) throw new Error(res.message);
      await updateNotification(res.data ?? []);
    } catch (error: unknown) {
      console.error(`Erro ao carregar notificações: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    notifications, setNotifications,
    onSounds, setOnSounds,
    updateNotification, requestNotificationPermission, loadInitialNotifications,
  };
}
