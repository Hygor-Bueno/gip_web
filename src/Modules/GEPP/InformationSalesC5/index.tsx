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
import { getProductParams } from "./Hooks/useProductParams";
import { InputField, SelectField } from "../../../Components/CustomForm";

require("./style.css");

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

  const handleStatusAprove = () =>
    updateProductStatus(getProductParams(data, product, { sellout: valueSellout, stepId: 2 }), "Enviado com sucesso!");

  const handleStatusReprove = (observation: string) =>
    updateProductStatus(getProductParams(data, product, { stepId: 3, observation }), "Reprovado com sucesso!");

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

  const handleSubmit = async () => {
    if (!selectedStepId) {
      handleNotification("Selecione uma ação!", "É necessário escolher um status.", "warning");
      return;
    }

    if (selectedStepId === "2") await handleStatusAprove();
    else if (selectedStepId === "3") setShowObservationModal(true);
    else await handleStatusFinally(selectedStepId);
  };

  // --- Filtra opções do select de acordo com o status do produto ---
  const filteredOptions = stepStatus.filter((item: any) => {
    if (Number(product?.status_product) === 1 && Number(product?.id_status_step_fk) === 1) return item.step === "2";
    if (Number(product?.status_product) === 2) return item.step === "4";
    return false;
  });

  // --- Campos do formulário ---
  const formFields: any = [
    {
      type: "select",
      label: "Fluxo de aprovação",
      value: selectedStepId,
      onChange: handleSelectChange,
      options: filteredOptions.map(item => ({ label: item.description, value: item.id_status })),
      className: "flex-grow-1 min-w-250",
    },
    {
      type: "number",
      label: "Sellout",
      value: Number(product?.status_product) !== 1 ? product?.sellout : valueSellout,
      onChange: (e:any) => setValueSellout(e.target.value),
      disabled: Number(product?.status_product) !== 1,
      placeholder: "0.00",
      className: "flex-grow-1 min-w-150",
    },
  ];

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

      {/* Formulário simplificado */}
      <div className="d-flex flex-wrap align-items-start gap-3 my-3">
        {formFields.map((field: any, i:any) =>
          field.type === "select" ? (
            <div key={i} className={field.className}>
              <SelectField {...field} />
            </div>
          ) : (
            <div key={i} className={field.className}>
              <InputField {...field} />
            </div>
          )
        )}

        {/* Botões */}
        <div className="d-flex gap-2 flex-wrap align-items-center mt-2 pt-4">
          <Button variant="primary" onClick={handleSubmit}>
            Enviar
          </Button>
          <Button variant="danger" onClick={handleStatusTrash} className="d-flex gap-2 align-items-center">
            <i className="fa fa-trash text-white"></i> Deletar
          </Button>
        </div>
      </div>

      {/* Cards */}
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
