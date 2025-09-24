import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/MainContext";
import NavBar from "../../Components/NavBar";
import { listPathGEPP } from "./ConfigGepp";
import CardProd from "./ManagerCard";
import Manager from "./ManagerTable/Manager";
import useWindowSize from "../GAPP/Infraction/hook/useWindowSize";

const Gepp = () => {
  const { setTitleHead } = useMyContext();
  const { width } = useWindowSize();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    setTitleHead({
      title: "GEPP - Gestão vencimento de produtos.",
      simpleTitle: "GAPP - Gestão de vencimentos de produtos.",
      icon: "fa-solid fa-file",
    });
  }, [setTitleHead]);

  const isMobile = width <= 768;

  return (
    <React.Fragment>
      <NavBar list={listPathGEPP} />
      <div className="d-flex justify-content-center align-items-center w-100 mt-4">
        <div className="d-flex justify-content-center w-100 h-100">
          {isMobile ? (
            selectedProduct ? (
              <React.Fragment>
                <CardProd setProduct={setSelectedProduct} product={selectedProduct} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Manager
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                />
              </React.Fragment>
            )
          ) : (
            <React.Fragment>
              <div className="w-50 pe-2">
                <Manager
                  selectedProduct={selectedProduct || []}
                  setSelectedProduct={setSelectedProduct}
                />
              </div>
              <div className="w-50 ps-2">
                <CardProd setProduct={setSelectedProduct} product={selectedProduct || []} />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Gepp;
