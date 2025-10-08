// ==========================
// Adicione mais cards por aqui!
// ==========================
export const cardsConfig = (product: any) => [
  {
    titleCard: { title: "Estoque & Vendas" },
    subTitle: { titleSecondary: "Vendas", titleTertiary: "Restantes" },
    productCard: {
      valueOne: Number(product?.quantity) || 0,
      valueTwo: (Number(product?.total_quantity) - Number(product?.quantity)) || 0,
      valueThree: Number(product?.total_quantity) || 0,
    },
    icon: "warehouse",
    color: "primary",
  },
  {
    titleCard: { title: "Valores" },
    subTitle: { titleSecondary: "Antigo preço", titleTertiary: "Novo preço" },
    productCard: {
      valueOne: Number(product?.price) || 0,
      valueTwo: Number(product?.new_price) || 0,
      valueThree: Number(product?.value) || 0,
    },
    icon: "dollar-sign",
    color: "success",
  },
  {
    titleCard: { title: "Meta" },
    meta: product?.meta?.toString() || "0",
    icon: "bullseye",
    color: "dark",
  },
];
