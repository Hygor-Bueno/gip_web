import React from "react";
import "./style.css";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";
import HeaderC5 from "../Components/Header";
import InformationText from "../Components/InformationText";
import { Card } from "../Components/Card";
import { cardsConfig } from "../Json/Card";

function ProductSalesInfo({ data, product, children }: ISalesC5Information) {

  return (
    <main className="container page-bg py-3 h-100 overflow-auto">
      {/* Cabeçalho */}
      <HeaderC5 data={data} product={product} />
      {/* Informações não-quantitativas */}
      <InformationText product={product} />
      {/* Cards principais */}
      <div className="row mb-4 gx-3 gy-3">
        {/* Estoque & Vendas */}
        {cardsConfig(product).map((cardProps, index) => (
          <Card key={index} outsideValues={cardProps} />
        ))}
      </div>
      <hr />
      {/* Espaço para children adicionais */}
      {children}
    </main>
  );
}

export default ProductSalesInfo;
