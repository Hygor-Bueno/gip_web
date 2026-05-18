import React, { useEffect, useId, useRef } from "react";
import "./MinimalFilterModel.css";

// ─── Singleton de "filtro ativo" ─────────────────────────────────────
//
// Cada instância de MinimalFilterModel se anuncia ao montar; se outra
// instância anunciava antes, a anterior recebe `onClose()` e some.
// Garante que só um painel fica aberto por vez sem precisar lift state
// para um pai comum.

type CloseFn = () => void;
const openInstances: Map<string, CloseFn> = new Map();

function registerOpen(id: string, close: CloseFn): void {
  // Fecha todas as outras antes de adicionar a nova
  openInstances.forEach((closeOther, otherId) => {
    if (otherId !== id) closeOther();
  });
  openInstances.clear();
  openInstances.set(id, close);
}

function unregister(id: string): void {
  openInstances.delete(id);
}

// ─── Componente ──────────────────────────────────────────────────────

interface MinimalFilterModelProps {
  children: React.ReactNode;
  /** Chamado quando o usuário clica fora ou outro filtro toma a vez. */
  onClose?: () => void;
  /** Título exibido no header do painel. */
  title?: string;
}

const MinimalFilterModel: React.FC<MinimalFilterModelProps> = ({
  children,
  onClose,
  title = "Filtros",
}) => {
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClose) return;
    registerOpen(instanceId, onClose);

    function onDocMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);

    return () => {
      unregister(instanceId);
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [instanceId, onClose]);

  return (
    <div
      ref={panelRef}
      className="gipp-min-filter"
      role="dialog"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="gipp-min-filter__header">
        <div className="gipp-min-filter__title">
          <i className="fa fa-filter" />
          <span>{title}</span>
        </div>
      </header>
      <div className="gipp-min-filter__body">{children}</div>
    </div>
  );
};

export default MinimalFilterModel;
