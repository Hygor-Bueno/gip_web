import { IListAdd } from "../../Interfaces/Interfaces";
import "./ListAddFranchise.css";

export default function ListAdd({ newItemText, setNewItemText, addItem, activeValues, removeItem }: IListAdd) {
    const items = activeValues.list_items?.list ?? [];

    return (
        <div className="franchise-card">
            <div className="franchise-header">
                <div className="franchise-header-icon">
                    <i className="fa fa-list"></i>
                </div>
                <div>
                    <p className="franchise-title">Itens Adicionais</p>
                    <p className="franchise-subtitle">Gerencie os itens da lista</p>
                </div>
                {items.length > 0 && (
                    <span className="badge-count">
                        {items.length} {items.length === 1 ? "item" : "itens"}
                    </span>
                )}
            </div>

            <div className="franchise-input-row">
                <div className="franchise-input-wrapper">
                    <label className="franchise-input-label">Novo item</label>
                    <input
                        className="franchise-input"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Ex: Extintor, Estepe..."
                    />
                </div>
                <button type="button" className="btn-add-franchise" onClick={addItem}>
                    <i className="fa fa-plus"></i> Adicionar
                </button>
            </div>

            <div className="franchise-table-wrapper">
                <table className="franchise-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style={{ textAlign: "center", width: 60 }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={2}>
                                    <div className="franchise-empty">
                                        <i className="fa fa-inbox"></i>
                                        <p className="franchise-empty-text">Nenhum item adicionado ainda.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={`${item}-${index}`}>
                                    <td>{item}</td>
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
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
