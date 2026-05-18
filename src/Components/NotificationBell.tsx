import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  HubNotification,
  NotificationSource,
  useNotificationHub,
} from "../Context/NotificationHubContext";
import { useWebSocket as useGtppWs } from "../Modules/GTPP/Context/GtppWsContext";
import "./NotificationBell.css";

const PANEL_WIDTH = 360;
const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 8;

type SourceFilter = "all" | NotificationSource;

interface NotificationBellProps {
  idTask?: number;
}

const SOURCE_LABEL: Record<NotificationSource, string> = {
  gtpp: "GTPP",
  // clpp: "CLPP",
};

const TYPE_ACCENT: Record<HubNotification["type"], string> = {
  success: "#198754",
  danger: "#dc3545",
  info: "#0d6efd",
  default: "#6c757d",
  warning: "#fd7e14",
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "agora";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  return `${d} d`;
}

export default function NotificationBell(props: NotificationBellProps): JSX.Element {
  const {
    notifications,
    unreadCount,
    unreadBySource,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotificationHub();

  const { getTask, setTask, setTaskPercent, setOpenCardDefault, task: currentTask, setPendingDeepLink, setCommentHighlightId } = useGtppWs();

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<SourceFilter>("all");
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Posiciona o painel via `position: fixed` no viewport, baseado no
   * rect do botão do sino. Necessário porque o card-task-container fica
   * dentro de uma coluna com overflow-y:auto / overflow-x:hidden — se
   * o painel ficasse posicionado relativo ao wrapper, seria clipado.
   */
  const computePosition = useCallback(() => {
    const trigger = wrapperRef.current?.querySelector<HTMLButtonElement>(".gipp-bell-trigger");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.right - PANEL_WIDTH;
    let top = rect.bottom + PANEL_GAP;
    // Não passa da borda direita
    if (left + PANEL_WIDTH > vw - VIEWPORT_MARGIN) left = vw - PANEL_WIDTH - VIEWPORT_MARGIN;
    // Não passa da borda esquerda
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    // Se cabe acima e o espaço abaixo está apertado, abre pra cima
    const spaceBelow = vh - rect.bottom;
    if (spaceBelow < 280 && rect.top > 280) {
      top = rect.top - PANEL_GAP - 280;
    }
    if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
    setPanelPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      const insideWrapper = wrapperRef.current?.contains(t);
      const insidePanel = panelRef.current?.contains(t);
      if (!insideWrapper && !insidePanel) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onResize() { computePosition(); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, computePosition]);

  const filtered = useMemo(() => {
    const base = props.idTask
      ? notifications.filter((n) => n.task_id === props.idTask)
      : notifications;
    const bySource = filter === "all" ? base : base.filter((n) => n.source === filter);
    return [...bySource].sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, props.idTask, filter]);

  const visibleUnread = useMemo(() => {
    if (props.idTask) {
      return notifications.filter(
        (n) => !n.read && n.task_id === props.idTask
      ).length;
    }
    return unreadCount;
  }, [notifications, props.idTask, unreadCount]);

  function openGtppTask(taskId: number, taskItemId?: number, commentId?: number): boolean {
    const found = getTask?.find((t) => Number(t.id) === Number(taskId));
    if (!found) return false;
    if (taskItemId) {
      setPendingDeepLink({ taskId: Number(taskId), taskItemId: Number(taskItemId) });
    }
    if (commentId) {
      setCommentHighlightId(Number(commentId));
    }
    if (Number(currentTask?.id) === Number(taskId)) {
      setOpenCardDefault(true);
      return true;
    }
    setTask(found);
    setTaskPercent(Number(found.percent ?? 0));
    setOpenCardDefault(true);
    return true;
  }

  function handleItemClick(n: HubNotification, e: React.MouseEvent) {
    e.stopPropagation();
    if (!n.read) markAsRead(n.id);

    if (n.source === "gtpp" && n.task_id) {
      const extra = (n.extra && typeof n.extra === "object" ? n.extra : {}) as {
        task_item_id?: unknown;
        comment_id?: unknown;
      };
      const taskItemId = extra.task_item_id != null ? Number(extra.task_item_id) : undefined;
      const commentId = extra.comment_id != null ? Number(extra.comment_id) : undefined;
      const opened = openGtppTask(n.task_id, taskItemId, commentId);
      if (opened) setOpen(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="gipp-bell-wrapper"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="gipp-bell-trigger"
        aria-label="Notificações"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i
          className="fa-solid fa-bell"
          style={{
            color: visibleUnread > 0 ? "#dc3545" : "#6c757d",
            transition: "color 0.2s",
          }}
        />
        {visibleUnread > 0 && (
          <span className="gipp-bell-badge">
            {visibleUnread > 99 ? "99+" : visibleUnread}
          </span>
        )}
      </button>

      {open && panelPos && ReactDOM.createPortal(
        <div
          ref={panelRef}
          className="gipp-bell-panel gipp-bell-panel--portal"
          role="dialog"
          aria-label="Notificações"
          style={{ top: panelPos.top, left: panelPos.left, width: PANEL_WIDTH }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <header className="gipp-bell-header">
            <div className="gipp-bell-title">Notificações</div>
            <div className="gipp-bell-actions">
              <button
                type="button"
                className="gipp-bell-link"
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
              >
                Marcar todas
              </button>
              <button
                type="button"
                className="gipp-bell-link gipp-bell-link-danger"
                onClick={() => clearAll()}
                disabled={notifications.length === 0}
              >
                Limpar
              </button>
            </div>
          </header>

          <div className="gipp-bell-tabs">
            {/* <button
              type="button"
              className={`gipp-bell-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todas {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            <button
              type="button"
              className={`gipp-bell-tab ${filter === "gtpp" ? "active" : ""}`}
              onClick={() => setFilter("gtpp")}
            >
              GTPP{" "}
              {unreadBySource.gtpp > 0 && <span>{unreadBySource.gtpp}</span>}
            </button> */}
          </div>

          <ul className="gipp-bell-list">
            {filtered.length === 0 ? (
              <li className="gipp-bell-empty">Sem notificações.</li>
            ) : (
              filtered.map((n) => (
                <li
                  key={n.id}
                  className={`gipp-bell-item ${n.read ? "read" : "unread"}`}
                  onClick={(e) => handleItemClick(n, e)}
                  style={{ borderLeftColor: TYPE_ACCENT[n.type] }}
                >
                  <div className="gipp-bell-item-head">
                    <span className={`gipp-bell-tag tag-${n.source}`}>
                      {SOURCE_LABEL[n.source]}
                    </span>
                    <span className="gipp-bell-time">
                      {formatRelative(n.timestamp)}
                    </span>
                    <button
                      type="button"
                      className="gipp-bell-close"
                      aria-label="Remover"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(n.id);
                      }}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                  <div className="gipp-bell-item-title">{n.title}</div>
                  {n.message && (
                    <div className="gipp-bell-item-msg">{n.message}</div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
