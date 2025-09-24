import React from "react";
import { ISalesC5Information } from "../../InformationSalesC5/Interfaces/ISalesC5Information";

function InformationText({ product }: ISalesC5Information) {
  return (
    <div className="row mb-4 info-grid flex-wrap gy-2">
      <InfoItem label="EAN" value={product?.ean} />
      <InfoItem label="Cód Produto" value={product?.code_product} />
      <InfoItem label="Cód Família" value={product?.code_family} />
      <InfoItem label="Categoria" value={product?.code_category} />
      <InfoItem label="Fornecedor" value="-" />
      <InfoItem label="1ª Venda" value={product?.first_date} />
      <InfoItem label="Última Venda" value={product?.last_date} />
      <InfoItem label="Vencimento" value={product?.expiration_date} />
    </div>
  );
}

export default InformationText;

// ==========================
// Subcomponente para evitar repetição
// ==========================
interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="col-md-3 col-6">
      <span className="d-block text-muted small fw-semibold">{label}:</span>
      <span className="fw-bold text-dark">{value ?? "—"}</span>
    </div>
  );
}
