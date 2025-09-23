import React, { useState, useEffect, useRef } from 'react';
import InformationSalesC5 from '../InformationSalesC5';
import './CardProd.css';

function CardProd({ product }: { product: any[][] }) {
  // Normaliza cada subarray em um único objeto
  const normalizedProducts = product.map(subArr =>
    Object.assign({}, ...subArr)
  );

  // Estado para controlar o índice do carrossel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ref para guardar a lista anterior e comparar
  const prevProductsRef = useRef<any[]>([]);

  useEffect(() => {
    const prevProducts = prevProductsRef.current;

    const isDifferentList =
      prevProducts.length !== normalizedProducts.length ||
      prevProducts.some((p, i) => p.id_products !== normalizedProducts[i]?.id_products);

    if (isDifferentList) {
      // Lista realmente mudou -> volta para o primeiro
      setCurrentIndex(0);
    } else if (currentIndex >= normalizedProducts.length) {
      // Caso a lista diminua e o index atual não exista mais
      setCurrentIndex(0);
    }

    // Atualiza referência
    prevProductsRef.current = normalizedProducts;
  }, [normalizedProducts, currentIndex]);

  // Funções para navegar
  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % normalizedProducts.length);

  const prev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? normalizedProducts.length - 1 : prev - 1
    );

  const currentProduct = normalizedProducts[currentIndex];

  return (
    <div className="carousel-container w-100">
      {/* Componente principal */}
        <InformationSalesC5
          key={`product_${currentProduct?.code_product}_${currentProduct?.code_category}`}
          data={{
            dateTime: currentProduct?.created_at,
            id: currentProduct?.id_products,
            store: currentProduct?.store,
            user: currentProduct?.created_by
          }}
          product={{
            categoryName: currentProduct?.category,
            code_category: currentProduct?.code_category,
            code_family: currentProduct?.code_family,
            code_product: currentProduct?.code_product,
            description: currentProduct?.description,
            ean: currentProduct?.ean,
            expiration_date: currentProduct?.expiration_date,
            first_date: currentProduct?.first_date,
            last_date: currentProduct?.last_date,
            meta: currentProduct?.meta,
            quantity: currentProduct?.quantity,
            store: currentProduct?.store,
            store_number: currentProduct?.store_number,
            total_quantity: currentProduct?.total_quantity,
            value: currentProduct?.value,
            price: currentProduct?.price,
            new_price: currentProduct?.new_price
          }}
          children={
            normalizedProducts.length > 1 && (
              <div className="carousel-controls col-12 d-flex justify-content-center align-items-center gap-3">
                <button className="btn btn-secondary" onClick={prev}>
                  {"<"}
                </button>
                <span>
                  {currentIndex + 1} / {normalizedProducts.length}
                </span>
                <button className="btn btn-secondary" onClick={next}>
                  {">"}
                </button>
              </div>
            )
          }
        />
    </div>
  );
}

export default CardProd;
