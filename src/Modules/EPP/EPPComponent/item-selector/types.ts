export type ItemType = {
  id: number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  unidadeMedida: "un" | "kg";
};

export type CartItem = any & {
  quantidade: number;
  subtotal: number;
};