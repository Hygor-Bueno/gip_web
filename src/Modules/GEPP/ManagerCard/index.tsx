import React, { useState, useEffect, useRef } from "react";
import InformationSalesC5 from "../InformationSalesC5";
import "./CardProd.css";
import useWindowSize from "../../GAPP/Infraction/hook/useWindowSize";
import { formatDateBR } from "../../../Util/Util";

function CardProd({ product, setProduct }: { product: any[][], setProduct: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevProductsRef = useRef<any[][]>([]);

  const {isMobile} = useWindowSize();

  // Controle de swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const prevProducts = prevProductsRef.current;

    const isDifferentList =
      prevProducts.length !== product.length ||
      prevProducts.some(
        (p, i) => p[1]?.id_products !== product[i]?.[1]?.id_products
      );

    if (isDifferentList || currentIndex >= product.length) {
      setCurrentIndex(0);
    }

    prevProductsRef.current = product;
  }, [product, currentIndex]);

  // Navegação manual
  const next = () => setCurrentIndex((prev) => (prev + 1) % product.length);
  const prev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? product.length - 1 : prev - 1
    );

  // Detecta swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;

    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;

      if (Math.abs(diff) > 50) {
        // Sensibilidade do swipe
        if (diff > 0) {
          next(); // swipe para esquerda → próximo
        } else {
          prev(); // swipe para direita → anterior
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentProduct = product[currentIndex];
  const oracleData = currentProduct?.[0] || {};
  const mySqlData = currentProduct?.[1] || {};

  return (
    <div
      className="carousel-container w-100"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isMobile && (
        <div className="d-flex justify-content-end gap-2 p-2">
          <button onClick={() => {console.log('reload lista')}} className="fa fa-rotate btn btn-primary"></button>
          <button onClick={() => {setProduct(null)}}className="fa fa-trash btn btn-danger"></button>
        </div>
      )}
      <InformationSalesC5
        key={`product_${mySqlData?.id_products}_${oracleData?.code_category}`}
        data={{
          dateTime: formatDateBR(mySqlData?.created_at),
          id: mySqlData?.id_products,
          store: oracleData?.store || mySqlData?.store,
          user: mySqlData?.created_by,
        }}
        product={{
          categoryName: oracleData?.category,
          code_category: oracleData?.code_category,
          code_family: oracleData?.code_family,
          code_product: oracleData?.code_product,
          description: oracleData?.description || mySqlData?.description,
          ean: oracleData?.ean || mySqlData?.ean,
          expiration_date:
            formatDateBR(oracleData?.expiration_date) || mySqlData?.expiration_date,
          first_date: formatDateBR(oracleData?.first_date),
          last_date: formatDateBR(oracleData?.last_date),
          meta: oracleData?.meta,
          quantity: oracleData?.quantity || mySqlData?.quantity,
          store: oracleData?.store || mySqlData?.store,
          store_number: oracleData?.store_number || mySqlData?.store_number,
          total_quantity: oracleData?.total_quantity,
          value: oracleData?.value,
          price: mySqlData?.price,
          new_price: mySqlData?.new_price,
        }}
        children={
          product.length > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
              <button className="btn btn-outline-secondary" onClick={prev}>
                {"<"}
              </button>
              <span className="fw-bold">
                {currentIndex + 1} / {product.length}
              </span>
              <button className="btn btn-outline-secondary" onClick={next}>
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
