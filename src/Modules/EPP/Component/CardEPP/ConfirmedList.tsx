import React from "react";
import { dataAllProd } from "../../Interfaces/InterfacesEPP";
import ConfirmedItemEpp from "./ConfirmedItemEpp";

interface ConfirmedListProps {
  confirmedItems: Record<string, { product: dataAllProd; quantity: number; subtotal: number }>;
  selectedKeys: any;
  onRemove: (key: string) => void;
}

const ConfirmedList: React.FC<ConfirmedListProps> = ({ confirmedItems, onRemove }) => {
  console.log(confirmedItems);
  return (
  <div className="w-25 border d-flex flex-column rounded p-2 overflow-auto" style={{ maxHeight: "100%" }}>
    <h6 className="mb-3">Confirmados:</h6>
    {Object.keys(confirmedItems).length === 0 && <p className="text-muted">Nenhum item confirmado</p>} {/* verifica se há dados para ser montado */}
    {Object.entries(confirmedItems).map(([key, { product, quantity, subtotal }]) => 
    {
      console.log(confirmedItems)
      return (
      <ConfirmedItemEpp
        key={key}
        product={product}
        quantity={quantity}
        subtotal={subtotal}
        onRemove={onRemove}
      />
    )})}
  </div>
  )
};

export default ConfirmedList;
