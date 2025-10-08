import React, { useState, useEffect, useRef } from "react";
import InformationSalesC5 from "../InformationSalesC5";
import useWindowSize from "../../GAPP/Infraction/hook/useWindowSize";
import { formatDateBR } from "../../../Util/Util";
import useFormattedProduct from "./Hooks/useFormattedProduct";
require("./CardProd.css");

function CardProd({ product, setProduct, reloadFunction }: { product: any[][], setProduct: any, setDataList?: any; reloadFunction: any; }) {

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

  const formattedProduct = useFormattedProduct(currentProduct);

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
        setProduct={setProduct}
        loadData={reloadFunction}
        key={`product_${mySqlData?.id_products}_${oracleData?.code_category}`}
        data={{
          created_at: formatDateBR(mySqlData?.created_at),
          id_products: mySqlData?.id_products,
          store_number: oracleData?.store || mySqlData?.store,
          user: mySqlData?.created_by,
        }}
        product={formattedProduct}
        children={
          product.length > 1 && (
            <div className="d-flex justify-content-center">
              <div className="d-flex gap-2 align-items-center align">
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
            </div>
          )
        }
      />
    </div>
  );
}

export default CardProd;
