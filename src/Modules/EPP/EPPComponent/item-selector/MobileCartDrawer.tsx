import React from "react";
import { CartItem } from "./types";

type Props = {
  cartItems: CartItem[];
  total: number;
  onBack: () => void;
  onClearAll: () => void;
  onConfirm: () => void;
  onRemoveItem: (productId: number) => void;
};

export const MobileCartDrawer: React.FC<Props> = ({
  cartItems,
  total,
  onBack,
  onClearAll,
  onConfirm,
  onRemoveItem,
}) => {
  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex={-1}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content h-100">
          {/* Header */}
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold" style={{ fontSize: "1.5rem" }}>
              <i className="fa-solid fa-shopping-cart text-white me-2"></i>
              <i className="text-white">Carrinho ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})</i>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onBack}
              aria-label="Voltar"
            ></button>
          </div>

          {/* Lista de itens */}
          <div className="modal-body overflow-auto">
            {cartItems.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <i className="fa-solid fa-shopping-cart fa-3x mb-3 opacity-25"></i>
                <p>O carrinho está vazio</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="card mx-3 mb-3">
                  <div className="card-body py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 pe-3">
                        <strong>{item.codigo}</strong> - {item.descricao}
                        <br />
                        <small className="text-muted">
                          {item.quantidade} {item.unidadeMedida === "kg" ? "kg" : "un"} × R$ {item.precoUnitario.toFixed(2)}
                        </small>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="Remover item"
                      >
                        <i className="fa-solid text-white fa-trash"></i>
                      </button>
                    </div>
                    <div className="text-end mt-3">
                      <strong className="text-success fs-5">
                        R$ {item.subtotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com total e botões */}
          <div className="modal-footer bg-light flex-column">
            <div className="w-100 text-center fs-3 fw-bold text-danger mb-3">
              Total: R$ {total.toFixed(2)}
            </div>

            <div className="w-100 d-flex gap-2 px-3">
              <button
                className="btn btn-outline-danger btn-lg flex-fill"
                onClick={onClearAll}
                disabled={cartItems.length === 0}
              >
                <i className="fa-solid fa-trash text-danger me-2"></i>
                Limpar
              </button>
              <button
                className="btn btn-success btn-lg flex-fill"
                onClick={onConfirm}
                disabled={cartItems.length === 0}
              >
                <i className="fa-solid text-white fa-check me-2"></i>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};