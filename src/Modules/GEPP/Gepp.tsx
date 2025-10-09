import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMyContext } from "../../Context/MainContext";
import NavBar from "../../Components/NavBar";
import { listPathGEPP } from "./ConfigGepp";
import CardProd from "./ManagerCard";
import Manager from "./ManagerTable/Manager";

export default function Gepp(){
  const { setTitleHead } = useMyContext();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reloadFunction, setReloadFunction] = useState<(() => void) | null>(null);
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
    <React.Fragment>
      <NavBar list={listPathGEPP} />
      <div className="d-flex justify-content-center align-items-center w-100 mt-4">
        <div className="d-flex justify-content-center w-100 h-100">
          

          <React.Fragment>
              <div className="w-50 pe-2">
                <Manager loadList={loadList} selectedProduct={selectedProduct || []} setSelectedProduct={setSelectedProduct} />
              </div>
              <div className="w-50 ps-2">
                <CardProd reloadFunction={reloadFunction} setProduct={setSelectedProduct} product={selectedProduct || []} />
              </div>
            </React.Fragment>
        </div>
      </div>
    </React.Fragment>
  );
};