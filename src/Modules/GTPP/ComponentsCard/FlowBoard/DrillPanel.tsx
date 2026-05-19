import React, { useEffect, useRef, useState } from "react";
import { IGtppTaskSummary } from "../../Context/types/gtppTypes";
import { EmployeeInfo } from "../../Class/userLookupCache";
import { convertImage } from "../../../../Util/Utils";

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const HEADER_HEIGHT = 56;

export interface DrillPanelProps {
  kpiKey: string;
  title: string;
  icon: string;
  alert?: boolean;
  tasks: IGtppTaskSummary[];
  initialOffset: number; // stagger entre painéis
  userMap: Map<number, EmployeeInfo>;
  loadingUsers: boolean;
  onClose: () => void;
  onOpenTask: (task: IGtppTaskSummary) => void;
}

interface PanelRect { top: number; left: number; width: number; height: number; }

function initialRect(offset: number): PanelRect {
  const width = 360;
  const height = Math.min(window.innerHeight - 32, 600);
  const baseRight = 16;
  const left = Math.max(16, window.innerWidth - width - baseRight - offset * 30);
  const top = 16 + offset * 30;
  return { top, left, width, height };
}

export default function DrillPanel(props: DrillPanelProps): JSX.Element {
  const [rect, setRect] = useState<PanelRect>(() => initialRect(props.initialOffset));
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, initLeft: 0, initTop: 0 });
  const resizeStartRef = useRef({ startX: 0, startY: 0, initW: 0, initH: 0 });

  // === Drag (mouse + touch) ===
  useEffect(() => {
    if (!dragging) return;
    function move(clientX: number, clientY: number) {
      const el = panelRef.current;
      if (!el) return;
      const st = dragStartRef.current;
      const proposedLeft = st.initLeft + (clientX - st.startX);
      const proposedTop = st.initTop + (clientY - st.startY);
      const maxLeft = window.innerWidth - rect.width - 8;
      const maxTop = window.innerHeight - HEADER_HEIGHT;
      const clampedLeft = Math.max(8, Math.min(maxLeft, proposedLeft));
      const clampedTop = Math.max(8, Math.min(maxTop, proposedTop));
      const dx = clampedLeft - st.initLeft;
      const dy = clampedTop - st.initTop;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    function onMouseMove(e: MouseEvent) { move(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent) {
      if (!e.touches[0]) return;
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onEnd() {
      const el = panelRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        el.style.transform = "";
        setRect((p) => ({ ...p, top: r.top, left: r.left }));
      }
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragging, rect.width]);

  // === Resize (mouse + touch) ===
  useEffect(() => {
    if (!resizing) return;
    function move(clientX: number, clientY: number) {
      const st = resizeStartRef.current;
      const dx = clientX - st.startX;
      const dy = clientY - st.startY;
      const maxW = window.innerWidth - rect.left - 8;
      const maxH = window.innerHeight - rect.top - 8;
      const newW = Math.max(MIN_WIDTH, Math.min(maxW, st.initW + dx));
      const newH = Math.max(MIN_HEIGHT, Math.min(maxH, st.initH + dy));
      setRect((p) => ({ ...p, width: newW, height: newH }));
    }
    function onMouseMove(e: MouseEvent) { move(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent) {
      if (!e.touches[0]) return;
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onEnd() { setResizing(false); }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [resizing, rect.left, rect.top]);

  function startDrag(clientX: number, clientY: number, targetEl: HTMLElement) {
    if (targetEl.closest(".gtpp-drill-panel__close, .gtpp-drill-panel__minimize")) return;
    if (window.innerWidth <= 600) return;
    dragStartRef.current = {
      startX: clientX, startY: clientY,
      initLeft: rect.left, initTop: rect.top,
    };
    setDragging(true);
  }

  function startResize(clientX: number, clientY: number) {
    if (window.innerWidth <= 600) return;
    resizeStartRef.current = {
      startX: clientX, startY: clientY,
      initW: rect.width, initH: rect.height,
    };
    setResizing(true);
  }

  const showBody = !minimized;
  const computedHeight = minimized ? HEADER_HEIGHT : rect.height;

  return (
    <div
      ref={panelRef}
      className={[
        "gtpp-drill-panel",
        props.alert ? "gtpp-drill-panel--alert" : "",
        minimized ? "gtpp-drill-panel--minimized" : "",
        dragging ? "gtpp-drill-panel--dragging" : "",
        resizing ? "gtpp-drill-panel--resizing" : "",
      ].join(" ").trim()}
      style={{ top: rect.top, left: rect.left, width: rect.width, height: computedHeight }}
      role="dialog"
      aria-label={props.title}
    >
      <header
        className="gtpp-drill-panel__header"
        onMouseDown={(e) => startDrag(e.clientX, e.clientY, e.target as HTMLElement)}
        onTouchStart={(e) => {
          if (!e.touches[0]) return;
          startDrag(e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
        }}
      >
        <div className="gtpp-drill-panel__title">
          <span className="gtpp-drill-panel__icon" aria-hidden="true">
            <i className={`fa-solid ${props.icon}`}></i>
          </span>
          <div className="d-flex flex-column" style={{ lineHeight: 1.1 }}>
            <span className="gtpp-drill-panel__heading">{props.title}</span>
            <small className="gtpp-drill-panel__count">
              {props.tasks.length} tarefa{props.tasks.length === 1 ? "" : "s"}
            </small>
          </div>
        </div>
        <div className="gtpp-drill-panel__actions">
          <button
            type="button"
            className="gtpp-drill-panel__minimize"
            onClick={() => setMinimized((v) => !v)}
            aria-label={minimized ? "Expandir" : "Minimizar"}
            title={minimized ? "Expandir" : "Minimizar"}
          >
            <i className={`fa-solid ${minimized ? "fa-window-maximize" : "fa-window-minimize"}`}></i>
          </button>
          <button
            type="button"
            className="gtpp-drill-panel__close"
            onClick={props.onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </header>
      {showBody && (
        <>
          <ul className="gtpp-drill-panel__list">
            {props.tasks.length === 0 ? (
              <li className="gtpp-drill-panel__empty">Nenhuma tarefa nessa categoria.</li>
            ) : (
              props.tasks.map((t) => {
                const pct = Number(t.percent ?? 0);
                const overdue = !!t.final_date && new Date(t.final_date) < new Date(new Date().setHours(0, 0, 0, 0));
                const user = t.user_id ? props.userMap.get(Number(t.user_id)) : undefined;
                const photoSrc = user?.photo ? convertImage(user.photo) : "";
                const userName = user?.name || (t.user_id ? `#${t.user_id}` : "Sem responsável");
                const initials = (user?.name || "?").trim().slice(0, 1).toUpperCase();
                return (
                  <li
                    key={t.id}
                    className="gtpp-drill-panel__item"
                    onClick={() => props.onOpenTask(t)}
                  >
                    <div className="gtpp-drill-panel__item-row">
                      <div className="gtpp-drill-panel__avatar" title={userName}>
                        {photoSrc ? (
                          <img src={photoSrc} alt={userName} />
                        ) : (
                          <span className={t.user_id ? "" : "is-empty"}>{t.user_id ? initials : "?"}</span>
                        )}
                      </div>
                      <div className="gtpp-drill-panel__item-main">
                        <div className="gtpp-drill-panel__item-head">
                          <span className="gtpp-drill-panel__item-id">#{t.id}</span>
                          {t.final_date && (
                            <span className={`gtpp-drill-panel__item-date${overdue && pct < 100 ? " is-overdue" : ""}`}>
                              {new Date(t.final_date).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                        <div className="gtpp-drill-panel__item-title">
                          {t.description || "Sem descrição"}
                        </div>
                        <div className="gtpp-drill-panel__item-foot">
                          <span className="gtpp-drill-panel__item-user">
                            {props.loadingUsers && !user ? "Carregando..." : userName}
                          </span>
                          <div className="gtpp-drill-panel__bar">
                            <div className="gtpp-drill-panel__bar-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="gtpp-drill-panel__pct">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          <span
            className="gtpp-drill-panel__resize-handle"
            onMouseDown={(e) => { e.stopPropagation(); startResize(e.clientX, e.clientY); }}
            onTouchStart={(e) => {
              if (!e.touches[0]) return;
              e.stopPropagation();
              startResize(e.touches[0].clientX, e.touches[0].clientY);
            }}
            aria-hidden="true"
            title="Redimensionar"
          />
        </>
      )}
    </div>
  );
}
