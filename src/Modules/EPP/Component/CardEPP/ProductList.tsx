import React from "react";
import { ProductListProps } from "../../Interfaces/InterfacesEPP";
import ProductItem from "./ProductItem";

const ProductList: React.FC<ProductListProps> = ({
  products,
  selectedKeys,
  getKey,
  getQuantity,
  toggleSelection,
  handleQuantityChange,
}) => {
  if (products.length === 0) {
    return <p className="text-muted">Nenhum produto encontrado.</p>;
  }

  return (
    <div className="overflow-auto w-75 border rounded p-2" style={{ maxHeight: "100%" }}>
      {products.map(item => {
        console.log('este');
        return (
        <ProductItem
          key={getKey(item)}
          item={item}
          selected={selectedKeys.has(getKey(item))}
          quantity={getQuantity(item)}
          onToggle={toggleSelection}
          onQuantityChange={handleQuantityChange}
        />
      )
      })}
    </div>
  );
};

export default ProductList;
