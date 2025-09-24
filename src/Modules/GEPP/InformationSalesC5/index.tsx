import React from "react";
import "./style.css";
import ProgressBar from "../../GTPP/ComponentsCard/Modal/Progressbar";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";

function ProductSalesInfo({ data, product, children }: ISalesC5Information) {
  return (
    <main className="container page-bg py-3 h-100 overflow-auto">
      {/* Cabeçalho */}
      <div className="row align-items-center mb-4 flex-wrap">
        <div className="col-md-6 col-12 d-flex align-items-center gap-3 mb-2 mb-md-0">
          <div className="product-image-placeholder">
            <i className="fa fa-shopping-cart fa-2x text-muted"></i>
          </div>
          <h3 className="fw-bold text-primary mb-0">
            {product?.description || "Selecione um produto"}
          </h3>
        </div>
        <div className="col-md-6 col-12 text-md-end text-start text-muted d-flex flex-column justify-content-md-center align-items-end justify-content-start gap-2">
          <div className="d-flex align-items-center justify-content-between mb-1 w-75">
            <div className="d-flex w-50">
              <span>
                <i className="fa fa-hashtag me-1"></i>
                <strong>ID:</strong> {data?.id}
              </span>
            </div>
            <div className="d-flex w-50">
              <span>
                <i className="fa fa-user me-1"></i>
                <strong>Usuário:</strong> {data?.user}
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between w-75">
            <div className="d-flex w-50">
              <span>
                <i className="fa fa-store me-1"></i>
                <strong>Loja:</strong> {data?.store}
              </span>
            </div>
            <div className="d-flex w-50">
              <span>
                <i className="fa fa-clock me-1"></i>
                <strong>Data:</strong> {data?.dateTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações não-quantitativas */}
      <div className="row mb-4 info-grid flex-wrap">
        <div className="col-md-3 col-6 mb-2">
          <strong>EAN:</strong> {product?.ean}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Cód Produto:</strong> {product?.code_product}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Cód Família:</strong> {product?.code_family}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Categoria:</strong> {product?.code_category}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Fornecedor:</strong> -
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>1ª Venda:</strong> {product?.first_date}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Última Venda:</strong> {product?.last_date}
        </div>
        <div className="col-md-3 col-6 mb-2">
          <strong>Vencimento:</strong> {product?.expiration_date}
        </div>
      </div>

      {/* Cards principais */}
      <div className="row mb-4 gx-3 gy-3">
        {/* Estoque & Vendas */}
        <div className="col-md-4 col-12">
          <div className="card-summary bg-primary text-white p-3">
            <div className="summary-icon mb-2">
              <i className="fa fa-warehouse"></i>
            </div>
            <h5 className="fw-bold">Estoque & Vendas</h5>
            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
              <span>Vendas</span>
              <strong>{Number(product?.quantity) || 0}</strong>
            </div>
            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
              <span>Restantes</span>
              <strong>
                {Number(product?.total_quantity) - Number(product?.quantity) ||
                  0}
              </strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Total</span>
              <strong>{Number(product?.total_quantity) || 0}</strong>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="col-md-4 col-12">
          <div className="card-summary bg-success text-white p-3">
            <div className="summary-icon mb-2">
              <i className="fa-solid fa-dollar-sign"></i>
            </div>
            <h5 className="fw-bold">Valores</h5>
            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
              <span>Antigo preço</span>
              <strong>{Number(product?.price) || 0}</strong>
            </div>
            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
              <span>Novo preço</span>
              <strong>{product?.new_price || 0}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Total de vendas</span>
              <strong>{Number(product?.value) || 0}</strong>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="col-md-4 col-12">
          <div
            className="card-summary bg-dark text-white p-3 d-flex flex-column justify-content-center align-items-center"
            style={{ height: "100%" }}
          >
            <div className="summary-icon mb-2">
              <i className="fa fa-bullseye fa-2x"></i>
            </div>
            <h5 className="fw-bold">Meta</h5>
            <ProgressBar
              secondaryClassName={"w-100"}
              colorBar="#198754"
              progressValue={Number(product?.meta) || 0}
            />
          </div>
        </div>
      </div>
      <hr />
      {/* Espaço para children adicionais */}
      {children}
    </main>
  );
}

export default ProductSalesInfo;
