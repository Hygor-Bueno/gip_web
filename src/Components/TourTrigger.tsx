import React from "react";
import { useTour } from "../Context/TourContext";

/**
 * Feature gate — botão de tour desativado até a feature ser liberada.
 * Para reativar: troque para `true`. Toda a engenharia do tour fica
 * intacta e os steps continuam registrados; só o ponto de entrada some.
 */
const TOUR_ENABLED = false;

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
