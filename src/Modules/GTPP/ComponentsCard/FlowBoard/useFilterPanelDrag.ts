import React, { useEffect, useRef, useState } from "react";

export function useFilterPanelDrag() {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; initLeft: number; initTop: number; width: number }>({
    startX: 0, startY: 0, initLeft: 0, initTop: 0, width: 0,
  });

  useEffect(() => {
    if (!dragging) return;
    function move(clientX: number, clientY: number) {
      const el = panelRef.current;
      if (!el) return;
      const st = dragStateRef.current;
      const proposedLeft = st.initLeft + (clientX - st.startX);
      const proposedTop = st.initTop + (clientY - st.startY);
      const maxLeft = window.innerWidth - st.width - 8;
      const maxTop = window.innerHeight - 80;
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
        const rect = el.getBoundingClientRect();
        el.style.transform = "";
        setPanelPos({ top: rect.top, left: rect.left });
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
  }, [dragging]);

  function startDrag(clientX: number, clientY: number, panelEl: HTMLElement, targetEl: HTMLElement) {
    if (targetEl.closest(".gtpp-floating-filter__close")) return;
    if (window.innerWidth <= 600) return;
    const rect = panelEl.getBoundingClientRect();
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      initLeft: rect.left,
      initTop: rect.top,
      width: rect.width,
    };
    if (!panelPos) setPanelPos({ top: rect.top, left: rect.left });
    setDragging(true);
  }

  function onPanelMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    startDrag(e.clientX, e.clientY, e.currentTarget.parentElement!, e.target as HTMLElement);
  }

  function onPanelTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!e.touches[0]) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.parentElement!, e.target as HTMLElement);
  }

  function openFilterPanel() {
    if (!panelPos) {
      const w = 360;
      const isMobile = window.innerWidth <= 600;
      setPanelPos(
        isMobile
          ? { top: 0, left: 0 }
          : { top: 90, left: Math.max(16, window.innerWidth - w - 32) }
      );
    }
    setFilterPanelOpen(true);
  }

  return {
    filterPanelOpen, setFilterPanelOpen,
    panelPos, dragging, panelRef,
    onPanelMouseDown, onPanelTouchStart,
    openFilterPanel,
  };
}
