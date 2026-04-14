import React, { useState } from "react";
import CompanyTab from "./CompanyTab";
import UnitsTab from "./UnitsTab";
import DepartamentsTab from "./DepartamentsTab";
import SubdepartamentsTab from "./SubdepartamentsTab";
import { Company, Departament, Subdepartament, Unit } from "../Interfaces/SettingsInterfaces";

interface Props {
  companies:          Company[];
  units:              Unit[];
  departaments:       Departament[];
  subdepartaments:    Subdepartament[];
  setCompanies:       React.Dispatch<React.SetStateAction<Company[]>>;
  setUnits:           React.Dispatch<React.SetStateAction<Unit[]>>;
  setDepartaments:    React.Dispatch<React.SetStateAction<Departament[]>>;
  setSubdepartaments: React.Dispatch<React.SetStateAction<Subdepartament[]>>;
}

const SUB_TABS = [
  { key: 0, label: "Empresas",          icon: "fa fa-building" },
  { key: 1, label: "Unidades",          icon: "fa fa-map-marker" },
  { key: 2, label: "Departamentos",     icon: "fa fa-sitemap" },
  { key: 3, label: "Subdepartamentos",  icon: "fa fa-code-branch" },
];

export default function OrgConfigPage({
  companies, units, departaments, subdepartaments,
  setCompanies, setUnits, setDepartaments, setSubdepartaments,
}: Props) {
  const [current, setCurrent] = useState(0);

  const pages = [
    <CompanyTab companies={companies} setCompanies={setCompanies} />,
    <UnitsTab units={units} companies={companies} setUnits={setUnits} />,
    <DepartamentsTab departaments={departaments} units={units} setDepartaments={setDepartaments} />,
    <SubdepartamentsTab subdepartaments={subdepartaments} departaments={departaments} setSubdepartaments={setSubdepartaments} />,
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
