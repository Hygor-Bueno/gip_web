import React, { useEffect, useState } from "react";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";
import HeaderC5 from "../Components/Header";
import InformationText from "../Components/InformationText";
import { Card } from "../Components/Card";
import { cardsConfig } from "../ManagerCard/Json/Card";
import { useConnection } from "../../../Context/ConnContext";
import { ObservationModal } from "../Components/Modal";
import { handleNotification } from "../../../Util/Util";
import { Button } from "react-bootstrap";

require("./style.css");

function ProductSalesInfo({ data, product, children, loadData, setProduct }: ISalesC5Information) {
  const { fetchData } = useConnection();
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [stepStatus, setStepStatus] = useState<any[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string>(""); // Valor selecionado
  const [valueSellout, setValueSellout] = useState<string>("0.00");

  useEffect(() => {
    getStatusStep();
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
        handleNotification("Erro ao buscar status", response?.message || "Falha na comunicação", "danger");
        return;
      }

      setStepStatus(response.data || []);
    } catch (error) {
      console.error("Erro no getStatusStep:", error);
      handleNotification("Erro inesperado", "Ocorreu um erro ao buscar os status de etapa.", "danger");
    }
  }

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
        sellout: valueSellout,
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        status_product: 2,
        id_reasons_fk: 1,
        id_status_step_fk: 2,
      },
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
        status_product: 2,
        id_reasons_fk: 1,
        id_status_step_fk: 3
      },
    });

    if (!response.error) {
      handleNotification("Reprovado com sucesso!", response.message, "success");
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
        sellout: Number(product?.sellout),
        store_number: Number(product?.store_number),
        expiration_date: product?.expiration_date,
        status_product: 0,
        id_reasons_fk: 1,
        id_status_step_fk: Number(product?.id_status_step_fk),
      },
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
        sellout: Number(product?.sellout), 
        expiration_date: product?.expiration_date,
        status_product: 4,
        id_reasons_fk: 1,
        id_status_step_fk: Number(stepId),
      },
    });

    if (!response.error) {
      handleNotification("Status atualizado!", response?.message, "success");
      loadData();
      setProduct(null);
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedStepId(e.target.value);
  }

  async function handleSubmit() {
    if (!selectedStepId) {
      handleNotification("Selecione uma ação!", "É necessário escolher um status.", "warning");
      return;
    }

    if (selectedStepId === "2") {
      await handleStatusAprove();
    } else if (selectedStepId === "3") {
      setShowObservationModal(true);
    } else {
      await handleStatusFinally(selectedStepId);
    }
  }

  const filteredOptions = stepStatus.filter((item: any) => {
    if (Number(product?.status_product) === 1) return item.step === "2";
    if (Number(product?.status_product) === 3) return item.step === "4";
    return false;
  });

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
      {/* Cabeçalho e informações */}
      <HeaderC5 data={data} product={product} />
      <InformationText product={product} />

      {/* Select + botão */}
      <div className="d-flex flex-wrap align-items-start gap-3 my-3">
        {/* Select de Fluxo de Aprovação */}
        <div className="flex-grow-1 min-w-250 ">
          <label className="form-label fw-bold w-100">
            Fluxo de aprovação
            <select
              className="form-select mt-1"
              value={selectedStepId}
              onChange={handleSelectChange}
            >
              <option value="">Selecione uma ação...</option>
              {filteredOptions.map((item: any) => (
                <option key={item.id_status} value={item.id_status}>
                  {item.description}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Input de Sellout */}
        <div className="flex-grow-1 min-w-150">
          <label className="form-label fw-bold w-100">
            Sellout
            <input
              type="number"
              placeholder="0.00"
              className="form-control mt-1"
              onChange={(e) => setValueSellout(e.target.value)}
              disabled={Number(product?.status_product) !== 1}
              value={Number(product?.status_product) !== 1 ? product?.sellout : valueSellout}
            />
          </label>
        </div>

        {/* Botões */}
        <div className="d-flex gap-2 flex-wrap align-items-center mt-2 pt-4">
          <Button variant="primary" onClick={handleSubmit}>
            Enviar
          </Button>
          <Button
            variant="danger"
            onClick={handleStatusTrash}
            className="d-flex gap-2 align-items-center"
          >
            <i className="fa fa-trash text-white"></i> Deletar
          </Button>
        </div>
      </div>

      {/* Cards */}
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
