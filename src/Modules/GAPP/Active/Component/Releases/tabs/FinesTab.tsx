import React from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import { FinesData } from "../Interfaces";
import { formFines } from "./schemas/FormFines.schema";

interface Props {
  fines: FinesData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const FinesTab: React.FC<Props> = ({ fines, onChange }) => (
  <div className="rel-section">
    <p className="rel-section-title">
      <i className="fa fa-exclamation-triangle"></i> Multas
    </p>
    <CustomForm
      notButton={false}
      className="row g-3"
      fieldsets={formFines(fines, onChange)}
    />
  </div>
);

export default FinesTab;
