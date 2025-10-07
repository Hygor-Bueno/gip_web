import React from "react";
import GenericModal from "../InfractionModel/InfractionModel";
import CustomForm from "../../../../../Components/CustomForm";

type EditInfractionProps = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  handleSave: () => void;
  infractionId: string;
  setInfractionId: (value: string) => void;
  infraction: string;
  setInfraction: (value: string) => void;
  gravity: string;
  setGravity: (value: string) => void;
  points: string;
  setPoints: (value: string) => void;
  statusInfractions: string;
  setStatusInfractions: (value: string) => void;

  // props novos para navegação
  onBack?: () => void;
  onNext?: () => void;
  pageNation?: string | number;
  showNavigation?: boolean;
};

const EditInfraction: React.FC<EditInfractionProps> = ({
  showModal,
  setShowModal,
  handleSave,
  infractionId,
  setInfractionId,
  infraction,
  setInfraction,
  gravity,
  setGravity,
  points,
  setPoints,
  statusInfractions,
  setStatusInfractions,
  onBack,
  onNext,
  pageNation,
  showNavigation = false,
}) => {
  return (
    <GenericModal
      show={showModal}
      onClose={() => setShowModal(false)}
      onSave={handleSave}
      title="Editar Infração"
      saveButtonLabel="Salvar Alterações"
      saveButtonVariant="success"
      showNavigation={showNavigation}
      onBack={onBack}
      onNext={onNext}
      pageNation={pageNation}
    >
      <CustomForm
        notButton={true} // já temos o botão de salvar no modal
        onAction={handleSave}
        fieldsets={[
          {
            item: {
              label: "ID",
              captureValue: {
                name: "infractionId",
                type: "text",
                value: infractionId,
                disabled: true,
                className: "form-control",
              },
            },
          },
          {
            item: {
              label: "Infração",
              mandatory: true,
              captureValue: {
                name: "infraction",
                type: "text",
                value: infraction,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setInfraction(e.target.value),
                className: "form-control",
                placeholder: "Ex: Avanço de sinal",
              },
            },
          },
          {
            item: {
              label: "Gravidade",
              mandatory: true,
              captureValue: {
                name: "gravity",
                type: "text",
                value: gravity,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setGravity(e.target.value),
                className: "form-control",
                placeholder: "Ex: Alta",
              },
            },
          },
          {
            item: {
              label: "Pontos",
              mandatory: true,
              captureValue: {
                name: "points",
                type: "number",
                value: points,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPoints(e.target.value),
                className: "form-control",
                placeholder: "Ex: 5",
              },
            },
          },
          {
            item: {
              label: "Status",
              mandatory: true,
              captureValue: {
                name: "statusInfractions",
                type: "select",
                value: statusInfractions,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusInfractions(e.target.value),
                className: "form-select",
                options: [
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ],
              },
            },
          },
        ]}
      />
    </GenericModal>
  );
};

export default EditInfraction;
