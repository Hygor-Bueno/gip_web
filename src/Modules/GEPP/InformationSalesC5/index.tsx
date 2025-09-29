import React, { useState } from "react";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";
import HeaderC5 from "../Components/Header";
import InformationText from "../Components/InformationText";
import { Card } from "../Components/Card";
import { cardsConfig } from "../ManagerCard/Json/Card";
import { useConnection } from "../../../Context/ConnContext";
import ObservationModal from "../Components/Modal";
require("./style.css");

function ProductSalesInfo({ data, product, children }: ISalesC5Information) {
  const { fetchData } = useConnection();
  
  // ✅ Estado para controlar o modal
  const [showModal, setShowModal] = useState(false);

  async function handleStatusAprove() {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: product?.ean,
        description: product?.description,
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        updated_by: Number(214),
        status_product: Number(product?.status_product),
        id_reasons_fk: Number(1),
        id_status_step_fk: Number(2)
      },
      urlComplement: "",
      exception: ["no data"],
    });
    
    if(!response.error) {
      console.log(response?.message);
      return;
    };
    console.log(response?.message);
  }

  async function handleStatusReprove(observation: string) {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: product?.ean,
        description: product?.description,
        observation: observation, // <- passa a observação aqui
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        updated_by: Number(214),
        status_product: Number(product?.status_product),
        id_reasons_fk: Number(1),
        id_status_step_fk: Number(3)
      },
      urlComplement: "",
      exception: ["no data"],
    });

    if(!response.error) {
      console.log(response?.message);
      return;
    };
    console.log(response?.message);
  }

  async function handleStatusTrash() {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: product?.ean,
        description: product?.description,
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        updated_by: Number(214),
        status_product: Number(0),
        id_reasons_fk: Number(1),
        id_status_step_fk: Number(product?.id_status_step_fk)
      },
      urlComplement: "",
      exception: ["no data"]
    });

    if(!response.error) {
      console.log(response?.message);
      return;
    };
    console.log(response?.message);
  }

  return (
    <main className="container page-bg py-3 h-100 overflow-auto">
      {showModal && (
        <ObservationModal
          onSave={(text) => {
            handleStatusReprove(text);
            setShowModal(false); 
          }}
          onClose={() => setShowModal(false)} // fecha o modal sem salvar
        />
      )}

      <div className="d-flex w-100 justify-content-between gap-2 mb-2">
        {Number(product?.id_status_step_fk) === 1 && (
          <div className="d-flex gap-2">
            <button onClick={handleStatusAprove} className={`btn btn-success`}>Aprovar</button>
            <button onClick={() => setShowModal(true)} className={`btn btn-danger`}>Reprovar</button>
          </div>
        )}
        <button onClick={handleStatusTrash} className="btn btn-outline-danger fa fa-trash d-block"></button>
      </div>

      <HeaderC5 data={data} product={product} />
      <InformationText product={product} />
      <div className="row mb-4 gx-3 gy-3">
        {cardsConfig(product).map((cardProps, index) => (
          <Card key={`card_${index}_${product?.code_product}`} outsideValues={cardProps} />
        ))}
      </div>
      <hr />
      {children}
    </main>
  );
}

export default ProductSalesInfo;
