import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMyContext } from "../../Context/MainContext";
import NavBar from "../../Components/NavBar";
import { listPathGEPP } from "./ConfigGepp";
import CardProd from "./ManagerCard";
import Manager from "./ManagerTable/Manager";

export default function Gepp() {
  const { setTitleHead } = useMyContext();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reloadFunction, setReloadFunction] = useState<(() => void) | null>(null);
  const [cardProd, setCardProd] = useState<boolean>(false);
  const loadList = useCallback((load: () => void) => {
    setReloadFunction(() => load);
  }, []);

  useEffect(() => {
    setTitleHead({
      title: "GEPP - Gestão vencimento de produtos.",
      simpleTitle: "GAPP - Gestão de vencimentos de produtos.",
      icon: "fa-solid fa-file",
    });
  }, [setTitleHead]);

  return (
    <div className="d-flex w-100 overflow-hidden">
      <NavBar list={listPathGEPP} />
      <Manager setCardProd={setCardProd} loadList={loadList} selectedProduct={selectedProduct || []} setSelectedProduct={setSelectedProduct} />
      {
        cardProd &&
        <div className="d-flex align-items-center justify-content-center bg-black bg-opacity-50 position-absolute w-100 h-100 top-0">
          <div className="bg-white p-2 rounded">
            <CardProd setCardProd={setCardProd} reloadFunction={reloadFunction} setProduct={setSelectedProduct} product={selectedProduct || []} />
          </div>
        </div>
      }
    </div>
  );
};