import React from "react";
import { useTour } from "../Context/TourContext";

/**
 * Feature gate — ativado nesta branch para demonstração com o chefe.
 * Se aprovado, o flag pode ser propagado para a main mantendo `true`.
 */
const TOUR_ENABLED = true;

export default function TourTrigger(): JSX.Element | null {
  const { open, hasSteps } = useTour();
  if (!TOUR_ENABLED) return null;
  if (!hasSteps) return null;
  return (
    <button
      type="button"
      onClick={open}
      title="Apresentação"
      className="d-flex bg-secondary align-items-center justify-content-center rounded p-1 mx-2 border-0"
      style={{ width: "38px", height: "30px", cursor: "pointer" }}
    >
      <i className="fa-solid fa-circle-info text-white h6 m-0" />
    </button>
  );
}
