import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./ProductTour.css";

export interface TourStep {
  selector: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  setup?: () => void;
  /** Grupo de primeiro nível na árvore lateral. */
  category?: string;
  /** Subgrupo opcional (segundo nível na árvore). */
  subcategory?: string;
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
const PANEL_GAP = 14;
const PANEL_WIDTH = 620;
const PANEL_MAX_HEIGHT = 460;
const DEFAULT_CATEGORY = "Geral";

function getElementRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/**
 * Posiciona o painel grande (com sidebar) em relação ao spotlight.
 * Tenta encaixar nos 4 lados e cai no canto inferior-direito como fallback.
 */
function computePanelPosition(target: Rect | null): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fallbackLeft = vw - PANEL_WIDTH - VIEWPORT_MARGIN;
  const fallbackTop = vh - PANEL_MAX_HEIGHT - VIEWPORT_MARGIN;

  if (!target) return { top: Math.max(VIEWPORT_MARGIN, fallbackTop), left: Math.max(VIEWPORT_MARGIN, fallbackLeft) };

  const candidates: Array<{ top: number; left: number; score: number }> = [];

  // Direita do alvo
  candidates.push({
    top: clamp(target.top, VIEWPORT_MARGIN, vh - PANEL_MAX_HEIGHT - VIEWPORT_MARGIN),
    left: target.left + target.width + PANEL_GAP,
    score: vw - (target.left + target.width + PANEL_GAP) - PANEL_WIDTH,
  });

  // Esquerda do alvo
  candidates.push({
    top: clamp(target.top, VIEWPORT_MARGIN, vh - PANEL_MAX_HEIGHT - VIEWPORT_MARGIN),
    left: target.left - PANEL_GAP - PANEL_WIDTH,
    score: target.left - PANEL_GAP - PANEL_WIDTH,
  });

  // Embaixo
  candidates.push({
    top: target.top + target.height + PANEL_GAP,
    left: clamp(target.left, VIEWPORT_MARGIN, vw - PANEL_WIDTH - VIEWPORT_MARGIN),
    score: vh - (target.top + target.height + PANEL_GAP) - PANEL_MAX_HEIGHT,
  });

  // Acima
  candidates.push({
    top: target.top - PANEL_GAP - PANEL_MAX_HEIGHT,
    left: clamp(target.left, VIEWPORT_MARGIN, vw - PANEL_WIDTH - VIEWPORT_MARGIN),
    score: target.top - PANEL_GAP - PANEL_MAX_HEIGHT,
  });

  // O melhor é o que sobra mais "score" positivo
  const ok = candidates.filter((c) => c.score >= 0 && c.left >= VIEWPORT_MARGIN && c.top >= VIEWPORT_MARGIN);
  if (ok.length) {
    const best = ok.reduce((a, b) => (a.score > b.score ? a : b));
    return { top: best.top, left: best.left };
  }

  // Não cabe ao lado — usa o canto inferior-direito fixo
  return { top: Math.max(VIEWPORT_MARGIN, fallbackTop), left: Math.max(VIEWPORT_MARGIN, fallbackLeft) };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Agrupa os steps em uma árvore de 2 níveis: category → subcategory → steps[].
 * Steps sem category ficam em DEFAULT_CATEGORY; sem subcategory ficam soltos
 * no nível da categoria.
 */
interface TreeNode {
  category: string;
  steps: Array<{ step: TourStep; index: number }>;
  subgroups: Array<{
    subcategory: string;
    steps: Array<{ step: TourStep; index: number }>;
  }>;
}

function buildTree(steps: TourStep[]): TreeNode[] {
  const byCat: Map<string, TreeNode> = new Map();
  steps.forEach((step, index) => {
    const cat = step.category || DEFAULT_CATEGORY;
    if (!byCat.has(cat)) byCat.set(cat, { category: cat, steps: [], subgroups: [] });
    const node = byCat.get(cat)!;
    if (step.subcategory) {
      let sub = node.subgroups.find((g) => g.subcategory === step.subcategory);
      if (!sub) {
        sub = { subcategory: step.subcategory, steps: [] };
        node.subgroups.push(sub);
      }
      sub.steps.push({ step, index });
    } else {
      node.steps.push({ step, index });
    }
  });
  return Array.from(byCat.values());
}

export default function ProductTour({ open, steps, onClose, startIndex = 0, spotlightPadding = 8 }: ProductTourProps): JSX.Element | null {
  const [index, setIndex] = useState<number>(startIndex);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);

  const total = steps.length;
  const step = steps[index];
  const tree = useMemo(() => buildTree(steps), [steps]);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  const measure = useCallback(() => {
    if (!open || !step) return;
    try { step.setup?.(); } catch { /* setup é cosmético */ }
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
        setTimeout(() => {
          const again = getElementRect(el);
          setTargetRect(again);
        }, 250);
        return;
      }
      setTargetRect(rect);
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
      // Esc NÃO fecha o tour — só o botão X. Pedido do Jonatas.
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, total - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, total]);

  const panelPos = useMemo(() => computePanelPosition(targetRect), [targetRect]);

  if (!open || total === 0 || !step) return null;

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => {
    if (index >= total - 1) onClose();
    else setIndex((i) => Math.min(total - 1, i + 1));
  };
  const goTo = (i: number) => setIndex(i);

  return (
    <div className="gipp-tour-root" role="dialog" aria-modal="true">
      {/* Backdrop sem onClick — pedido do Jonatas: fecha só pelo X */}
      <div className="gipp-tour-backdrop" />
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
      <div
        className="gipp-tour-panel"
        style={{ top: panelPos.top, left: panelPos.left, width: PANEL_WIDTH, maxHeight: PANEL_MAX_HEIGHT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cabeçalho ───────────────────────────────────────────── */}
        <header className="gipp-tour-panel__head">
          <div className="gipp-tour-panel__title-row">
            <i className="fa-solid fa-book gipp-tour-panel__icon" />
            <h5 className="gipp-tour-panel__title">Apresentação do GTPP</h5>
          </div>
          <div className="gipp-tour-panel__head-meta">
            <span className="gipp-tour-counter">
              {index + 1} / {total}
            </span>
            <button type="button" className="gipp-tour-close" onClick={onClose} aria-label="Fechar tour" title="Fechar">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </header>

        <div className="gipp-tour-panel__body">
          {/* ── Sidebar (árvore) ─────────────────────────────────── */}
          <aside className="gipp-tour-tree">
            {tree.map((node) => (
              <div key={node.category} className="gipp-tour-tree__group">
                <div className="gipp-tour-tree__group-title">{node.category}</div>
                <ul className="gipp-tour-tree__list">
                  {node.steps.map(({ step: s, index: i }) => (
                    <li
                      key={i}
                      className={`gipp-tour-tree__item ${i === index ? "active" : ""}`}
                      onClick={() => goTo(i)}
                      title={s.title}
                    >
                      <span className="gipp-tour-tree__bullet" /> {s.title}
                    </li>
                  ))}
                  {node.subgroups.map((sub) => (
                    <li key={sub.subcategory} className="gipp-tour-tree__subgroup">
                      <div className="gipp-tour-tree__subgroup-title">{sub.subcategory}</div>
                      <ul className="gipp-tour-tree__list gipp-tour-tree__list--nested">
                        {sub.steps.map(({ step: s, index: i }) => (
                          <li
                            key={i}
                            className={`gipp-tour-tree__item ${i === index ? "active" : ""}`}
                            onClick={() => goTo(i)}
                            title={s.title}
                          >
                            <span className="gipp-tour-tree__bullet" /> {s.title}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* ── Conteúdo do step atual ───────────────────────────── */}
          <section className="gipp-tour-content">
            {step.category && (
              <div className="gipp-tour-content__crumbs">
                {step.category}
                {step.subcategory && <> <i className="fa-solid fa-angle-right" /> {step.subcategory}</>}
              </div>
            )}
            <h4 className="gipp-tour-content__title">{step.title}</h4>
            <p className="gipp-tour-content__body">{step.body}</p>
            {!targetRect && (
              <div className="gipp-tour-content__missing">
                <i className="fa-solid fa-triangle-exclamation" /> Este elemento não está visível na tela
                no momento. Use a árvore para pular para outro tópico ou avance pelas setas.
              </div>
            )}
            <footer className="gipp-tour-content__footer">
              <button
                type="button"
                className="gipp-tour-arrow"
                onClick={handlePrev}
                disabled={index === 0}
                aria-label="Anterior"
                title="Anterior"
              >
                <i className="fa-solid fa-arrow-left" /> Anterior
              </button>
              <button
                type="button"
                className="gipp-tour-arrow primary"
                onClick={handleNext}
                aria-label={index >= total - 1 ? "Finalizar" : "Próximo"}
                title={index >= total - 1 ? "Finalizar" : "Próximo"}
              >
                {index >= total - 1 ? (
                  <>Finalizar <i className="fa-solid fa-check" /></>
                ) : (
                  <>Próximo <i className="fa-solid fa-arrow-right" /></>
                )}
              </button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
