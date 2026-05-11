import React from "react";
import ConfirmModal from "../../../../Components/CustomConfirm";
import "../../Active/Component/Releases/Releases.css";

import { IEditExpensesProps, TABS } from "./types";
import { useEditExpensesController } from "./hooks/useEditExpensesController";
import ExpenseSummary from "./sections/ExpenseSummary";
import AddressForm from "./sections/AddressForm";
import TypeSubform from "./sections/TypeSubform";

function EditExpenses({
  item, units, stores, storesData = [],
  onClose, onSaved, onDeleted,
}: IEditExpensesProps): JSX.Element {
  const c = useEditExpensesController({ item, storesData, onSaved, onDeleted });
  const currentTab = TABS.find((t) => t.key === c.activeTab)!;

  return (
    <div className="releases-overlay" onClick={onClose}>
      <div className="releases-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="releases-header">
          <div className="releases-header-icon"><i className="fa fa-file-invoice-dollar"></i></div>
          <div>
            <p className="releases-title">Editar Despesa #{item.expen_id}</p>
            <p className="releases-subtitle">Tipo: <strong>{currentTab.label}</strong></p>
          </div>
          <button className="releases-close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>

        {/* Tabs (somente leitura — tipo trava no edit) */}
        <div className="releases-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`releases-tab ${c.activeTab === t.key ? "releases-tab--active" : ""}`}
              type="button"
              disabled
              title={c.activeTab === t.key ? "Tipo da despesa" : "Para mudar o tipo, exclua e cadastre novamente"}
              style={c.activeTab !== t.key ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="releases-body">
          {currentTab.showExpense && (
            <ExpenseSummary
              expense={c.expense}
              unitId={c.unitId}
              setUnitId={c.setUnitId}
              stores={stores}
              units={units}
              drivers={c.drivers}
              addressActive={c.addressActive}
              onToggleAddress={c.handleToggleAddress}
              onExpenseChange={c.handleExpenseChange}
            />
          )}

          {currentTab.showExpense && c.addressActive && (
            <AddressForm
              addressForm={c.addressForm}
              onChange={c.handleAddressChange}
            />
          )}

          <TypeSubform
            activeTab={c.activeTab}
            fuel={c.fuel}
            maintenance={c.maintenance}
            fines={c.fines}
            sinister={c.sinister}
            insurance={c.insurance}
            fuelTypes={c.fuelTypes}
            infractions={c.infractions}
            utilization={c.utilization}
            insuranceCompany={c.insuranceCompany}
            typeCoverage={c.typeCoverage}
            newItemText={c.newItemText}
            setNewItemText={c.setNewItemText}
            newValueText={c.newValueText}
            setNewValueText={c.setNewValueText}
            onFuelChange={c.handleFuelChange}
            onMaintenanceChange={c.handleMaintenanceChange}
            onFinesChange={c.handleFinesChange}
            onSinisterChange={c.handleSinisterChange}
            onInsuranceChange={c.handleInsuranceChange}
            onInfractionSelect={c.handleInfractionSelect}
            addPart={c.addPart}
            removePart={c.removePart}
            addFranchiseItem={c.addFranchiseItem}
            removeFranchiseItem={c.removeFranchiseItem}
          />
        </div>

        {/* Footer */}
        <div className="releases-footer">
          <button className="btn-rel-back" type="button" onClick={onClose}>
            <i className="fa fa-arrow-left"></i> Voltar
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-rel-back"
              type="button"
              onClick={c.handleReset}
              disabled={!c.isDirty}
              title={!c.isDirty ? "Nada para restaurar" : "Voltar para os valores originais"}
            >
              <i className="fa fa-rotate-left"></i> Restaurar
            </button>
            <button className="btn-rel-clear" type="button" onClick={() => c.setConfirmDelete(true)}>
              <i className="fa fa-trash text-white"></i> Excluir
            </button>
            <button
              className="btn-rel-save"
              type="button"
              onClick={c.handleSave}
              disabled={c.loadingSave || !c.isDirty}
              title={!c.isDirty ? "Nenhuma alteração para salvar" : undefined}
            >
              <i className="fa fa-check"></i> {c.loadingSave ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

      </div>

      {c.confirmDelete && (
        <ConfirmModal
          title="Excluir despesa"
          message={`Deseja realmente excluir a despesa #${item.expen_id}? Esta ação não poderá ser desfeita.`}
          confirmLabel="Sim, excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={c.handleDelete}
          onClose={() => c.setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default EditExpenses;
