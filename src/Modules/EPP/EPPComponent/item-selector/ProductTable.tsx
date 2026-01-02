import React from "react";

type Product = {
  id: string | number;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  unidadeMedida?: string;
};

type Props = {
  products: Product[];
  selectedProducts: Map<string, number>;
  onQuantityChange: (id: string, quantity: number) => void;
};

export const ProductTable: React.FC<Props> = ({ products,selectedProducts,onQuantityChange}) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th className="text-center">Quantidade</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => {
              const idStr = String(product.id);
              const quantidadeAtual = selectedProducts.get(idStr) || 0;
              const isKg = product.unidadeMedida?.toLowerCase() === "kg";
              const step = isKg ? 0.5 : 1;
              return (
                <tr key={product.id}>
                  <td className="fw-bold">{product.codigo}</td>
                  <td>{product.descricao}</td>
                  <td className="text-center">
                    <div className="input-group input-group-sm justify-content-center">
                      <button className="btn btn-outline-danger" onClick={() => onQuantityChange(idStr, quantidadeAtual - step)}>-</button>
                      <input type="text" className="form-control text-center" style={{ maxWidth: 70 }} value={quantidadeAtual || ""} disabled readOnly placeholder="0" />
                      <button className="btn btn-outline-success" onClick={() => onQuantityChange(idStr, quantidadeAtual + step)}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted">Nenhum produto encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};