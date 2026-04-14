import React, { useState, useCallback } from "react";
import MovementForm from "./Components/MovementForm/MovementForm";
import MovementHistory from "./Components/MovementHistory/MovementHistory";
import { useMovementData } from "./Hooks/useMovementData";
import "./MovementPage.css";

interface Props {
  onToggleNav?: () => void;
  navHidden?:   boolean;
}

const PAGES = [
  { key: 0, label: "Nova Movimentação", icon: "fa fa-exchange" },
  { key: 1, label: "Histórico",         icon: "fa fa-history"  },
];

export default function MovementPage({ onToggleNav, navHidden }: Props) {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    loading, loadError, loadAll,
    actives,
    units,
    movimentations, setMovimentations,
  } = useMovementData();

  // After a successful movement: reload data + switch to history tab
  const handleSuccess = useCallback(async () => {
    await loadAll();
    setCurrentPage(1);
  }, [loadAll]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center h-100 w-100">
      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
        Carregando movimentações...
      </span>
    </div>
  );

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadError) return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 gap-2">
      <i className="fa fa-exclamation-triangle fa-2x" style={{ color: "#dc2626" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>
        {loadError}
      </span>
      <button className="mv-btn-reload" onClick={loadAll}>
        <i className="fa fa-refresh" /> Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="mv-root">

      {/* ── Toolbar ── */}
      <div className="mv-toolbar">
        <div className="mv-toolbar-title">
          <div className="mv-toolbar-title-icon">
            <i className="fa fa-exchange" />
          </div>
          <div>
            <p className="mv-toolbar-title-text">Movimentações</p>
            <p className="mv-toolbar-title-sub">
              Registre e acompanhe movimentações de ativos
            </p>
          </div>
        </div>
        <div className="mv-toolbar-actions">
          {onToggleNav && (
            <button
              className="mv-btn-nav-toggle"
              onClick={onToggleNav}
              title={navHidden ? "Mostrar menu de navegação" : "Ocultar menu de navegação"}
            >
              <i className={`fa ${navHidden ? "fa-bars" : "fa-indent"}`} />
            </button>
          )}
          <button className="mv-btn-reload" onClick={loadAll} title="Recarregar dados">
            <i className="fa fa-refresh" />
            <span className="mv-btn-reload-label">Recarregar</span>
          </button>
        </div>
      </div>

      {/* ── Main tabs ── */}
      <div className="mv-page-tabs">
        {PAGES.map(p => (
          <button
            key={p.key}
            className={`mv-page-tab${currentPage === p.key ? " active" : ""}`}
            onClick={() => setCurrentPage(p.key)}
          >
            <i className={p.icon} />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="mv-content">
        {currentPage === 0 ? (
          <MovementForm
            actives={actives}
            units={units}
            onSuccess={handleSuccess}
          />
        ) : (
          <MovementHistory
            movimentations={movimentations}
            setMovimentations={setMovimentations}
          />
        )}
      </div>

    </div>
  );
}
