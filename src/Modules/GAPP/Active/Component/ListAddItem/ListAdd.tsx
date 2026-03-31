import { IListAdd } from "../../Interfaces/Interfaces"

/** Esse componente tem como objetivo de fazer um adicional de itens na lista para ser salvo no sistema.*/
export default function ListAdd({ newItemText, setNewItemText, addItem, activeValues, removeItem }: IListAdd) {
    return (
        <>
            <div className="listadd-card">
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