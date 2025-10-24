import React from "react";
import { ISalesC5Information } from "../../InformationSalesC5/Interfaces/ISalesC5Information";
import { formatDateBR } from "../../../../Util/Util";

function InformationText({ product }: ISalesC5Information) {
  return (
    <div className="row info-grid">
      <InfoItem label="EAN" value={product?.ean} />
      <InfoItem label="Cód Produto" value={product?.code_product} />
      <InfoItem label="Cód Família" value={product?.code_family} />
      <InfoItem label="Categoria" value={product?.code_category} />
      <InfoItem label="Fornecedor" value="-" />
      <InfoItem label="Primeira Venda" value={product?.first_date} />
      <InfoItem label="Última Venda" value={product?.last_date} />
      <InfoItem label="Vencimento" value={formatDateBR(product?.expiration_date)} />
      <InfoItem label="Observação" value={product?.observation} mobcol={12} deskcol={12} />
    </div>
  );
}

export default InformationText;

// ==========================
// Subcomponente moderno
// ==========================
interface InfoItemProps { label: string; value?: string | number | null; mobcol?: number; deskcol?: number; bg?: string; color?:string;}
function InfoItem({ label, value, mobcol, deskcol, bg, color }: InfoItemProps) {
  return (
    <div className={`col-md-${deskcol ?? 3} col-${mobcol ?? 12}`}>
      <div className={`px-2 rounded shadow-sm h-100 bg-${bg ?? "white"}`} style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", transition: "all 0.2s" }}>
        <span className="d-block text-muted small fw-semibold mb-1">{label}:</span>
        <span className={`fw-bold text-${color ? color : "dark"}`}>{value ?? "—"}</span>
      </div>
    </div>
  );
}
