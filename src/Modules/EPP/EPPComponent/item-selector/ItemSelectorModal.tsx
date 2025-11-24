import React, { useState, useMemo } from "react";
import { SearchAndFilter } from "./SearchAndFilter";
import { ProductGrid } from "./ProductGrid";
import { CartSidebar } from "./CartSidebar";
import { MobileCartDrawer } from "./MobileCartDrawer";
import { MobileCartButton } from "./MobileCartButton";
import useWindowSize from "../../../GAPP/Infraction/hook/useWindowSize";
import useEppFetch from "../../EPPFetch/useEppFetch";

export type ItemType = {
  id: string | number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  unidadeMedida?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: ItemType[]) => void;
  currentItems: ItemType[];
};

const ItemSelectorModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, currentItems }) => {
  const [search, setSearch] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [mostrarCarrinhoMobile, setMostrarCarrinhoMobile] = useState(false);

  const [carrinho, setCarrinho] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    currentItems.forEach(item => {
      map.set(String(item.id), item.quantidade);
    });
    return map;
  });

  const {allProduct} = useEppFetch();
  const produtosDoBanco = allProduct?.data ?? [];

  // Lista de categorias únicas
  const categorias = useMemo(() => {
    const cats = produtosDoBanco.map((p: any) => p.category || "Sem categoria");
    const unicas = Array.from(new Set(cats)).sort();
    return ["Todas", ...unicas];
  }, [produtosDoBanco]);

  // Produtos filtrados por busca e categoria
  const produtosFiltrados = useMemo(() => {
    return produtosDoBanco.filter((p: any) => {
      const busca = search.toLowerCase();
      const matchesSearch =
        p.id_product.includes(busca) ||
        p.description.toLowerCase().includes(busca);

      const matchesCat =
        categoriaSelecionada === "Todas" ||
        p.category === categoriaSelecionada;

      return matchesSearch && matchesCat;
    });
  }, [search, categoriaSelecionada, produtosDoBanco]);

  // Itens que estão no carrinho (com todos os dados)
  const itensNoCarrinho = useMemo(() => {
    return Array.from(carrinho.entries())
      .map(([id_product, quantidade]) => {
        const prod = produtosDoBanco.find((p: any) => p.id_product === id_product);
        if (!prod) return null;

        const preco = Number(prod.price);

        return {
          id: id_product,
          codigo: id_product,
          descricao: prod.description,
          precoUnitario: preco,
          quantidade,
          subtotal: Number((preco * quantidade).toFixed(2)),
          unidadeMedida: prod.measure,
        };
      })
      .filter(Boolean) as ItemType[];
  }, [carrinho, produtosDoBanco]);

  const totalCarrinho = itensNoCarrinho.reduce((acc, item) => acc + item.subtotal, 0);

  // Altera quantidade (suporta kg e un)
  const mudarQuantidade = (id_product: string, novaQtd: number) => {
    const prod = produtosDoBanco.find((p: any) => p.id_product === id_product);
    if (!prod) return;

    let qtdFinal = novaQtd;

    if (prod.measure?.toLowerCase() === "kg") {
      qtdFinal = novaQtd <= 0 ? 0 : Math.max(0.1, Number(novaQtd.toFixed(2)));
    } else {
      qtdFinal = Math.max(0, Math.floor(novaQtd));
    }

    setCarrinho(prev => {
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
    onConfirm(itensNoCarrinho);
    onClose();
  };

  const limparCarrinho = () => {
    setCarrinho(new Map());
  };

  const { width } = useWindowSize();

  if (!isOpen) return null;

  // Mobile: tela cheia do carrinho
  if (mostrarCarrinhoMobile) {
    return (
      <MobileCartDrawer
        cartItems={itensNoCarrinho}
        total={totalCarrinho}
        onBack={() => setMostrarCarrinhoMobile(false)}
        onClearAll={limparCarrinho}
        onConfirm={confirmarSelecao}
        onRemoveItem={(id) => mudarQuantidade(String(id), 0)}
      />
    );
  }

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex={-1} style={{ zIndex: 1055 }}>
      <div className="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div className="modal-content h-100">

          {/* Cabeçalho */}
          <div className="modal-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold fs-4">
              <i className="fa fa-solid fa-carrot text-white"></i> Adicionar Itens ao Pedido
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          {/* Corpo */}
          <div className="modal-body p-0 d-flex flex-column flex-lg-row" style={{ minHeight: "80vh" }}>

            {/* Lista de produtos */}
            <div className="flex-grow-1 overflow-auto p-3 p-lg-4">
              <SearchAndFilter
                search={search}
                onSearchChange={setSearch}
                selectedCategoria={categoriaSelecionada}
                onCategoriaChange={setCategoriaSelecionada}
                categorias={categorias}
              />

              {produtosFiltrados.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-search fa-3x mb-3"></i>
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <ProductGrid
                  products={produtosFiltrados.map((p: any) => ({
                    id: p.id_product,
                    codigo: p.id_product,
                    descricao: p.description,
                    precoUnitario: Number(p.price),
                    unidadeMedida: p.measure,
                  }))}
                  selectedProducts={carrinho}
                  onQuantityChange={mudarQuantidade}
                />
              )}
            </div>

            {/* Carrinho lateral */}
            {width > 920 && (
              <CartSidebar
                cartItems={itensNoCarrinho}
                total={totalCarrinho}
                onClearAll={limparCarrinho}
                onRemoveItem={(id) => mudarQuantidade(String(id), 0)}
                onConfirm={confirmarSelecao}
              />
            )}

          </div>

          {/* Botão flutuante no mobile */}
          <MobileCartButton
            itemCount={itensNoCarrinho.length}
            total={totalCarrinho}
            onClick={() => setMostrarCarrinhoMobile(true)}
          />

        </div>
      </div>
    </div>
  );
};

export default ItemSelectorModal;
