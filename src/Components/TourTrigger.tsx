import React from "react";
import { useTour } from "../Context/TourContext";

/**
 * Feature gate — ativado nesta branch para demonstração com o chefe.
 * Se aprovado, o flag pode ser propagado para a main mantendo `true`.
 */
const TOUR_ENABLED = true;

export default function TourTrigger(): JSX.Element | null {
  const { tours, open } = useTour();
  if (!TOUR_ENABLED) return null;
  const visible = tours.filter((t) => t.steps.length > 0);
  if (!visible.length) return null;
  return (
    <div className="d-flex align-items-center gap-2">
      {visible.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => open(t.id)}
          title={t.label}
          className="d-flex bg-secondary align-items-center justify-content-center rounded p-1 px-2 mx-0 border-0 gap-1"
          style={{ height: "30px", cursor: "pointer" }}
        >
          <i className={`${t.icon} text-white`} style={{ fontSize: "0.85rem" }} />
          <span className="text-white d-none d-md-inline" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}
