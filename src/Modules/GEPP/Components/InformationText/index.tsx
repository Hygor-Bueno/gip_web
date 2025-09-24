import React from 'react'
import { ISalesC5Information } from '../../InformationSalesC5/Interfaces/ISalesC5Information'

function InformationText({product}: ISalesC5Information) {
  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

export default InformationText