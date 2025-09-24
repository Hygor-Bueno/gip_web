import React from 'react'
import { ISalesC5Information } from '../../InformationSalesC5/Interfaces/ISalesC5Information'

function HeaderC5({data, product}: ISalesC5Information) {
  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

export default HeaderC5