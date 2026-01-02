import React, { useState, useMemo } from "react";
import { SearchAndFilter } from "./SearchAndFilter";
import { CartSidebar } from "./CartSidebar";
import { MobileCartDrawer } from "./MobileCartDrawer";
import { MobileCartButton } from "./MobileCartButton";
import useWindowSize from "../../../GAPP/Infraction/hook/useWindowSize";
import useEppFetch from "../../EPPFetch/useEppFetch";
import useEppFetchGetOrder from "../../EPPFetch/useEppFetchGetOrder";
import { ProductTable } from "./ProductTable";

export type ItemType = {
  id: string | number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantity: number;
  subtotal: number;
  unidadeMedida?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: ItemType[]) => void;
  currentItems: ItemType[];
  onRemoveItem?: (id: string | number) => void;
};

const ItemSelectorModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, currentItems }) => {
  const [search, setSearch] = useState("");
  const [selectCategory, setSelectCategory] = useState("Todas");
  const [mostrarCarrinhoMobile, setMostrarCarrinhoMobile] = useState(false);
  const [precoCache, setPrecoCache] = useState<Record<string, number>>({});

  const { getOrder } = useEppFetchGetOrder();

  const [cart, setCart] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    currentItems.forEach(item => {
      map.set(String(item.id), item.quantity);
    });
    return map;
  });

  const {allProduct} = useEppFetch();
  const PRODUCT_DB = allProduct?.data ?? [];

  // Lista de categorys únicas
  const categorys = useMemo(() => {
    const category = PRODUCT_DB.map((p: any) => p.category || "Sem categoria");
    const uniqueCategory = Array.from(new Set(category)).sort();
    return ["Todas", ...uniqueCategory];
  }, [PRODUCT_DB]);

  // Produtos filtrados por busca e categoria
  const produtosFiltrados = useMemo(() => {
    return PRODUCT_DB.filter((p: any) => {
      const search_list_product = search.toLowerCase();
      const matchesSearch =
        p.id_product.includes(search_list_product) ||
        p.description.toLowerCase().includes(search_list_product);

      const matchesCategory =
        selectCategory === "Todas" ||
        p.category === selectCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectCategory, PRODUCT_DB]);

  // Carrinho de compras
  const ShoppingCartItems = useMemo(() => {
    return Array.from(cart.entries())
      .map(([id_product, quantity]) => {
        const prod = PRODUCT_DB.find((p:any) => p.id_product === id_product);
        if (!prod) return null;

        const preco = precoCache[id_product] ?? Number(prod.price);

        return {
          id: id_product,
          description: prod.description,
          price: preco,
          quantity,
          subtotal: Number((preco * quantity).toFixed(2)),
          measureMedium: prod.measure,
        };
      })
      .filter(Boolean) as any[];
}, [cart, PRODUCT_DB, precoCache]);


  const totalCarrinho = ShoppingCartItems.reduce((acc, item) => acc + item.subtotal, 0);

  const mudarQuantidade = async (id_product: string, novaQtd: number) => {
    const prod = PRODUCT_DB.find((p:any) => p.id_product === id_product);
    if (!prod) return;
    let precoAtualizado = precoCache[id_product];
    if (!precoAtualizado) {
      try {
        const response = await getOrder(Number(id_product));
        precoAtualizado = Number(response[0]?.PRECO);
        setPrecoCache(prev => ({ ...prev, [id_product]: precoAtualizado }));
      } catch (error) {
        console.error("Erro ao buscar preço:", error);
        precoAtualizado = Number(prod.price);
      }
    }
    
    let qtdFinal = novaQtd;
    if (prod.measure?.toLowerCase() === "kg") {
      qtdFinal = novaQtd <= 0 ? 0 : Math.max(0.1, Number(novaQtd.toFixed(2)));
    } else {
      qtdFinal = Math.max(0, Math.floor(novaQtd));
    }

    setCart(prev => {
      const novo = new Map(prev);
      if (qtdFinal <= 0) {
        novo.delete(id_product);
      } else {
        novo.set(id_product, qtdFinal);
      }
      return novo;
    });
  };

  const confirmarSelecao = () => {
    onConfirm(ShoppingCartItems);
    onClose();
  };

  const limparCarrinho = () => {
    setCart(new Map());
  };

  const { width } = useWindowSize();

  if (!isOpen) return null;

  // Mobile: tela cheia do carrinho
  // if (mostrarCarrinhoMobile) {
  //   return (
  //     <MobileCartDrawer
  //       cartItems={ShoppingCartItems}
  //       total={totalCarrinho}
  //       onBack={() => setMostrarCarrinhoMobile(false)}
  //       onClearAll={limparCarrinho}
  //       onConfirm={confirmarSelecao}
  //       onRemoveItem={(id) => mudarQuantidade(String(id), 0)}
  //     />
  //   );
  // }

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex={-1} style={{ zIndex: 1055 }}>
      <div className="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div className="modal-content h-100">

          {/* Cabeçalho */}
          <div className="modal-header text-white d-flex justify-content-between align-items-center" style={{background: 'var(--vPrimaryColor)'}}>
            <h5 className="modal-title fw-bold fs-4" style={{color: 'var(--vTitleColor)'}}>
              <i className="fa fa-solid fa-carrot text-white" style={{color: 'var(--vTitleColor) !important'}}></i> Adicionar Itens ao Pedido
            </h5>
            <button type="button" className="btn-close btn-close-dark" onClick={onClose} />
          </div>

          {/* Corpo */}
          <div className="modal-body p-0 d-flex flex-column flex-lg-row" style={{ minHeight: "80vh" }}>

            {/* Lista de produtos */}
            <div className="flex-grow-1 overflow-auto p-3 p-lg-4">
              <SearchAndFilter
                search={search}
                onSearchChange={setSearch}
                selectedCategoria={selectCategory}
                onCategoriaChange={setSelectCategory}
                categorias={categorys}
              />

              {produtosFiltrados.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-search fa-3x mb-3"></i>
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <ProductTable
                  products={produtosFiltrados.map((p: any) => ({
                    id: p.id_product,
                    codigo: p.id_product,
                    descricao: p.description,
                    precoUnitario: Number(p.price),
                    unidadeMedida: p.measure,
                  }))}
                  selectedProducts={cart}
                  onQuantityChange={mudarQuantidade}
                />
              )}
            </div>

            {/* Carrinho lateral */}
            {width > 920 && (
              <CartSidebar
                cartItems={ShoppingCartItems}
                total={totalCarrinho}
                onClearAll={limparCarrinho}
                onRemoveItem={(id) => mudarQuantidade(String(id), 0)}
                onConfirm={confirmarSelecao}
              />
            )}

          </div>

          {/* Botão flutuante no mobile */}
          {/* <MobileCartButton
            itemCount={ShoppingCartItems.length}
            total={totalCarrinho}
            onClick={() => setMostrarCarrinhoMobile(true)}
          /> */}

        </div>
      </div>
    </div>
  );
};

export default ItemSelectorModal;
