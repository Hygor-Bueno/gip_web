import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationSource = "gtpp" | "clpp";
export type NotificationType =
  | "success"
  | "danger"
  | "info"
  | "default"
  | "warning";

export interface HubNotification {
  id: string;
  source: NotificationSource;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  task_id?: number;
  extra?: Record<string, unknown>;
}

export interface NotifyEventDetail {
  source: NotificationSource;
  title: string;
  message: string;
  type?: NotificationType;
  task_id?: number;
  externalId?: string | number;
  extra?: Record<string, unknown>;
}

interface NotificationHubContextType {
  notifications: HubNotification[];
  unreadCount: number;
  unreadBySource: Record<NotificationSource, number>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markSourceAsRead: (source: NotificationSource) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  clearSource: (source: NotificationSource) => void;
  push: (n: NotifyEventDetail) => void;
}

const STORAGE_KEY = "gipp_notification_hub_v1";
const MAX_NOTIFICATIONS = 200;

const NotificationHubContext = createContext<NotificationHubContextType | undefined>(
  undefined
);

function loadFromStorage(): HubNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HubNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

function saveToStorage(list: HubNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_NOTIFICATIONS)));
  } catch {
    /* quota — ignore */
  }
}

export function dispatchAppNotification(detail: NotifyEventDetail): void {
  try {
    window.dispatchEvent(new CustomEvent<NotifyEventDetail>("app:notify", { detail }));
  } catch (err) {
    console.error("Falha ao despachar app:notify", err);
  }
}

export const NotificationHubProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<HubNotification[]>(() =>
    loadFromStorage()
  );
  const seenIds = useRef<Set<string>>(
    new Set(notifications.map((n) => n.id))
  );

  const persist = useCallback((list: HubNotification[]) => {
    saveToStorage(list);
  }, []);

  const push = useCallback((detail: NotifyEventDetail) => {
    const externalKey =
      detail.externalId != null
        ? `${detail.source}:${detail.externalId}`
        : `${detail.source}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    if (seenIds.current.has(externalKey)) return;
    seenIds.current.add(externalKey);

    const entry: HubNotification = {
      id: externalKey,
      source: detail.source,
      title: detail.title,
      message: detail.message,
      type: detail.type ?? "info",
      timestamp: Date.now(),
      read: false,
      task_id: detail.task_id,
      extra: detail.extra,
    };

    setNotifications((prev) => {
      const next = [...prev, entry].slice(-MAX_NOTIFICATIONS);
      persist(next);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    function handler(ev: Event) {
      const ce = ev as CustomEvent<NotifyEventDetail>;
      if (!ce.detail) return;
      push(ce.detail);
    }
    window.addEventListener("app:notify", handler);
    return () => window.removeEventListener("app:notify", handler);
  }, [push]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return next;
    });
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.read ? n : { ...n, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const markSourceAsRead = useCallback((source: NotificationSource) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.source === source && !n.read ? { ...n, read: true } : n
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      seenIds.current.delete(id);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    seenIds.current.clear();
    setNotifications([]);
    persist([]);
  }, [persist]);

  const clearSource = useCallback((source: NotificationSource) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.source !== source);
      prev
        .filter((n) => n.source === source)
        .forEach((n) => seenIds.current.delete(n.id));
      persist(next);
      return next;
    });
  }, [persist]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => (n.read ? acc : acc + 1), 0),
    [notifications]
  );

  const unreadBySource = useMemo<Record<NotificationSource, number>>(() => {
    const acc: Record<NotificationSource, number> = { gtpp: 0, clpp: 0 };
    for (const n of notifications) {
      if (!n.read) acc[n.source] = (acc[n.source] ?? 0) + 1;
    }
    return acc;
  }, [notifications]);

  const value = useMemo<NotificationHubContextType>(
    () => ({
      notifications,
      unreadCount,
      unreadBySource,
      markAsRead,
      markAllAsRead,
      markSourceAsRead,
      remove,
      clearAll,
      clearSource,
      push,
    }),
    [
      notifications,
      unreadCount,
      unreadBySource,
      markAsRead,
      markAllAsRead,
      markSourceAsRead,
      remove,
      clearAll,
      clearSource,
      push,
    ]
  );

  return (
    <NotificationHubContext.Provider value={value}>
      {children}
    </NotificationHubContext.Provider>
  );
};

export const useNotificationHub = (): NotificationHubContextType => {
  const ctx = useContext(NotificationHubContext);
  if (!ctx)
    throw new Error(
      "useNotificationHub deve ser usado dentro de um NotificationHubProvider"
    );
  return ctx;
};
