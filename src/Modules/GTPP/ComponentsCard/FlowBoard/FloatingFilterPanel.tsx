import React from "react";

interface Props {
  panelRef: React.RefObject<HTMLDivElement>;
  dragging: boolean;
  panelPos: { top: number; left: number };
  onClose: () => void;
  onPanelMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPanelTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

export default function FloatingFilterPanel({
  panelRef, dragging, panelPos, onClose, onPanelMouseDown, onPanelTouchStart, children,
}: Props) {
  return (
    <div
      ref={panelRef}
      className={`gtpp-floating-filter${dragging ? " gtpp-floating-filter--dragging" : ""}`}
      style={{ top: panelPos.top, left: panelPos.left }}
      role="dialog"
      aria-label="Filtros do GTPP"
    >
      <div
        className="gtpp-floating-filter__header"
        onMouseDown={onPanelMouseDown}
        onTouchStart={onPanelTouchStart}
      >
        <span className="gtpp-floating-filter__handle" aria-hidden="true"></span>
        <div className="gtpp-floating-filter__title">
          <span className="gtpp-floating-filter__icon" aria-hidden="true">
            <i className="fa-solid fa-filter"></i>
          </span>
          <span>Filtros</span>
        </div>
        <button
          type="button"
          className="gtpp-floating-filter__close"
          onClick={onClose}
          aria-label="Fechar"
          title="Fechar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="gtpp-floating-filter__body">
        {children}
      </div>
    </div>
  );
}
