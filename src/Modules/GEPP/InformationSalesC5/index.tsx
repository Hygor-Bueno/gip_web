import React, { useEffect, useState } from "react";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";
import HeaderC5 from "../Components/Header";
import InformationText from "../Components/InformationText";
import { Card } from "../Components/Card";
import { cardsConfig } from "../ManagerCard/Json/Card";
import { useConnection } from "../../../Context/ConnContext";
import { EditModalConfirm, ObservationModal } from "../Components/Modal";
import { handleNotification } from "../../../Util/Util";

require("./style.css");

function ProductSalesInfo({ data, product, children, loadData, setProduct }: ISalesC5Information) {
  const { fetchData } = useConnection();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [stepStatus, setStepStatus] = useState<any[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string>(""); // Armazena o step selecionado

  // Busca os status de etapas
  useEffect(() => {
    async function loadStatusSteps() {
      await getStatusStep();
    }
    loadStatusSteps();
  }, []);

  async function getStatusStep() {
    try {
      const response = await fetchData({
        method: "GET",
        pathFile: "GEPP/StatusStep.php",
        params: null,
        urlComplement: "&all=1",
        exception: ["no data"],
      });

      if (!response || response.error) {
        handleNotification(
          "Erro ao buscar status",
          response?.message || "Falha na comunicação com o servidor.",
          "danger"
        );
        return;
      }

      setStepStatus(response.data || []);
    } catch (error) {
      console.error("Erro no getStatusStep:", error);
      handleNotification(
        "Erro inesperado",
        "Ocorreu um erro ao buscar os status de etapa.",
        "danger"
      );
    }
  }

  // Funções de atualização de status
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
        status_product: 2,
        id_reasons_fk: 1,
        id_status_step_fk: 2,
      },
      urlComplement: "",
      exception: ["no data"],
    });

    if (!response.error) {
      handleNotification("Enviado com sucesso!", response.message, "success");
      loadData();
      setProduct(null);
    }
  }

  async function handleStatusReprove(observation: string) {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: product?.ean,
        description: product?.description,
        observation,
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        updated_by: 214,
        status_product: Number(product?.status_product),
        id_reasons_fk: 1,
        id_status_step_fk: 3,
      },
      urlComplement: "",
      exception: ["no data"],
    });

    if (!response.error) {
      handleNotification("Enviado com sucesso!", response.message, "success");
      loadData();
      setProduct(null);
    }
  }

  async function handleStatusTrash() {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: String(product?.ean),
        description: String(product?.description),
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        status_product: 0,
        id_reasons_fk: 1,
        id_status_step_fk: Number(product?.id_status_step_fk),
      },
      urlComplement: "",
      exception: ["no data"],
    });

    if (!response.error) {
      handleNotification("Card apagado com sucesso!", response?.message, "success");
      loadData();
      setProduct(null);
    }
  }

  async function handleStatusFinally(stepId: string) {
    const response = await fetchData({
      method: "PUT",
      pathFile: "GEPP/Product.php",
      params: {
        id_products: Number(data?.id_products),
        ean: String(product?.ean),
        description: String(product?.description),
        price: Number(product?.price),
        new_price: Number(product?.new_price),
        quantity: Number(product?.quantity),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        status_product: 4,
        id_reasons_fk: 1,
        id_status_step_fk: Number(stepId), // ✅ usa o valor selecionado
      },
      urlComplement: "",
      exception: ["no data"],
    });

    if (!response.error) {
      handleNotification("Atualizado com sucesso!", response?.message, "success");
      loadData();
      setProduct(null);
    }
  }

  // Seleção do modal Edit
  async function handleConfirmSelect(value: string) {
    setSelectedStepId(value); // salva valor selecionado

    if (value === "2") {
      await handleStatusAprove();
      setShowEditModal(false);
    } else if (value === "3") {
      setShowEditModal(false);
      setShowObservationModal(true);
    } else if (value === "5" || value === "6" || value === "7") {
      await handleStatusFinally(value); // envia o valor selecionado
      setShowEditModal(false);
    } else {
      setShowEditModal(false);
    }
  }

  return (
    <main className="container page-bg py-3 h-100 overflow-auto">
      {/* Modal de Observação */}
      {showObservationModal && (
        <ObservationModal
          onSave={async (text) => {
            await handleStatusReprove(text);
            setShowObservationModal(false);
          }}
          onClose={() => setShowObservationModal(false)}
        />
      )}

      {/* Modal de Edição */}
      <EditModalConfirm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleConfirmSelect}
        title="Editar Produto"
        options={stepStatus
          .filter((item: any) => {
            if (Number(product?.status_product) === 1) return item.step === "2";
            if (Number(product?.status_product) === 3) return item.step === "4";
            return false;
          })
          .map((item: any) => ({
            label: item.description,
            value: item.id_status,
          }))}
      />

      {/* Botões de ação */}
      <div className="d-flex w-100 justify-content-between gap-2 mb-2">
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className={`btn btn-success fa fa-pencil`}
          ></button>
        </div>
        {Number(product?.status_product) > 0 && Number(product?.status_product) <= 4 && (
          <button
            onClick={handleStatusTrash}
            className="btn btn-outline-danger fa fa-trash d-block"
          ></button>
        )}
      </div>

      <HeaderC5 data={data} product={product} />
      <InformationText product={product} />

      <div className="row mb-4 gx-3 gy-3">
        {cardsConfig(product).map((cardProps, index) => (
          <Card
            key={`card_${index}_${product?.code_product}`}
            outsideValues={cardProps}
          />
        ))}
      </div>
      <hr />
      {children}
    </main>
  );
}

export default ProductSalesInfo;
