import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/MainContext";
import NavBar from "../../Components/NavBar";
import { listPathGEPP } from "./ConfigGepp";
import CardProd from "./CardProd";
import Gerenciador from "./Gerenciador/Gerenciador";
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

  const isMobile = width <= 768; // ajuste o breakpoint conforme o design

  return (
    <>
      <NavBar list={listPathGEPP} />
      <div className="d-flex justify-content-center align-items-center w-100 mt-4">
        <div className="d-flex justify-content-center w-100 h-100">
          {isMobile ? (
            // --- MOBILE ---
            selectedProduct ? (
              // Produto selecionado → mostra apenas detalhes
              <CardProd product={selectedProduct} />
            ) : (
              // Nenhum produto selecionado → mostra tabela
              <Gerenciador
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
            )
          ) : (
            // --- DESKTOP ---
            <>
              <div className="w-50 pe-2">
                <Gerenciador
                  selectedProduct={selectedProduct || []}
                  setSelectedProduct={setSelectedProduct}
                />
              </div>
              <div className="w-50 ps-2">
                <CardProd product={selectedProduct || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Gepp;
