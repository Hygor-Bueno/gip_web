import React from "react";
import { Form } from "react-bootstrap";
import GenericModal from "../InfractionModel/InfractionModel";

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
};

const EditInfraction: React.FC<EditInfractionProps> = ({
  showModal,
  setShowModal,
  handleSave,
  infractionId,
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
      title="Editar Infração"
      saveButtonLabel="Salvar Alterações"
      saveButtonVariant="success"
    >
      <Form>
        <Form.Group>
          <Form.Label>ID</Form.Label>
          <Form.Control type="text" value={infractionId} disabled />
        </Form.Group>

        <Form.Group>
          <Form.Label>Infração</Form.Label>
          <Form.Control
            type="text"
            value={infraction}
            onChange={(e) => setInfraction(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Gravidade</Form.Label>
          <Form.Control
            type="text"
            value={gravity}
            onChange={(e) => setGravity(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Pontos</Form.Label>
          <Form.Control
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={statusInfractions}
            onChange={(e) => setStatusInfractions(e.target.value)}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Form.Select>
        </Form.Group>
      </Form>
    </GenericModal>
  );
};

export default EditInfraction;
