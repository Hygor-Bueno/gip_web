import React from "react";
import { dataAllProd } from "../../Interfaces/InterfacesEPP";
import { getProductKey } from "../../../../Util/Util";

interface ConfirmedItemProps {
  product: dataAllProd;
  quantity: number;
  subtotal: number;
  onRemove: (key: string) => void;
}

const ConfirmedItem: React.FC<ConfirmedItemProps> = ({ product, quantity, subtotal, onRemove }) => {
  const key = getProductKey(product);
  return (
    <div className="d-flex justify-content-between align-items-center p-2 border mb-2 bg-white rounded">
      <div>
        <h1 className="mb-1"><strong>{product.description}</strong></h1>
        <h1 className="d-block mb-1">Qtd: {quantity} × {product.measure}</h1>
        <h1 className="d-block mb-1">Subtotal: <strong>R$ {subtotal.toFixed(2).replace(".", ",")}</strong></h1>
      </div>
      <button className="btn btn-sm btn-danger" onClick={() => onRemove(key)} aria-label={`Remover ${product.description}`}>
        <i className="fa-solid fa-trash text-white p-1"></i>
      </button>
    </div>
  );
};

export default React.memo(ConfirmedItem);
