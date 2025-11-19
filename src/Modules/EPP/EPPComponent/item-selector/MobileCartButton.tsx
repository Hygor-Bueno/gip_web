import React from "react";

type Props = {
  itemCount: number;
  total: number;
  onClick: () => void;
};

export const MobileCartButton: React.FC<Props> = ({ itemCount, total, onClick }) => {
  if (itemCount === 0) return null;
  return (
    <div className="d-lg-none bottom-0 start-0 end-0 p-3 bg-white border-top shadow-lg" style={{ zIndex: 1050 }}>
      <button className="btn btn-success btn-lg w-100 shadow" onClick={onClick}>
        <i className="fa-solid fa-shopping-cart me-2"></i>
        Ver Carrinho ({itemCount}) - R$ {total.toFixed(2)}
      </button>
    </div>
  );
};