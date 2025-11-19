import React from "react";
import { CartItem } from "./types";

type Props = {
  cartItems: CartItem[];
  total: number;
  onClearAll: () => void;
  onRemoveItem: (id: number) => void;
  onConfirm: () => void;
};

export const CartSidebar: React.FC<Props> = ({
  cartItems,
  total,
  onClearAll,
  onRemoveItem,
  onConfirm,
}) => {
  return (
    <div className="border-start bg-light" style={{ width: "420px", minWidth: "320px" }}>
      <div className="d-flex flex-column h-100">
        <div className="p-3 border-bottom bg-success d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fa-solid fa-shopping-cart text-white me-2"></i>
            <i className="text-white">Carrinho ({cartItems.length})</i>
          </h5>
          <button className="btn btn-sm btn-danger" onClick={onClearAll}>
            <i className="fa-solid text-white fa-trash"></i>
          </button>
        </div>

        <div className="flex-grow-1 overflow-auto p-3">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted mt-5">Carrinho vazio</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded shadow-sm p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <strong>{item.codigo}</strong>
                    <p className="mb-1 small text-muted">{item.descricao}</p>
                    <small>
                      {item.quantidade} × R$ {item.precoUnitario.toFixed(2)}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="text-end mt-2">
                  <strong className="text-success">
                    R$ {item.subtotal.toFixed(2)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-top bg-white">
          <div className="d-flex justify-content-between align-items-end fs-4 fw-bold mb-3">
            <span style={{fontSize:"1.2rem"}}>Total:</span>
            <i style={{fontSize:"1.6rem"}} className="text-danger">R$ {total.toFixed(2)}</i>
          </div>
          <button className="btn btn-success btn-lg w-100" onClick={onConfirm} disabled={cartItems.length === 0}>
            Adicionar ao Pedido
          </button>
        </div>
      </div>
    </div>
  );
};