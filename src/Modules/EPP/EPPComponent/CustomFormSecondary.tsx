import React from "react";
import { renderField } from "../../../Components/CustomForm";
import ItemSelectorModal from "./item-selector/ItemSelectorModal";

type ItemType = {
  id: string | number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
};

function CustomFormGender({
  fieldsets = [],
  schema,
  onValidSubmit,
  onAction,
  classButton,
  notButton = true,
  typeButton = "submit",
  titleButton = "Salvar",
  ...formProps
}: any) {
  const [formValues, setFormValues] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);
  const [selectedFieldName, setSelectedFieldName] = React.useState<string>("");
  

  // ===== USE-EFFECT ÚNICO E PERFEITO (responsável por TODOS os cálculos) =====
  React.useEffect(() => {
    const itens: ItemType[] = (formValues["pedidoItens"] as ItemType[]) || [];
    const totalItens = itens.reduce((sum, item) => sum + item.subtotal, 0);

    const sinalStr = (formValues["pedidoSinal"] || "0").toString().replace(/[^\d,]/g, "").replace(",", ".");
    const sinal = parseFloat(sinalStr) || 0;
    const pendente = Math.max(0, totalItens - sinal);

    setFormValues(prev => ({
      ...prev,
      pedidoTotal: totalItens.toFixed(2).replace(".", ","),
      pedidoPendente: pendente.toFixed(2).replace(".", ","),
    }));
  }, [formValues["pedidoItens"], formValues["pedidoSinal"]]);

  const handleFieldChange = (name: string, value: any) => {
    let safeValue = value ?? "";

    if (["pedidoSinal", "pedidoTotal", "pedidoPendente"].includes(name)) {
      safeValue = safeValue.toString().replace(/[^\d,]/g, "");
      if (safeValue === "" || safeValue === ",") safeValue = "0,00";
    }

    setFormValues(prev => ({ ...prev, [name]: safeValue }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const injectChangeHandler = (captureValue: any = {}, fieldName: string) => ({
    ...captureValue,
    name: fieldName,
    onChange: (e: any) => {
      const value = e?.target?.value !== undefined ? e.target.value : e ?? "";
      handleFieldChange(fieldName, value);
      captureValue.onChange?.(e);
    },
  });

  const openItemModal = (fieldName: string) => {
    setSelectedFieldName(fieldName);
    setIsItemModalOpen(true);
  };

  const handleItemsSelected = (items: ItemType[]) => {
    setFormValues(prev => ({ ...prev, [selectedFieldName]: items }));
    setIsItemModalOpen(false);
  };

  const validateForm = () => {
    const result = schema?.safeParse(formValues);
    if (!result?.success) {
      const formatted: Record<string, string> = {};
      result?.error.issues.forEach((x:any) => {
        const key = x.path.join(".");
        if (!formatted[key]) formatted[key] = x.message;
      });
      setErrors(formatted);
      return false;
    }
    setErrors({});
    return result.data;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validData = validateForm();
    if (validData) {
      onValidSubmit?.(validData);
      onAction?.(validData);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate {...formProps}>
        <div className="container py-3">
          <div className="overflow-auto pe-2" style={{ maxHeight: "75vh" }}>
            {fieldsets.map((group: any, groupIdx: number) => {
              const items = Array.isArray(group.items) ? group.items : [];

              return (
                <div key={groupIdx} className="mb-4">
                  <fieldset className={`border rounded p-4 ${group.attributes?.className || ""}`}>
                    {group.legend && (
                      <legend className={group.legend.style || "fw-bold fs-5"}>
                        {group.legend.text}
                      </legend>
                    )}

                    <div className="row g-3">
                      {items.map((item: any, itemIdx: number) => {
                        const name = item.name || item.captureValue?.name || `field_${groupIdx}_${itemIdx}`;
                        const captureProps = { type: "text" as const, ...(item.captureValue || {}), name };

                        if (captureProps.type === "item-selector") {
                          const currentItems: ItemType[] = formValues[name] || [];

                          return (
                            <div key={name} className={item.width || "col-12"}>
                              {item.label && (
                                <label className={item.labelClass || "form-label"}>
                                  {item.label}
                                  {item.mandatory && <span className="text-danger ms-1">*</span>}
                                </label>
                              )}

                              <div className="border rounded p-3 bg-light min-vh-50">
                                {currentItems.length === 0 ? (
                                  <p className="text-muted mb-3">Nenhum item adicionado</p>
                                ) : (
                                  <ul className="list-unstyled mb-3">
                                    {currentItems.map((i, idx) => (
                                      <li key={i.id || idx} className="mb-2 p-3 bg-white rounded shadow-sm d-flex justify-content-between align-items-center">
                                        <div className="flex-grow-1">
                                          <strong>{i.codigo}</strong> - {i.descricao}
                                          <br />
                                          <small className="text-muted">{i.quantidade} × R$ {i.precoUnitario.toFixed(2)}</small>
                                          <strong className="ms-3 text-success">R$ {i.subtotal.toFixed(2)}</strong>
                                        </div>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-danger"
                                          onClick={() => {
                                            const updated = currentItems.filter((_, index) => index !== idx);
                                            handleItemsSelected(updated);
                                          }}
                                        >
                                          <i className="fa-solid text-white fa-trash"></i>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => openItemModal(name)}
                                >
                                  <i className="fa-solid fa-plus me-2 text-white"></i>
                                  Adicionar Itens
                                </button>
                              </div>

                              {errors[name] && <p className="text-danger small mt-1 mb-0">{errors[name]}</p>}
                            </div>
                          );
                        }

                        const updatedCapture = injectChangeHandler(captureProps, name);

                        return (
                          <div key={name} className={item.width || "col-12 col-md-6"}>
                            {item.label !== undefined && (
                              <label className={item.labelClass || "form-label"}>
                                {item.label}
                                {item.mandatory && <span className="text-danger ms-1">*</span>}
                              </label>
                            )}
                            {renderField(updatedCapture)}
                            {errors[name] && <p className="text-danger small mt-1 mb-0">{errors[name]}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                  {groupIdx < fieldsets.length - 1 && <hr className="my-5" />}
                </div>
              );
            })}
          </div>

          {notButton && (
            <div className="text-center mt-4">
              <button type={typeButton} className={classButton || "btn btn-success px-5 py-3 fs-5"}>
                {titleButton}
              </button>
            </div>
          )}
        </div>
      </form>

      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onConfirm={handleItemsSelected}
        currentItems={formValues[selectedFieldName] || []}
      />
    </>
  );
}

export default CustomFormGender;