import React from "react";
import FuelTab from "../../../Active/Component/Releases/tabs/FuelTab";
import MaintenanceTab from "../../../Active/Component/Releases/tabs/MaintenanceTab";
import FinesTab from "../../../Active/Component/Releases/tabs/FinesTab";
import SinisterTab from "../../../Active/Component/Releases/tabs/SinisterTab";
import InsuranceTab from "../../../Active/Component/Releases/tabs/InsuranceTab";
import {
  FuelData, MaintenanceData, FinesData, SinisterData,
  PartItem, InfractionItem, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance, Schema } from "../../../Active/Interfaces/Interfaces";

interface Props {
  activeTab: TabKey;
  fuel: FuelData;
  maintenance: MaintenanceData;
  fines: FinesData;
  sinister: SinisterData;
  insurance: Partial<Insurance>;
  fuelTypes: Schema[];
  infractions: InfractionItem[];
  utilization: Schema[];
  insuranceCompany: Schema[];
  typeCoverage: Schema[];
  newItemText: string;
  setNewItemText: React.Dispatch<React.SetStateAction<string>>;
  newValueText: string;
  setNewValueText: React.Dispatch<React.SetStateAction<string>>;
  onFuelChange: (e: any) => void;
  onMaintenanceChange: (e: any) => void;
  onFinesChange: (e: any) => void;
  onSinisterChange: (e: any) => void;
  onInsuranceChange: (e: any) => void;
  onInfractionSelect: (inf: InfractionItem) => void;
  addPart: (part: PartItem) => void;
  removePart: (index: number) => void;
  addFranchiseItem: () => void;
  removeFranchiseItem: (index: number) => void;
}

const TypeSubform: React.FC<Props> = (p) => {
  switch (p.activeTab) {
    case "fuel":
      return <FuelTab fuel={p.fuel} onChange={p.onFuelChange} fuelTypes={p.fuelTypes} />;
    case "maintenance":
      return (
        <MaintenanceTab
          maintenance={p.maintenance}
          onChange={p.onMaintenanceChange}
          addPart={p.addPart}
          removePart={p.removePart}
        />
      );
    case "sinister":
      return <SinisterTab sinister={p.sinister} onChange={p.onSinisterChange} />;
    case "fines":
      return (
        <FinesTab
          fines={p.fines}
          onChange={p.onFinesChange}
          infractions={p.infractions}
          onInfractionSelect={p.onInfractionSelect}
        />
      );
    case "insurance":
      return (
        <InsuranceTab
          insurance={p.insurance}
          onChange={p.onInsuranceChange}
          addFranchiseItem={p.addFranchiseItem}
          removeFranchiseItem={p.removeFranchiseItem}
          newItemText={p.newItemText}
          setNewItemText={p.setNewItemText}
          newValueText={p.newValueText}
          setNewValueText={p.setNewValueText}
          utilization={p.utilization}
          insuranceCompany={p.insuranceCompany}
          typeCoverage={p.typeCoverage}
        />
      );
    default:
      return null;
  }
};

export default TypeSubform;
