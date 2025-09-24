import React from "react";
import { ISalesC5Information } from "../../InformationSalesC5/Interfaces/ISalesC5Information";

const headerFields = [
  { icon: "fa fa-hashtag", label: "ID", key: "id" },
  { icon: "fa fa-user", label: "Usuário", key: "user" },
  { icon: "fa fa-store", label: "Loja", key: "store" },
  { icon: "fa fa-clock", label: "Data", key: "dateTime" }
];

function HeaderC5({ data, product }: ISalesC5Information) {
  return (
    <React.Fragment>
      <div className="row align-items-center mb-4 flex-wrap">
        {/* Coluna Produto */}
        <div className="col-md-6 col-12 d-flex align-items-center gap-3 mb-3 mb-md-0">
          <div className="product-image-placeholder">
            <i className="fa fa-shopping-cart fa-2x text-muted"></i>
          </div>
          <h3 className="fw-bold text-primary mb-0">
            {product?.description || "Selecione um produto"}
          </h3>
        </div>

        {/* Coluna Informações */}
        <div className="col-md-6 col-12">
          <div
            className="
              d-grid 
              gap-3
              grid-template
              text-muted
            "
          >
            {headerFields.map((field) => (
              <div
                key={field.key}
                className="d-flex align-items-center justify-content-between p-2 rounded border bg-light"
              >
                <div><i className={`${field.icon} me-2 text-primary`} /></div>
                <div><strong className="me-1">{field.label}:</strong>
                <span>{data?.[field.key as keyof typeof data] || "--"}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS inline ou em arquivo separado */}
      <style>{`
        .grid-template {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .grid-template {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </React.Fragment>
  );
}

export default HeaderC5;
