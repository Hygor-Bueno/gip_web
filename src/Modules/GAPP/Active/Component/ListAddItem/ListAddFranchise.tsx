import { IListAddFranchise } from "../../Interfaces/Interfaces"

export default function ListAddFranchise({
    newItemText,
    setNewItemText,
    addItem,
    insuranceValues,
    removeItem
}: IListAddFranchise) {

    return (
        <>
            <style>{`
                .franchise-card {
                    background: #ffffff;
                    border: 1px solid #e8eaf0;
                    border-radius: 16px;
                    padding: 28px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    margin-bottom: 1.5rem;
                }

                .franchise-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #f1f3f8;
                }

                .franchise-header-icon {
                    width: 36px;
                    height: 36px;
                    background: #bed989;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .franchise-header-icon i {
                    color: #fff;
                    font-size: 14px;
                }

                .franchise-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0;
                    letter-spacing: -0.2px;
                }

                .franchise-subtitle {
                    font-size: 12px;
                    color: #94a3b8;
                    margin: 0;
                }

                /* Input area */
                .franchise-input-row {
                    display: grid;
                    grid-template-columns: 1fr 160px auto;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .franchise-input-wrapper {
                    position: relative;
                }

                .franchise-input-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                    display: block;
                }

                .franchise-input {
                    width: 100%;
                    padding: 10px 14px;
                    font-size: 13.5px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    color: #1a202c;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    outline: none;
                }

                .franchise-input:focus {
                    border-color: #bed989;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(190,217,137,0.2);
                }

                .franchise-input::placeholder {
                    color: #b0bac7;
                }

                .btn-add-franchise {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 10px 18px;
                    background: #bed989;
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
                    white-space: nowrap;
                    align-self: flex-end;
                    height: 40px;
                }

                .btn-add-franchise:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(190,217,137,0.45);
                    filter: brightness(1.05);
                }

                .btn-add-franchise:active {
                    transform: translateY(0);
                }

                /* Table */
                .franchise-table-wrapper {
                    border: 1.5px solid #e8eaf0;
                    border-radius: 12px;
                    overflow: hidden;
                    max-height: 260px;
                    overflow-y: auto;
                }

                .franchise-table-wrapper::-webkit-scrollbar {
                    width: 5px;
                }

                .franchise-table-wrapper::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .franchise-table-wrapper::-webkit-scrollbar-thumb {
                    background: #bed989;
                    border-radius: 10px;
                }

                .franchise-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13.5px;
                }

                .franchise-table thead tr {
                    background: #f8fafc;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .franchise-table thead th {
                    padding: 11px 16px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1.5px solid #e8eaf0;
                    white-space: nowrap;
                }

                .franchise-table tbody tr {
                    transition: background 0.15s;
                    border-bottom: 1px solid #f1f5f9;
                }

                .franchise-table tbody tr:last-child {
                    border-bottom: none;
                }

                .franchise-table tbody tr:hover {
                    background: #f8fafc;
                }

                .franchise-table tbody td {
                    padding: 11px 16px;
                    color: #374151;
                    vertical-align: middle;
                }

                .franchise-table .td-value {
                    font-weight: 600;
                    color: #6a9e2f;
                }

                .franchise-empty {
                    padding: 32px 16px;
                    text-align: center;
                    color: #94a3b8;
                }

                .franchise-empty i {
                    font-size: 28px;
                    margin-bottom: 8px;
                    display: block;
                    opacity: 0.4;
                }

                .franchise-empty-text {
                    font-size: 13px;
                }

                .btn-remove {
                    width: 30px;
                    height: 30px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #fee2e2;
                    border: none;
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s;
                    font-size: 12px;
                }

                .btn-remove:hover {
                    background: #fca5a5;
                    transform: scale(1.1);
                }

                .badge-count {
                    margin-left: auto;
                    background: #f0f7e6;
                    color: #6a9e2f;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 9px;
                    border-radius: 20px;
                }
            `}</style>

            <div className="franchise-card">

                {/* Header */}
                <div className="franchise-header">
                    <div className="franchise-header-icon">
                        <i className="fa fa-shield"></i>
                    </div>
                    <div>
                        <p className="franchise-title">Franquias do Seguro</p>
                        <p className="franchise-subtitle">Gerencie os itens de franquia</p>
                    </div>
                    {insuranceValues.franchise_list?.list?.length > 0 && (
                        <span className="badge-count">
                            {insuranceValues.franchise_list.list.length} {insuranceValues.franchise_list.list.length === 1 ? "item" : "itens"}
                        </span>
                    )}
                </div>

                {/* Inputs */}
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
                            {insuranceValues.franchise_list?.list?.length ? (
                                insuranceValues.franchise_list.list.map((item: any, index: number) => (
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