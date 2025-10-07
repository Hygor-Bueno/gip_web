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
