// src/components/pedido-form/item-selector/ProductGrid.tsx

import React from "react";

type Product = {
  id: string | number;         // ← agora aceita string OU number
  codigo: string;
  descricao: string;
  precoUnitario: number;
  unidadeMedida?: string;
};

type Props = {
  products: Product[];
  selectedProducts: Map<string, number>;  // ← MUDOU AQUI: string no lugar de number
  onQuantityChange: (id: string, quantity: number) => void;
};

export const ProductGrid: React.FC<Props> = ({
  products,
  selectedProducts,
  onQuantityChange,
}) => {
  return (
    <div className="row g-3">
      {products.map((product) => {
        const idStr = String(product.id); // garante que seja string
        const quantidadeAtual = selectedProducts.get(idStr) || 0;

        return (
          <div key={product.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="card-body d-flex flex-column">
                <h6 className="card-title fw-bold text-dark small">
                  {product.codigo}
                </h6>
                <p className="card-text flex-grow-1 small">{product.descricao}</p>
                <p className="fw-bold text-success">
                  R$ {product.precoUnitario.toFixed(2)}
                  <span className="text-muted ms-2">/{product.unidadeMedida || "un"}</span>
                </p>

                <div className="input-group input-group-sm">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onQuantityChange(idStr, quantidadeAtual - (product.unidadeMedida === "kg" ? 0.1 : 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    disabled
                    className="form-control text-center"
                    value={quantidadeAtual || ""}
                    readOnly
                    placeholder="0"
                  />
                  <button
                    className="btn btn-outline-success"
                    onClick={() => onQuantityChange(idStr, quantidadeAtual + (product.unidadeMedida === "kg" ? 0.1 : 1))}
                  >
                    +
                  </button>
                </div>

                {quantidadeAtual > 0 && (
                  <small className="text-success mt-1">
                    {quantidadeAtual} no carrinho
                  </small>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
