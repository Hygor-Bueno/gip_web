import React, { useState, useEffect, useRef } from 'react';
import InformationSalesC5 from '../InformationSalesC5';
import './CardProd.css';

function CardProd({ product }: { product: any[][] }) {
  // Estado do índice atual do carrossel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ref para guardar a versão anterior da lista
  const prevProductsRef = useRef<any[][]>([]);

  useEffect(() => {
    const prevProducts = prevProductsRef.current;

    const isDifferentList =
      prevProducts.length !== product.length ||
      prevProducts.some((p, i) => p[1]?.id_products !== product[i]?.[1]?.id_products);

    if (isDifferentList || currentIndex >= product.length) {
      setCurrentIndex(0);
    }

    prevProductsRef.current = product;
  }, [product, currentIndex]);

  // Navegação
  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % product.length);

  const prev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? product.length - 1 : prev - 1
    );

  // Produto atual
  const currentProduct = product[currentIndex];
  const oracleData = currentProduct?.[0] || {};
  const mySqlData = currentProduct?.[1] || {};

  return (
    <div className="carousel-container w-100">
      <InformationSalesC5
        key={`product_${mySqlData?.id_products}_${oracleData?.code_category}`}
        data={{
          dateTime: mySqlData?.created_at,
          id: mySqlData?.id_products,
          store: oracleData?.store || mySqlData?.store,
          user: mySqlData?.created_by
        }}
        product={{
          categoryName: oracleData?.category,
          code_category: oracleData?.code_category,
          code_family: oracleData?.code_family,
          code_product: oracleData?.code_product,
          description: oracleData?.description || mySqlData?.description,
          ean: oracleData?.ean || mySqlData?.ean,
          expiration_date: oracleData?.expiration_date || mySqlData?.expiration_date,
          first_date: oracleData?.first_date,
          last_date: oracleData?.last_date,
          meta: oracleData?.meta,
          quantity: oracleData?.quantity || mySqlData?.quantity,
          store: oracleData?.store || mySqlData?.store,
          store_number: oracleData?.store_number || mySqlData?.store_number,
          total_quantity: oracleData?.total_quantity,
          value: oracleData?.value,
          price: mySqlData?.price,
          new_price: mySqlData?.new_price
        }}
        children={
          product.length > 1 && (
            <div className="carousel-controls col-12 d-flex justify-content-center align-items-center gap-3">
              <button className="btn btn-secondary" onClick={prev}>
                {"<"}
              </button>
              <span>
                {currentIndex + 1} / {product.length}
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
