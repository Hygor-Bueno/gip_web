import React, { useEffect, useState } from "react";
import { ISalesC5Information } from "./Interfaces/ISalesC5Information";
import HeaderC5 from "../Components/Header";
import InformationText from "../Components/InformationText";
import { Card } from "../Components/Card";
import { cardsConfig } from "../ManagerCard/Json/Card";
import { useConnection } from "../../../Context/ConnContext";
import { ObservationModal } from "../Components/Modal";
import { handleNotification } from "../../../Util/Util";
import CustomForm from "../../../Components/CustomForm";
import { formFieldsData, getProductParams, putProductParams } from "./ProductSalesInfo.Config";

require("./ProductSalesInfo.Style.css");

function ProductSalesInfo({ data, product, children, loadData, setProduct }: ISalesC5Information) {
  const { fetchData } = useConnection();
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [stepStatus, setStepStatus] = useState<any[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string>("");
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

  // --- Função genérica para atualizar status ---
  async function updateProductStatus(params: any, successMsg: string) {
    const response = await fetchData({ method: "PUT", pathFile: "GEPP/Product.php", params });
    if (!response.error) {
      handleNotification(successMsg, response.message, "success");
      loadData();
      setProduct(null);
    }
  }

  const handleStatusAprove = () => updateProductStatus(putProductParams(data, product, { sellout: valueSellout, stepId: 2 }), "Enviado com sucesso!");
  const handleStatusReprove = (observation: string) => updateProductStatus(getProductParams(data, product, { stepId: 3, observation }), "Reprovado com sucesso!");
  const handleStatusFinally = (stepId: string) => {
    const params = getProductParams(data, product, { stepId: 3 });
    params.id_status_step_fk = Number(stepId);
    return updateProductStatus(params, "Status atualizado!");
  };
  const handleStatusTrash = () => {
    const params = {
      ...getProductParams(data, product, {
        stepId: Number(product?.id_status_step_fk),
        observation: product?.observation,
        sellout: product?.sellout?.toString(),
      }),
      status_product: 0,
    } as any;
    return updateProductStatus(params, "Card apagado com sucesso!");
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStepId(e.target.value);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      if (selectedStepId === "2") await handleStatusAprove();
      else if (selectedStepId === "3") setShowObservationModal(true);
      else await handleStatusFinally(selectedStepId);
    } catch (error) {

    }
  };

  // --- Filtra opções do select de acordo com o status do produto ---
  const filteredOptions = stepStatus.filter((item: any) => {
    if (Number(product?.status_product) === 1 && Number(product?.id_status_step_fk) === 1) return item.step === "2";
    if (Number(product?.status_product) === 2) return item.step === "4";
    return false;
  });

  return (
    <main className="container overflow-auto">
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

      {/* Cards */}
      <div className="row mb-4 gx-3 gy-3">
        {cardsConfig(product).map((cardProps, index) => (
          <Card key={`card_${index}_${product?.code_product}`} outsideValues={cardProps} />
        ))}
      </div>
      <hr />
      {/* Formulário simplificado */}
      <div className="d-flex align-items-start">
        <CustomForm fieldsets={formFieldsData(selectedStepId, handleSelectChange, filteredOptions, product, valueSellout, setValueSellout)} className="container row gap-2 my-2" titleButton="Enviar" classButton="btn btn-primary" onSubmit={handleSubmit} />
        <button title="Excluir item" onClick={handleStatusTrash} className="btn btn-danger fa fa-trash" />
      </div>
      <hr />      
      {children}
    </main>
  );
}

export default ProductSalesInfo;