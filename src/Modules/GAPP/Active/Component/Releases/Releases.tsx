import React from "react";
import "./Releases.css";
import { ReleasesProps } from "./Interfaces";
import { TABS } from "./constants";
import { useReleasesController } from "./hooks/useReleasesController";
import ExpenseFields from "./ExpenseFields";
import FuelTab from "./tabs/FuelTab";
import MaintenanceTab from "./tabs/MaintenanceTab";
import FinesTab from "./tabs/FinesTab";
import SinisterTab from "./tabs/SinisterTab";
import InsuranceTab from "./tabs/InsuranceTab";

const Releases: React.FC<ReleasesProps> = ({ activeId, userId, isVehicle, gappWorkGroupId, onClose }) => {
  const c = useReleasesController({ activeId, userId, isVehicle, gappWorkGroupId });
  const currentTab = TABS.find(t => t.key === c.activeTab)!;

  return (
    <div className="releases-overlay" onClick={onClose}>
      <div className="releases-modal" onClick={e => e.stopPropagation()}>

        <div className="releases-header">
          <div className="releases-header-icon"><i className="fa fa-file-text"></i></div>
          <div>
            <p className="releases-title">Lançamento de Despesas</p>
            <p className="releases-subtitle">Selecione o tipo e preencha os dados</p>
          </div>
          <button className="releases-close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>

        <div className="releases-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`releases-tab ${c.activeTab === t.key ? "releases-tab--active" : ""}`}
              onClick={() => c.setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="releases-body">
          {currentTab.showExpense && (
            <ExpenseFields
              expense={c.expense}
              onChange={c.handleExpenseChange}
              drivers={c.drivers}
              stores={c.stores}
              addressActive={c.addressActive}
              onToggleAddress={c.handleToggleAddress}
              addressForm={c.addressForm}
              onAddressChange={c.handleAddressChange}
            />
          )}
          {c.activeTab === "fuel"        && <FuelTab fuel={c.fuel} onChange={c.handleFuelChange} fuelTypes={c.fuelTypes} />}
          {c.activeTab === "maintenance" && <MaintenanceTab maintenance={c.maintenance} onChange={c.handleMaintenanceChange} addPart={c.addPart} removePart={c.removePart} />}
          {c.activeTab === "fines"       && <FinesTab fines={c.fines} onChange={c.handleFinesChange} infractions={c.infractions} onInfractionSelect={c.handleInfractionSelect} />}
          {c.activeTab === "sinister"    && <SinisterTab sinister={c.sinister} onChange={c.handleSinisterChange} />}
          {c.activeTab === "insurance"   && (
            <InsuranceTab
              insurance={c.insurance}
              onChange={c.handleInsuranceChange}
              addFranchiseItem={c.addFranchiseItem}
              removeFranchiseItem={c.removeFranchiseItem}
              newItemText={c.newItemText}
              setNewItemText={c.setNewItemText}
              newValueText={c.newValueText}
              setNewValueText={c.setNewValueText}
              utilization={c.utilization}
              insuranceCompany={c.insuranceCompany}
              typeCoverage={c.typeCoverage}
            />
          )}
          {c.activeTab === "trips" && (
            <div className="rel-section" style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
              <i className="fa fa-map fa-2x mb-2 d-block"></i>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Módulo de viagens em desenvolvimento.</p>
            </div>
          )}
        </div>

        <div className="releases-footer">
          <button className="btn-rel-back" onClick={onClose}>
            <i className="fa fa-arrow-left"></i> Voltar
          </button>
          <div className="d-flex gap-2">
            <button className="btn-rel-clear" onClick={c.clearForm}>
              <i className="fa fa-eraser text-white"></i> Limpar
            </button>
            {currentTab.expTypeId !== null && (
              <button className="btn-rel-save" onClick={c.handleSubmit} disabled={c.loading}>
                <i className="fa fa-check"></i> {c.loading ? "Salvando..." : "Salvar"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Releases;
