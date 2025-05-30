import { IFormData, InfractionItem } from "../Modules/GAPP/Business/Interfaces/IFormGender";
import { GenericCardItemProps } from "../Modules/GAPP/Infraction/Interfaces/IFormGender";
const GenericCardItem = <T extends IFormData | InfractionItem>({
    item,
    fields,
    loading = false,
    onRecycle,
    onDelete,
    onEdit,
    showRecycle = false,
    showDelete = false,
    showEdit = false,
}: GenericCardItemProps<T>) => {
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="form-control rounded p-3 mb-2 bg-white bg-opacity-75 shadow">
                {fields.map(({ label, key }, index) => (
                    <div className="text-dark text-card" key={index}>
                        <strong title={String(item[key])}>{label}:</strong>{" "}
                        {String(item[key])}
                    </div>
                ))}
                <div className="d-flex justify-content-between">
                    <div className="d-flex gap-2 mt-2">
                        {showRecycle && (
                            <button
                                className="btn colorSystem"
                                onClick={() => onRecycle?.(item)}
                                disabled={loading}
                                aria-label="Reciclar"
                            >
                                <i className="fa fa-repeat text-primaryColor" />
                            </button>
                        )}
                        {showDelete && (
                            <button
                                className="btn colorSystem"
                                onClick={() => onDelete?.(item)}
                                aria-label="Excluir"
                            >
                                <i className="fa-solid fa-trash-can-arrow-up text-primaryColor" />
                            </button>
                        )}
                        {showEdit && (
                            <button
                                className="btn colorSystem"
                                onClick={() => onEdit?.(item)}
                                aria-label="Editar"
                            >
                                <i className="fa fa-pen" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GenericCardItem;
