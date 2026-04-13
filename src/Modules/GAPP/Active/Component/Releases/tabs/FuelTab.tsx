import React from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import { FuelData } from "../Interfaces";
import { Schema } from "../../../Interfaces/Interfaces";
import { formFuel } from "./schemas/FormFuel.schema";

interface Props {
  fuel: FuelData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  fuelTypes: Schema[];
}

const FuelTab: React.FC<Props> = ({ fuel, onChange, fuelTypes }) => (
  <div className="rel-section">
    <p className="rel-section-title">
      <i className="fa fa-tint"></i> Abastecimento
    </p>
    <CustomForm
      notButton={false}
      className="row g-3"
      fieldsets={formFuel(fuel, onChange, fuelTypes)}
    />
  </div>
);

export default FuelTab;
