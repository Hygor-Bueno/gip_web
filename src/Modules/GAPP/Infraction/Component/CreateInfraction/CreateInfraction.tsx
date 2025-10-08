import React from 'react';
import GenericModal from '../InfractionModel/InfractionModel';
import CustomForm from '../../../../../Components/CustomForm';

type CreateInfractionProps = {
  showModal: boolean;
  infraction: string;
  gravity: string;
  points: string;
  statusInfractions: string;
  handleSave: () => void;
  setInfraction: (value: string) => void;
  setGravity: (value: string) => void;
  setPoints: (value: string) => void;
  setShowModal: (value: boolean) => void;
  setStatusInfractions: (value: string) => void;
};

const CreateInfraction: React.FC<CreateInfractionProps> = ({
  showModal,
  setShowModal,
  handleSave,
  infraction,
  setInfraction,
  gravity,
  setGravity,
  points,
  setPoints,
  statusInfractions,
  setStatusInfractions,
}) => {
  return (
    <GenericModal
      show={showModal}
      onClose={() => setShowModal(false)}
      onSave={handleSave}
      title="Criar Nova Infração"
      saveButtonLabel="Criar"
      saveButtonVariant="primary"
    >
      <CustomForm
        notButton={false} // porque já tem botão no modal
        onAction={handleSave}
        fieldsets={[
          {
            item: {
              label: "Infração",
              mandatory: true,
              captureValue: {
                name: "infraction",
                type: "text",
                value: infraction,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInfraction(e.target.value),
                className: "form-control",
                placeholder: "Ex: Avanço de sinal"
              }
            }
          },
          {
            item: {
              label: "Gravidade",
              mandatory: true,
              captureValue: {
                name: "gravity",
                type: "text",
                value: gravity,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGravity(e.target.value),
                className: "form-control",
                placeholder: "Ex: Alta"
              }
            }
          },
          {
            item: {
              label: "Pontos",
              mandatory: true,
              captureValue: {
                name: "points",
                type: "number",
                value: points,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPoints(e.target.value),
                className: "form-control",
                placeholder: "Ex: 5"
              }
            }
          },
          {
            item: {
              label: "Status",
              mandatory: true,
              captureValue: {
                name: "statusInfractions",
                type: "select",
                value: statusInfractions,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatusInfractions(e.target.value),
                className: "form-select",
                options: [
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" }
                ]
              }
            }
          }
        ]}
      />
    </GenericModal>
  );
};

export default CreateInfraction;
