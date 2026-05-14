import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./ProductTour.css";

export interface TourStep {
  selector: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  setup?: () => void;
}

interface ProductTourProps {
  open: boolean;
  steps: TourStep[];
  onClose: () => void;
  startIndex?: number;
  spotlightPadding?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const VIEWPORT_MARGIN = 12;
const BALLOON_GAP = 14;
const BALLOON_WIDTH = 340;
const BALLOON_MAX_HEIGHT = 320;

function getElementRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function pickPlacement(target: Rect, preferred?: TourStep["placement"]): "top" | "bottom" | "left" | "right" {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const space = {
    top: target.top,
    bottom: vh - (target.top + target.height),
    left: target.left,
    right: vw - (target.left + target.width),
  };

  if (preferred && preferred !== "auto") {
    const need = preferred === "top" || preferred === "bottom" ? 200 : BALLOON_WIDTH + 40;
    if (space[preferred] >= need) return preferred;
  }
  const order: Array<"bottom" | "top" | "right" | "left"> = ["bottom", "top", "right", "left"];
  return order.reduce((best, side) => (space[side] > space[best] ? side : best), "bottom");
}

function computeBalloonPosition(target: Rect, placement: "top" | "bottom" | "left" | "right"): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0;
  let left = 0;
  switch (placement) {
    case "bottom":
      top = target.top + target.height + BALLOON_GAP;
      left = target.left + target.width / 2 - BALLOON_WIDTH / 2;
      break;
    case "top":
      top = target.top - BALLOON_GAP - BALLOON_MAX_HEIGHT;
      left = target.left + target.width / 2 - BALLOON_WIDTH / 2;
      break;
    case "right":
      top = target.top + target.height / 2 - 60;
      left = target.left + target.width + BALLOON_GAP;
      break;
    case "left":
      top = target.top + target.height / 2 - 60;
      left = target.left - BALLOON_GAP - BALLOON_WIDTH;
      break;
  }
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - BALLOON_WIDTH - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - 140 - VIEWPORT_MARGIN));
  return { top, left };
}

export default function ProductTour({ open, steps, onClose, startIndex = 0, spotlightPadding = 8 }: ProductTourProps): JSX.Element | null {
  const [index, setIndex] = useState<number>(startIndex);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const rafRef = useRef<number | null>(null);

  const total = steps.length;
  const step = steps[index];

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  const measure = useCallback(() => {
    if (!open || !step) return;
    try { step.setup?.(); } catch { /* setup é cosmético, não trava o tour */ }
    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = getElementRect(el);
      if (rect.width < 1 && rect.height < 1) {
        // elemento provavelmente em collapse fechado — tenta novamente depois do reflow
        setTimeout(() => {
          const again = getElementRect(el);
          setTargetRect(again);
          setPlacement(pickPlacement(again, step.placement));
        }, 250);
        return;
      }
      setTargetRect(rect);
      setPlacement(pickPlacement(rect, step.placement));
    });
  }, [open, step]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const interval = window.setInterval(measure, 600);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.clearInterval(interval);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, total - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, total]);

  const balloonPos = useMemo(() => {
    if (!targetRect) return null;
    return computeBalloonPosition(
      {
        top: targetRect.top - spotlightPadding,
        left: targetRect.left - spotlightPadding,
        width: targetRect.width + spotlightPadding * 2,
        height: targetRect.height + spotlightPadding * 2,
      },
      placement
    );
  }, [targetRect, placement, spotlightPadding]);

  if (!open || total === 0 || !step) return null;

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => {
    if (index >= total - 1) onClose();
    else setIndex((i) => Math.min(total - 1, i + 1));
  };

  return (
    <div className="gipp-tour-root" role="dialog" aria-modal="true">
      <div className="gipp-tour-backdrop" onClick={onClose} />
      {targetRect && (
        <div
          className="gipp-tour-spotlight"
          style={{
            top: targetRect.top - spotlightPadding,
            left: targetRect.left - spotlightPadding,
            width: targetRect.width + spotlightPadding * 2,
            height: targetRect.height + spotlightPadding * 2,
          }}
        />
      )}
      {balloonPos && (
        <div
          className={`gipp-tour-balloon gipp-tour-balloon-${placement}`}
          style={{ top: balloonPos.top, left: balloonPos.left, width: BALLOON_WIDTH }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="gipp-tour-balloon-head">
            <span className="gipp-tour-counter">
              {index + 1} / {total}
            </span>
            <button type="button" className="gipp-tour-close" onClick={onClose} aria-label="Fechar tour">
              <i className="fa-solid fa-xmark" />
            </button>
          </header>
          <h5 className="gipp-tour-title">{step.title}</h5>
          <p className="gipp-tour-body">{step.body}</p>
          <footer className="gipp-tour-footer">
            <button
              type="button"
              className="gipp-tour-arrow"
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="Anterior"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
            <div className="gipp-tour-dots">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`gipp-tour-dot ${i === index ? "active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="gipp-tour-arrow primary"
              onClick={handleNext}
              aria-label={index >= total - 1 ? "Finalizar" : "Próximo"}
            >
              {index >= total - 1 ? (
                <i className="fa-solid fa-check" />
              ) : (
                <i className="fa-solid fa-arrow-right" />
              )}
            </button>
          </footer>
        </div>
      )}
      {!targetRect && (
        <div className="gipp-tour-missing" onClick={(e) => e.stopPropagation()}>
          <p>Não consegui encontrar este elemento na tela.</p>
          <div className="gipp-tour-missing-actions">
            <button type="button" onClick={handlePrev} disabled={index === 0}>
              <i className="fa-solid fa-arrow-left" /> Voltar
            </button>
            <button type="button" onClick={handleNext}>
              Pular <i className="fa-solid fa-arrow-right" />
            </button>
            <button type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
