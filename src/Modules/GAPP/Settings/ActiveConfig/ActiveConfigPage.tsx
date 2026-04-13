import React, { useState } from "react";
import ActiveTypeTab from "./ActiveTypeTab";
import ActiveClassTab from "./ActiveClassTab";
import { ActiveClass, ActiveType } from "../Interfaces/SettingsInterfaces";

interface Props {
  activeTypes:      ActiveType[];
  activeClasses:    ActiveClass[];
  setActiveTypes:   React.Dispatch<React.SetStateAction<ActiveType[]>>;
  setActiveClasses: React.Dispatch<React.SetStateAction<ActiveClass[]>>;
  gappWorkGroupId:  number | null;
}

const SUB_TABS = [
  { key: 0, label: "Tipos de Ativo",      icon: "fa fa-tag" },
  { key: 1, label: "Classificações",      icon: "fa fa-list" },
];

export default function ActiveConfigPage({
  activeTypes, activeClasses,
  setActiveTypes, setActiveClasses,
  gappWorkGroupId,
}: Props) {
  const [current, setCurrent] = useState(0);

  const pages = [
    <ActiveTypeTab
      activeTypes={activeTypes}
      setActiveTypes={setActiveTypes}
      gappWorkGroupId={gappWorkGroupId}
    />,
    <ActiveClassTab
      activeClasses={activeClasses}
      activeTypes={activeTypes}
      setActiveClasses={setActiveClasses}
      gappWorkGroupId={gappWorkGroupId}
    />,
  ];

  return (
    <div className="settings-section-wrapper">
      <div className="settings-sub-tabs">
        {SUB_TABS.map(tab => (
          <button
            key={tab.key}
            className={`settings-sub-tab${current === tab.key ? " active" : ""}`}
            onClick={() => setCurrent(tab.key)}
          >
            <i className={tab.icon} style={{ marginRight: 5 }} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-section-content">
        {pages[current]}
      </div>
    </div>
  );
}
