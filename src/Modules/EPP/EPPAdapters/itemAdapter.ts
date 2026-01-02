interface Item {
    id: number,
    subtotal: number,
    description: string,
    price: string | number,
    quantity: number,
    measure: string
}

/**
 * DB → Item
 */
export const fromDBToItem = (p: any): Item => ({
  id: p.id_product,
  description: p.description,
  price: Number(p.price),
  quantity: 0,
  subtotal: 0,
  measure: p.measure,
});

/**
 * Atualiza subtotal
 */
export const withSubtotal = (item: Item): Item => ({
  ...item,
  subtotal: Number((Number(item.price) * item.quantity).toFixed(2)),
});

/**
 * Item → Payload Backend
 */
export const toBackendPayload = (item: Item) => ({
  id: item.id,
  description: item.description,
  price: item.price,
  quantity: item.quantity,
  measure: item.measure,
});
