import React from "react";

type Props = {
  product: any;
  quantity: number;
  onQuantityChange: (id: number, qty: number) => void;
};

export const ProductCard: React.FC<Props> = ({ product, quantity, onQuantityChange }) => {
  const isKg = product.unidadeMedida === "kg";

  return (
    <div className="col">
      <div className="card h-100 shadow-sm hover-shadow transition">
        <div className="card-body d-flex flex-column" style={{ fontSize: "1.1rem" }}>
          <div className="d-flex justify-content-between mb-2">
            <strong>{product.codigo}</strong>
            <span className="badge bg-dark">{product.unidadeMedida.toUpperCase()}</span>
          </div>
          <p className="small text-muted flex-grow-1">{product.descricao}</p>
          <strong className="text-success fs-5 mb-3">
            R$ {product.precoUnitario.toFixed(2)} /{isKg ? "kg" : "un"}
          </strong>

          {isKg ? (
            <div className="input-group input-group-sm">
              <button
                className="btn btn-secondary"
                onClick={() => onQuantityChange(product.id, quantity - 0.5)}
              >
                −
              </button>
              <input
                type="number"
                step="0.5"
                min="0.1"
                className="form-control text-center"
                value={quantity || ""}
                onChange={(e) =>
                  onQuantityChange(product.id, parseFloat(e.target.value) || 0)
                }
              />
              <button
                className="btn btn-success"
                onClick={() => onQuantityChange(product.id, quantity + 0.5)}
              >
                +
              </button>
            </div>
          ) : (
            <div className="btn-group w-100" role="group">
              <button
                className="btn btn-secondary"
                onClick={() => onQuantityChange(product.id, quantity - 1)}
                disabled={quantity === 0}
              >
                −
              </button>
              <button className="btn btn-light flex-grow-1">{quantity || 0} un</button>
              <button className="btn btn-success" onClick={() => onQuantityChange(product.id, quantity + 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};