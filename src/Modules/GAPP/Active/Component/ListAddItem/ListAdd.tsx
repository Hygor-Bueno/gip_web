import { IListAdd } from "../FormActive/FormInterfaces/FormActiveInterface"

/** 
    Esse componente tem como objetivo de fazer um adicional de itens na lista para ser salvo no sistema.
*/
export default function ListAdd ({newItemText, setNewItemText, addItem, activeValues, removeItem}: IListAdd) {
    return (
        <div className="mb-4 p-3 border rounded bg-light">
            <label className="form-label fw-bold">Itens Adicionais</label>
            <div className="d-flex gap-2 mb-3">
                <input 
                className="form-control" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Ex: Extintor, Estepe..."
                />
                <button type="button" className="btn color-gipp" onClick={addItem}>
                <i className="fa fa-plus text-white"></i>
                </button>
            </div>
            
            <ul className="list-group">
                {activeValues.list_items?.list?.map((item, index) => (
                <li key={`${item}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                    <p>{item}</p>
                    <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => removeItem(index)}
                    >
                    <i className="fa fa-trash text-white"></i>
                    </button>
                </li>
                ))}
                {(!activeValues.list_items?.list?.length) && (
                <span className="text-muted small">Nenhum item adicionado.</span>
                )}
            </ul>
        </div>
    )
}