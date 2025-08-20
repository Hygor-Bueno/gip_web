import React from "react";
import { ProductItemProps } from "../../Interfaces/InterfacesEPP";
import { getProductKey } from "../../../../Util/Util";

const ProductItem: React.FC<ProductItemProps> = ({
  item,
  selected,
  quantity,
  onToggle,
  onQuantityChange,
}) => {
  const step = item.measure.toUpperCase() === "KG" ? 0.5 : 1;
  return (
    <div
      className={`d-flex justify-content-between align-items-center mb-2 p-2 rounded ${
        selected ? "bg-light border" : ""
      }`}
      key={getProductKey(item)}
    >
      <div className="d-flex gap-3 align-items-center w-100">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(item)}
          aria-label={`Selecionar ${item.description}`}
        />
        <label className="mb-0">{item.description}</label>
      </div>
      <input
        type="number"
        step={step}
        min={0}
        className="form-control w-50"
        disabled={!selected}
        placeholder={item.measure}
        value={quantity}
        onChange={(e) => onQuantityChange(item, e.target.value)}
        aria-label={`Quantidade para ${item.description}`}
      />
    </div>
  );
};

export default React.memo(ProductItem);
