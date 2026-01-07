export const formFieldsData = (selectedStepId: any, handleSelectChange: any, filteredOptions: any, product: any, valueSellout: any, setValueSellout: any) => [
  {
    attributes: { id: "approval-flow", className: "row col-4 my-2" },
    item: {
      label: "Fluxo de aprovação:",
      mandatory: true,
      captureValue: {
        type: "select",
        name: "fluxoAprovacao",
        value: selectedStepId,
        onChange: handleSelectChange,
        options: filteredOptions.map((item: any) => ({
          label: item.description,
          value: item.id_status,
        })),
        className: "form-control",
        id: "fluxoAprovacaoSelect",
      },
    },
  },

  {
    attributes: { id: "sellout-field", className: "row col-2 my-2" },
    item: {
      label: "Sellout:",
      mandatory: false,
      captureValue: {
        type: "number",
        name: "sellout",
        value:
          Number(product?.status_product) !== 1
            ? product?.sellout
            : valueSellout,
        onChange: (e: any) => setValueSellout(e.target.value),
        disabled: Number(product?.status_product) !== 1,
        placeholder: "0.00",
        className: "form-control",
        id: "selloutInput",
      },
    },
  },
];

export function getProductParams(
  data: any,
  product: any,
  options?: { sellout?: string; stepId?: number; observation?: string }
) {
  return {
    id_products: Number(data?.id_products),
    ean: String(product?.ean),
    description: String(product?.description),
    price: Number(product?.price),
    new_price: Number(product?.new_price),
    quantity: Number(product?.quantity),
    sellout: options?.sellout ?? Number(product?.sellout),
    store_number: Number(product?.store_number),
    expiration_date: product?.expiration_date,
    status_product: options?.stepId ?? 1,
    id_reasons_fk: 1,
    id_status_step_fk: options?.stepId ?? 2,
    observation: options?.observation,
  };
}
export function putProductParams(
  data: any,
  product: any,
  options?: { sellout?: string; stepId?: number; observation?: string }
) {
  return {
    id_products: Number(data?.id_products),
    ean: String(product?.ean),
    description: String(product?.description),
    price: Number(product?.price),
    new_price: Number(product?.new_price),
    quantity: Number(product?.total_quantity),
    sellout: options?.sellout ?? Number(product?.sellout),
    store_number: Number(product?.store_number),
    expiration_date: product?.expiration_date,
    status_product: options?.stepId ?? 1,
    id_reasons_fk: 1,
    id_status_step_fk: options?.stepId ?? 2,
    observation: options?.observation,
  };
}