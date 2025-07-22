import { useMemo } from "react";

type Produto = {
  id_product: number;
  description: string;
  measure: string;
};

type CarrinhoItem = {
  id: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  preco: number;
  subtotal: number;
};

export function useShopCard(
  selectedProductIds: number[],
  productQuantities: { [productId: number]: number },
  productPrices: { [productId: number]: number },
  allProd: Produto[] = []
): CarrinhoItem[] {
  const produtosDoCarrinho = useMemo(() => {
    return selectedProductIds
      .map((id) => {
        const produto = allProd.find((p) => p.id_product === id);
        const quantidade = productQuantities[id] || 0;
        const preco = Number(productPrices[id]) || 0;

        if (!produto || quantidade <= 0) return null;

        return {
          id: id,
          descricao: produto.description,
          unidade: produto.measure,
          quantidade,
          preco,
          subtotal: quantidade * preco,
        };
      })
      .filter(Boolean) as CarrinhoItem[];
  }, [selectedProductIds, productQuantities, productPrices, allProd]);

  return produtosDoCarrinho;
}
