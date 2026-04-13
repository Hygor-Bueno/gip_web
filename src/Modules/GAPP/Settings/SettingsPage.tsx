import React, { useState } from "react";
import ActiveConfigPage from "./ActiveConfig/ActiveConfigPage";
import OrgConfigPage from "./OrgConfig/OrgConfigPage";
import { useSettingsData } from "./Hooks/useSettingsData";
import "./SettingsPage.css";

interface Props {
  onToggleNav?: () => void;
  navHidden?:   boolean;
}

const PAGES = [
  { key: 0, label: "Configuração de Ativos", icon: "fa fa-cube" },
  { key: 1, label: "Organização",            icon: "fa fa-sitemap" },
];

export default function SettingsPage({ onToggleNav, navHidden }: Props) {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    loading, loadError, loadAll, gappWorkGroupId,
    activeTypes,     setActiveTypes,
    activeClasses,   setActiveClasses,
    companies,       setCompanies,
    units,           setUnits,
    departaments,    setDepartaments,
    subdepartaments, setSubdepartaments,
  } = useSettingsData();

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center h-100 w-100">
      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Carregando configurações...</span>
    </div>
  );

  if (loadError) return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 gap-2">
      <i className="fa fa-exclamation-triangle fa-2x" style={{ color: "#dc2626" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>{loadError}</span>
      <button className="settings-btn-reload" onClick={loadAll}>
        <i className="fa fa-refresh" /> Tentar novamente
      </button>
    </div>
  );

  const pages = [
    <ActiveConfigPage
      activeTypes={activeTypes}
      activeClasses={activeClasses}
      setActiveTypes={setActiveTypes}
      setActiveClasses={setActiveClasses}
      gappWorkGroupId={gappWorkGroupId}
    />,
    <OrgConfigPage
      companies={companies}
      units={units}
      departaments={departaments}
      subdepartaments={subdepartaments}
      setCompanies={setCompanies}
      setUnits={setUnits}
      setDepartaments={setDepartaments}
      setSubdepartaments={setSubdepartaments}
    />,
  ];

  return (
    <div className="settings-root">

      {/* ── Toolbar ── */}
      <div className="settings-toolbar">
        <div className="settings-toolbar-title">
          <div className="settings-toolbar-title-icon">
            <i className="fa fa-cog" />
          </div>
          <div>
            <p className="settings-toolbar-title-text">Configurações</p>
            <p className="settings-toolbar-title-sub">Gerencie tipos, classificações e organização</p>
          </div>
        </div>
        <div className="settings-toolbar-actions">
          {onToggleNav && (
            <button
              className="settings-btn-nav-toggle"
              onClick={onToggleNav}
              title={navHidden ? "Mostrar menu de navegação" : "Ocultar menu de navegação"}
            >
              <i className={`fa ${navHidden ? "fa-bars" : "fa-indent"}`} />
            </button>
          )}
          <button className="settings-btn-reload" onClick={loadAll} title="Recarregar dados">
            <i className="fa fa-refresh" />
            <span className="settings-btn-reload-label">Recarregar</span>
          </button>
        </div>
      </div>

      {/* ── Main page tabs ── */}
      <div className="settings-page-tabs">
        {PAGES.map(p => (
          <button
            key={p.key}
            className={`settings-page-tab${currentPage === p.key ? " active" : ""}`}
            onClick={() => setCurrentPage(p.key)}
          >
            <i className={p.icon} />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Page content ── */}
      <div className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
        {pages[currentPage]}
      </div>

    </div>
  );
}
