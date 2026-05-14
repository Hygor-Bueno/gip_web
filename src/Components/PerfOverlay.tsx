import React, { useEffect, useRef, useState } from "react";

interface PerfStats {
  fps: number;
  longTasks: number;
  domNodes: number;
  jsHeapMB: number | null;
  navStart: number;
  domContentLoadedMs: number | null;
  loadCompleteMs: number | null;
  lastFetchMs: number | null;
  lastWsRoundTripMs: number | null;
  rendersPerSec: number;
}

declare global {
  interface Window {
    __gippPerf?: {
      lastFetchMs: number | null;
      lastWsRoundTripMs: number | null;
      markFetch: (ms: number) => void;
      markWs: (ms: number) => void;
      bumpRender: () => void;
    };
  }
}

function ensureGlobalHook(setStats: (fn: (s: PerfStats) => PerfStats) => void) {
  if (window.__gippPerf) return window.__gippPerf;
  const api = {
    lastFetchMs: null as number | null,
    lastWsRoundTripMs: null as number | null,
    markFetch(ms: number) {
      api.lastFetchMs = ms;
      setStats((s) => ({ ...s, lastFetchMs: ms }));
    },
    markWs(ms: number) {
      api.lastWsRoundTripMs = ms;
      setStats((s) => ({ ...s, lastWsRoundTripMs: ms }));
    },
    bumpRender() {
      // counter increment is handled via ref in component
      const ev = new CustomEvent("perf:render");
      window.dispatchEvent(ev);
    },
  };
  window.__gippPerf = api;
  return api;
}

export default function PerfOverlay(): JSX.Element | null {
  if (process.env.NODE_ENV !== "development") return null;

  const [visible, setVisible] = useState<boolean>(() => {
    return localStorage.getItem("gipp_perf_overlay") !== "hidden";
  });
  const [stats, setStats] = useState<PerfStats>(() => ({
    fps: 0,
    longTasks: 0,
    domNodes: 0,
    jsHeapMB: null,
    navStart: performance.timing?.navigationStart ?? performance.timeOrigin ?? 0,
    domContentLoadedMs: null,
    loadCompleteMs: null,
    lastFetchMs: null,
    lastWsRoundTripMs: null,
    rendersPerSec: 0,
  }));
  const renderCount = useRef(0);

  useEffect(() => {
    ensureGlobalHook(setStats);

    const onRender = () => {
      renderCount.current += 1;
    };
    window.addEventListener("perf:render", onRender);
    return () => window.removeEventListener("perf:render", onRender);
  }, []);

  useEffect(() => {
    if (!visible) return;

    let frames = 0;
    let raf = 0;
    let lastTick = performance.now();
    let longTasks = 0;
    let lastRenders = 0;

    function tick() {
      frames++;
      const now = performance.now();
      if (now - lastTick >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTick));
        const rendersPerSec = renderCount.current - lastRenders;
        lastRenders = renderCount.current;
        frames = 0;
        lastTick = now;
        const memMB = (performance as any).memory?.usedJSHeapSize
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : null;
        const nav = performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined;
        setStats((s) => ({
          ...s,
          fps,
          rendersPerSec,
          domNodes: document.getElementsByTagName("*").length,
          jsHeapMB: memMB,
          longTasks,
          domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
          loadCompleteMs: nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
        }));
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        longTasks += list.getEntries().length;
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      /* longtask não suportado */
    }

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [visible]);

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("gipp_perf_overlay");
          setVisible(true);
        }}
        style={{
          position: "fixed",
          bottom: 8,
          right: 8,
          zIndex: 99999,
          padding: "4px 8px",
          fontSize: 11,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        perf
      </button>
    );
  }

  const fpsColor = stats.fps >= 50 ? "#7CFC00" : stats.fps >= 30 ? "#FFD700" : "#FF6B6B";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(15, 15, 20, 0.92)",
        color: "#e9ecef",
        font: "11px/1.35 ui-monospace, 'SFMono-Regular', Menlo, monospace",
        padding: "8px 10px",
        borderRadius: 6,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        minWidth: 180,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <strong style={{ letterSpacing: 0.5 }}>PERF</strong>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("gipp_perf_overlay", "hidden");
            setVisible(false);
          }}
          style={{
            background: "transparent",
            color: "#adb5bd",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
            marginLeft: 8,
          }}
          aria-label="Esconder"
        >
          ×
        </button>
      </div>
      <Row label="FPS" value={`${stats.fps}`} valueColor={fpsColor} />
      <Row label="Renders/s" value={`${stats.rendersPerSec}`} />
      <Row label="Long tasks" value={`${stats.longTasks}`} />
      <Row label="DOM nodes" value={`${stats.domNodes}`} />
      <Row
        label="Heap"
        value={stats.jsHeapMB != null ? `${stats.jsHeapMB} MB` : "—"}
      />
      <Row
        label="DCL"
        value={
          stats.domContentLoadedMs != null
            ? `${stats.domContentLoadedMs} ms`
            : "—"
        }
      />
      <Row
        label="Load"
        value={
          stats.loadCompleteMs != null ? `${stats.loadCompleteMs} ms` : "—"
        }
      />
      <Row
        label="Fetch"
        value={
          stats.lastFetchMs != null ? `${stats.lastFetchMs} ms` : "—"
        }
      />
      <Row
        label="WS RTT"
        value={
          stats.lastWsRoundTripMs != null
            ? `${stats.lastWsRoundTripMs} ms`
            : "—"
        }
      />
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#adb5bd" }}>{label}</span>
      <span style={{ color: valueColor ?? "#e9ecef" }}>{value}</span>
    </div>
  );
}
