import React, { useState, useCallback } from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import { MaintenanceData, PartItem } from "../Interfaces";
import { formMaintenance } from "./schemas/FormMaintenance.schema";
import "../../ListAddItem/ListAddFranchise.css";

interface Props {
  maintenance: MaintenanceData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  addPart: (part: PartItem) => void;
  removePart: (index: number) => void;
}

const emptyPart: PartItem = { description: "", quantity: "", value: "" };

const MaintenanceTab: React.FC<Props> = ({ maintenance, onChange, addPart, removePart }) => {
  const [newPart, setNewPart] = useState<PartItem>(emptyPart);

  const parts = maintenance.list_parts?.list ?? [];

  const handleAdd = useCallback(() => {
    if (!newPart.description || !newPart.quantity || !newPart.value) return;
    addPart(newPart);
    setNewPart(emptyPart);
  }, [newPart, addPart]);

  return (
    <>
      <div className="rel-section">
        <p className="rel-section-title">
          <i className="fa fa-cogs"></i> Manutenção
        </p>
        <CustomForm
          notButton={false}
          className="row g-3"
          fieldsets={formMaintenance(maintenance, onChange)}
        />
      </div>

      <div className="franchise-card">
        <div className="franchise-header">
          <div className="franchise-header-icon">
            <i className="fa fa-list"></i>
          </div>
          <div>
            <p className="franchise-title">Peças</p>
            <p className="franchise-subtitle">Gerencie as peças utilizadas</p>
          </div>
          {parts.length > 0 && (
            <span className="badge-count">
              {parts.length} {parts.length === 1 ? "peça" : "peças"}
            </span>
          )}
        </div>

        <div className="franchise-input-row">
          <div className="franchise-input-wrapper" style={{ flex: 3 }}>
            <label className="franchise-input-label">Descrição</label>
            <input
              className="franchise-input"
              value={newPart.description}
              onChange={e => setNewPart(p => ({ ...p, description: e.target.value }))}
              placeholder="Ex: Filtro de óleo"
            />
          </div>
          <div className="franchise-input-wrapper" style={{ flex: 1 }}>
            <label className="franchise-input-label">Qtd</label>
            <input
              className="franchise-input"
              type="number"
              value={newPart.quantity}
              onChange={e => setNewPart(p => ({ ...p, quantity: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="franchise-input-wrapper" style={{ flex: 1 }}>
            <label className="franchise-input-label">Valor unit. (R$)</label>
            <input
              className="franchise-input"
              type="number"
              value={newPart.value}
              onChange={e => setNewPart(p => ({ ...p, value: e.target.value }))}
              placeholder="0,00"
            />
          </div>
          <div className="franchise-input-wrapper" style={{ flex: 1 }}>
            <label className="franchise-input-label">Total (R$)</label>
            <input
              className="franchise-input"
              readOnly
              value={
                newPart.quantity && newPart.value
                  ? (Number(newPart.quantity) * Number(newPart.value)).toFixed(2)
                  : "0.00"
              }
              style={{ background: "#f0f7e6", color: "#6a9e2f", fontWeight: 600 }}
            />
          </div>
          <button className="btn-add-franchise" type="button" onClick={handleAdd}>
            <i className="fa fa-plus"></i> Adicionar
          </button>
        </div>

        <div className="franchise-table-wrapper">
          <table className="franchise-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit. (R$)</th>
                <th>Total (R$)</th>
                <th style={{ textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="franchise-empty">
                      <i className="fa fa-inbox"></i>
                      <p className="franchise-empty-text">Nenhuma peça adicionada ainda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                parts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.description}</td>
                    <td>{p.quantity}</td>
                    <td className="td-value">R$ {Number(p.value).toFixed(2)}</td>
                    <td className="td-value">
                      R$ {(Number(p.quantity) * Number(p.value)).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button className="btn-remove" onClick={() => removePart(i)} title="Remover">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {parts.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: "11px 16px", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Total peças
                  </td>
                  <td className="td-value" style={{ padding: "11px 16px" }}>
                    R$ {parts.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
};

export default MaintenanceTab;
