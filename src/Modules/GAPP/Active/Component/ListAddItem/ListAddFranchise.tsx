import { FranchiseItem, IListAddFranchise } from "../../Interfaces/Interfaces"
import './ListAddFranchise.css';

export default function ListAddFranchise({
  newItemText,
  setNewItemText,
  newValueText,
  setNewValueText,
  addItem,
  insuranceValues,
  removeItem
}: IListAddFranchise) {
  const items: FranchiseItem[] = insuranceValues.franchise_list?.list ?? [];

  return (
    <>
      <div className="franchise-card">
        <div className="franchise-header">
          <div className="franchise-header-icon">
            <i className="fa fa-shield"></i>
          </div>
          <div>
            <p className="franchise-title">Franquias do Seguro</p>
            <p className="franchise-subtitle">Gerencie os itens de franquia</p>
          </div>
          {items.length > 0 && (
            <span className="badge-count">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          )}
        </div>
        <div className="franchise-input-row">
          <div className="franchise-input-wrapper">
            <label className="franchise-input-label">Descrição</label>
            <input
              type="text"
              className="franchise-input"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Ex: Para-brisa"
            />
          </div>
          <div className="franchise-input-wrapper">
            <label className="franchise-input-label">Valor (R$)</label>
            <input
              type="text"
              className="franchise-input"
              value={newValueText}
              onChange={(e) => setNewValueText(e.target.value)}
              placeholder="Ex: 500,00"
            />
          </div>
          <button
            className="btn-add-franchise"
            type="button"
            onClick={addItem}
          >
            <i className="fa fa-plus"></i>
            Adicionar
          </button>
        </div>

        {/* Tabela */}
        <div className="franchise-table-wrapper">
          <table className="franchise-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor (R$)</th>
                <th style={{ textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item, index) => (
                  <tr key={`${item.description}-${index}`}>
                    <td>{item.description}</td>
                    <td className="td-value">{item.value}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-remove"
                        onClick={() => removeItem(index)}
                        title="Remover"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="franchise-empty">
                      <i className="fa fa-inbox"></i>
                      <p className="franchise-empty-text">Nenhuma franquia adicionada ainda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}