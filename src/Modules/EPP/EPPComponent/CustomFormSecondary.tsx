import React from "react";
import { renderField } from "../../../Components/CustomForm";
import ItemSelectorModal from "./item-selector/ItemSelectorModal";

type ItemType = {
  id: string | number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantity: number;
  subtotal: number;
};

function CustomFormGender({
  fieldsets = [],
  onValidSubmit,
  onAction,
  classButton,
  notButton = true,
  typeButton = "submit",
  titleButton = "Salvar",
  ...formProps
}: any) {
  const [formValues, setFormValues] = React.useState<Record<string, any>>({});
  const [errors, setErrors] =  React.useState<Record<string, string | undefined>>({});
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);
  const [selectedFieldName, setSelectedFieldName] = React.useState<string>("");

  // ======= CÁLCULOS AUTOMÁTICOS =======
  React.useEffect(() => {
    const itens: ItemType[] = (formValues["description"] as ItemType[]) || [];
    const totalItens = itens.reduce((sum, i) => sum + i.subtotal, 0); // reduce faz um calculo em tempo real. 

    const sinalRaw = (formValues["signalValue"] || "0")
      .toString()
      .replace(/[^\d,]/g, "")
      .replace(",", ".");
    const sinal = parseFloat(sinalRaw) || 0;
    const pendente = Math.max(0, totalItens - sinal);

    setFormValues(prev => ({
      ...prev,
      total: totalItens.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      pendingValue: pendente.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }));
  }, [formValues["signalValue"], formValues["description"]]);

  const handleFieldChange = (name: string, value: any) => {
    let newValue = value ?? "";
    if (name === "signalValue") {
      newValue = newValue.replace(/\D/g, "");
      newValue = (Number(newValue) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    setFormValues(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const injectChangeHandler = (captureValue: any = {}, fieldName: string) => ({
    ...captureValue,
    name: fieldName,
    value: formValues[fieldName] ?? captureValue.value ?? "",
    onChange: (e: any) => {
      const val = e?.target?.value ?? e;
      handleFieldChange(fieldName, val);
      captureValue.onChange?.(e);
    },
  });

  const openItemModal = (fieldName: string) => {
    setSelectedFieldName(fieldName);
    setIsItemModalOpen(true);
  };

  const handleItemsSelected = (novosItens: any) => {
    const itensAtuais = (formValues[selectedFieldName] || []) as any[];

    // Remove duplicatas por ID
    const itensUnicos = [...itensAtuais];

    console.log(itensUnicos);

    novosItens.forEach((novo:any)=> {
      if (!itensUnicos.some(i => i.id === novo.id)) {
        itensUnicos.push(novo);
      }
    });

    // Aqui preciso fazer um filtro para apagar o item da minha lista.
    setFormValues(prev => ({ ...prev, [selectedFieldName]: itensUnicos }));
    setIsItemModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidSubmit?.(formValues);
    onAction?.(formValues);
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
                        const name = item.name || `field_${groupIdx}_${itemIdx}`;

                        const captureProps = { ...(item.captureValue || {}), name };

                        // Aqui é onde fica os detalhes do pedido, quando clicamos no botão de adicionar
                        // uma CEIA DE NATAL, um perniu ou algo do tipo..
                        if (captureProps.type === "item-selector") {
                          const currentItems: any[] = formValues[name] || [];
                          const totalItens = currentItems.reduce((s, i) => s + i.subtotal, 0);

                          return (
                            <div key={name} className={item.width || "col-12"}>
                              {item.label && (
                                <label className="form-label fw-semibold">
                                  {item.label}
                                  {item.mandatory && <span className="text-danger ms-1">*</span>}
                                </label>
                              )}

                              <div className="border rounded p-3 bg-light position-relative">
                                {totalItens > 0 && (
                                  <div className="position-absolute top-0 end-0 bg-success text-white px-3 py-1 rounded-bottom-start shadow">
                                    Total: R$ {totalItens.toFixed(2)}
                                  </div>
                                )}

                                {currentItems.length === 0 ? (
                                  <p className="text-muted mb-3">Nenhum item adicionado</p>
                                ) : (
                                  <ul className="list-unstyled mb-3" style={{height: '200px', overflow: 'auto'}}>
                                    {currentItems.map((i, idx) => (
                                      <li key={i.id} className="mb-2 p-3 bg-white rounded shadow-sm d-flex justify-content-between align-items-center">
                                        <div>
                                          <strong>{i.id}</strong> - {i.description}
                                          <br />
                                          <small className="text-muted">
                                            {i.quantity} × R$ {i.price.toFixed(2)} ={" "}
                                            <strong className="text-success">
                                              R$ {i.subtotal.toFixed(2)}
                                            </strong>
                                          </small>
                                        </div>
                                        
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <button
                                  type="button"
                                  className="btn btn-primary w-100"
                                  onClick={() => openItemModal(name)}
                                >
                                  <i className="fa-solid fa-plus text-white me-2"></i>
                                  {currentItems.length > 0 ? "Adicionar mais itens" : "Adicionar Itens"}
                                </button>
                              </div>

                              {errors[name] && <div className="text-danger small mt-1">{errors[name]}</div>}
                            </div>
                          );
                        }

                        // Campos calculados → somente leitura
                        if (["total", "pendingValue"].includes(name)) {
                          captureProps.readOnly = true;
                          captureProps.className = (captureProps.className || "") + " bg-light";
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
                            {errors[name] && <div className="text-danger small mt-1">{errors[name]}</div>}
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
        onRemoveItem={(id: string | number) => {
          setFormValues(prev => ({
            ...prev,
            [selectedFieldName]: (prev[selectedFieldName] || []).filter((item: any) => item.id !== id)
          }));
        }}
      />
    </>
  );
}

export default CustomFormGender;
