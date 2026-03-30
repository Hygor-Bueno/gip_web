import { IListAdd } from "../../Interfaces/Interfaces"

/** Esse componente tem como objetivo de fazer um adicional de itens na lista para ser salvo no sistema.*/
export default function ListAdd({ newItemText, setNewItemText, addItem, activeValues, removeItem }: IListAdd) {
    return (
        <>
            <style>{`
                .listadd-card {
                    background: #ffffff;
                    border: 1px solid #e8eaf0;
                    border-radius: 16px;
                    padding: 28px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    margin-bottom: 1.5rem;
                }

                .listadd-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #f1f3f8;
                }

                .listadd-header-icon {
                    width: 36px;
                    height: 36px;
                    background: #bed989;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .listadd-header-icon i {
                    color: #fff;
                    font-size: 14px;
                }

                .listadd-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0;
                    letter-spacing: -0.2px;
                }

                .listadd-subtitle {
                    font-size: 12px;
                    color: #94a3b8;
                    margin: 0;
                }

                .listadd-badge {
                    margin-left: auto;
                    background: #f0f7e6;
                    color: #6a9e2f;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 9px;
                    border-radius: 20px;
                }

                /* Input row */
                .listadd-input-row {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .listadd-input-wrapper {
                    flex: 1;
                }

                .listadd-input-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                    display: block;
                }

                .listadd-input {
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

                .listadd-input:focus {
                    border-color: #bed989;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(190,217,137,0.2);
                }

                .listadd-input::placeholder {
                    color: #b0bac7;
                }

                .btn-add-listadd {
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

                .btn-add-listadd:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(190,217,137,0.45);
                    filter: brightness(1.05);
                }

                .btn-add-listadd:active {
                    transform: translateY(0);
                }

                /* List */
                .listadd-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    max-height: 260px;
                    overflow-y: auto;
                    padding-right: 2px;
                }

                .listadd-list::-webkit-scrollbar {
                    width: 5px;
                }

                .listadd-list::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }

                .listadd-list::-webkit-scrollbar-thumb {
                    background: #bed989;
                    border-radius: 10px;
                }

                .listadd-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: #f8fafc;
                    border: 1.5px solid #e8eaf0;
                    border-radius: 10px;
                    transition: border-color 0.15s, background 0.15s;
                }

                .listadd-item:hover {
                    border-color: #bed989;
                    background: #fafffe;
                }

                .listadd-item-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .listadd-item-dot {
                    width: 8px;
                    height: 8px;
                    background: #bed989;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .listadd-item-text {
                    font-size: 13.5px;
                    color: #374151;
                    margin: 0;
                }

                .btn-remove-listadd {
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
                    flex-shrink: 0;
                }

                .btn-remove-listadd:hover {
                    background: #fca5a5;
                    transform: scale(1.1);
                }

                .listadd-empty {
                    padding: 28px 16px;
                    text-align: center;
                    color: #94a3b8;
                    border: 1.5px dashed #e2e8f0;
                    border-radius: 10px;
                }

                .listadd-empty i {
                    font-size: 24px;
                    margin-bottom: 8px;
                    display: block;
                    opacity: 0.35;
                }

                .listadd-empty-text {
                    font-size: 13px;
                    margin: 0;
                }
            `}</style>

            <div className="listadd-card">

                {/* Header */}
                <div className="listadd-header">
                    <div className="listadd-header-icon">
                        <i className="fa fa-list"></i>
                    </div>
                    <div>
                        <p className="listadd-title">Itens Adicionais</p>
                        <p className="listadd-subtitle">Gerencie os itens da lista</p>
                    </div>
                    
                    {
                    //@ts-ignore
                    activeValues.list_items?.list?.length > 0 && (
                        <span className="listadd-badge">
                            {
                            //@ts-ignore
                            activeValues.list_items.list.length} {activeValues.list_items.list.length === 1 ? "item" : "itens"}
                        </span>
                    )}
                </div>

                {/* Input */}
                <div className="listadd-input-row">
                    <div className="listadd-input-wrapper">
                        <label className="listadd-input-label">Novo item</label>
                        <input
                            className="listadd-input"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Ex: Extintor, Estepe..."
                        />
                    </div>
                    <button type="button" className="btn-add-listadd" onClick={addItem}>
                        <i className="fa fa-plus"></i>
                        Adicionar
                    </button>
                </div>

                {/* Lista */}
                {activeValues.list_items?.list?.length ? (
                    <div className="listadd-list">
                        {activeValues.list_items.list.map((item, index) => (
                            <div key={`${item}-${index}`} className="listadd-item">
                                <div className="listadd-item-left">
                                    <span className="listadd-item-dot"></span>
                                    <p className="listadd-item-text">{item}</p>
                                </div>
                                <button
                                    className="btn-remove-listadd"
                                    onClick={() => removeItem(index)}
                                    title="Remover"
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="listadd-empty">
                        <i className="fa fa-inbox"></i>
                        <p className="listadd-empty-text">Nenhum item adicionado ainda.</p>
                    </div>
                )}

            </div>
        </>
    )
}