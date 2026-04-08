import React from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import { SinisterData } from "../Interfaces";
import { formSinister } from "./schemas/FormSinister.schema";

interface Props {
  sinister: SinisterData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const SinisterTab: React.FC<Props> = ({ sinister, onChange }) => (
  <div className="rel-section">
    <p className="rel-section-title">
      <i className="fa fa-car"></i> Sinistro
    </p>
    <CustomForm
      notButton={false}
      className="row g-3"
      fieldsets={formSinister(sinister, onChange)}
    />
  </div>
);

export default SinisterTab;
