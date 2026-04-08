import React from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import ListAddFranchise from "../../ListAddItem/ListAddFranchise";
import { formInsurance } from "../../FormActive/FormSchema/FormInsurance.schema";
import { Insurance, Schema } from "../../../Interfaces/Interfaces";

interface InsuranceTabProps {
  insurance: Partial<Insurance>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  addFranchiseItem: () => void;
  removeFranchiseItem: (index: number) => void;
  newItemText: string;
  setNewItemText: React.Dispatch<React.SetStateAction<string>>;
  newValueText: string;
  setNewValueText: React.Dispatch<React.SetStateAction<string>>;
  utilization: Schema[];
  insuranceCompany: Schema[];
  typeCoverage: Schema[];
}

const InsuranceTab: React.FC<InsuranceTabProps> = ({
  insurance,
  onChange,
  addFranchiseItem,
  removeFranchiseItem,
  newItemText,
  setNewItemText,
  newValueText,
  setNewValueText,
  utilization,
  insuranceCompany,
  typeCoverage,
}) => {
  return (
    <>
      <div className="rel-section">
        <p className="rel-section-title">
          <i className="fa fa-shield"></i> Dados do Seguro
        </p>
        <CustomForm
          notButton={false}
          className="row g-3"
          fieldsets={formInsurance(insurance, onChange, utilization, insuranceCompany, typeCoverage)}
        />
      </div>

      <ListAddFranchise
        insuranceValues={insurance}
        addItem={addFranchiseItem}
        newItemText={newItemText}
        setNewItemText={setNewItemText}
        newValueText={newValueText}
        setNewValueText={setNewValueText}
        removeItem={removeFranchiseItem}
      />
    </>
  );
};

export default InsuranceTab;
