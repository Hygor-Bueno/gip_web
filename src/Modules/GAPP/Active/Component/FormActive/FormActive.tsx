import React, { useEffect, useState, useMemo, useCallback } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { ActiveFormValues, FormActiveProps, FormInsuranceProps, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";
import { mapFormToApi } from "../PayloadMapper/PayloadMapper";
import ListAdd from "../ListAddItem/ListAdd";
import { formVehicle } from "./FormSchema/FormVehicle.schema";
import { formAddress } from "./FormSchema/FormAddress.schema";
import { formActive } from "./FormSchema/FormActive.schema";
import { buildOptions, buildOptionsInsurance } from "../BuildFunction/BuildFunction";
import { ActivePostData } from "../../Adapters/Adapters";
import { formInsurance } from "./FormSchema/FormInsurance.schema";
import ListAddFranchise from "../ListAddItem/ListAddFranchise";

export default function FormActive({ apiData, openModal }: any) {
  const [activeValues, setActiveValues] = useState<Partial<ActiveFormValues>>({
    brand: "",
    model: "",
    is_vehicle: true,
    list_items: { list: [] },
    place_purchase: {}
  });

  const [vehicleValues, setVehicleValues] = useState<Partial<VehicleFormValues>>({
    license_plates: "",
    shielding: false,
  });

  const [insurance, setInsurance] = useState<Partial<Insurance>>({
    risk_cep: "",
  });

  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    if (apiData) {
      if (apiData.active) setActiveValues(apiData.active);
      if (apiData.vehicle) setVehicleValues(apiData.vehicle);
      if (apiData.insurance) setInsurance(apiData.insurance);
    }
  }, [apiData]);

  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (name.startsWith('place_purchase.')) {
      const field = name.split('.')[1];
      setActiveValues(prev => ({
        ...prev,
        place_purchase: { ...(prev.place_purchase || {}), [field]: fieldValue }
      }));
    } else {
      setActiveValues(prev => ({ ...prev, [name]: fieldValue }));
    }
  }, []);

  const handleVehicleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setVehicleValues(prev => ({ ...prev, [name]: fieldValue }));
  }, []);

  const handleInsuranceChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setInsurance(prev => ({ ...prev, [name]: fieldValue }));
  }, []);

  const addFranchiseItem = useCallback(() => {
    if (newItemText.trim()) {
      setInsurance((prev) => ({
        ...prev,
        franchise_list: {
          list: [...(prev.franchise_list?.list || []), newItemText],
        },
      }));
      setNewItemText("");
    }
  }, [newItemText]);

  const addItem = useCallback(() => {
    if (newItemText.trim()) {
      setActiveValues((prev) => ({
        ...prev,
        list_items: {
          list: [...(prev.list_items?.list || []), newItemText],
        },
      }));
      setNewItemText("");
    }
  }, [newItemText]);

  const removeItem = useCallback((indexToRemove: number) => {
    setActiveValues((prev) => ({ 
      ...prev, 
      list_items: { 
        list: (prev.list_items?.list || []).filter((_, index) => index !== indexToRemove)
      }
    }));
  }, []);

  const removeFranchiseItem = useCallback((indexToRemove: number) => {
    setInsurance((prev) => ({
      ...prev,
      franchise_list: {
        list: (prev.franchise_list?.list || []).filter((_, index) => index !== indexToRemove),
      },
    }));
  }, []);

  const options = useMemo(() => buildOptions(apiData), [apiData]);
  const optionsInsurance = useMemo(() => buildOptionsInsurance(apiData), [apiData]);

  const handleSubmit = async () => {
    try {
      const payload = mapFormToApi(activeValues as ActiveFormValues,  vehicleValues as VehicleFormValues, insurance as Insurance);
      const res = await ActivePostData(payload);
      if (res.error) throw new Error(res.message);
      openModal?.(false); 
    } catch (error) {
      console.error("Erro no envio:", error instanceof Error ? error.message : error);
    }
  };

  return (
    <div 
      onClick={() => openModal?.(false)} 
      className="position-absolute top-0 start-0 vw-100 vh-100 bg-dark bg-opacity-25 d-flex flex-column align-items-center justify-content-center" 
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white container h-75 w-75 overflow-auto p-4 rounded shadow d-flex flex-column"
      >
        <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Formulário de Ativo</h2>
        
        <CustomForm 
          notButton={false}
          className="row g-3 mb-4"
          fieldsets={formActive(activeValues, options.unit, options.departament, options.company, handleActiveChange)}
        />

        <ListAdd 
          activeValues={activeValues}
          addItem={addItem}
          newItemText={newItemText}
          setNewItemText={setNewItemText}
          removeItem={removeItem}
        />

        

        

        <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Local da Compra</h2>
        <CustomForm
          fieldsets={formAddress(activeValues.place_purchase, handleActiveChange)}
          className="row g-3 mb-4"
          notButton={false}
        />
        
        {activeValues.is_vehicle && (
          <React.Fragment>
            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados do Veículo</h2>
            <CustomForm
              notButton={false}
              fieldsets={formVehicle(vehicleValues, options.fuel, options.driver, handleVehicleChange)}
              className="row g-3 mb-4"
            />

            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados do Seguro</h2>
            <CustomForm
              notButton={false}
              fieldsets={formInsurance(insurance, handleInsuranceChange)}
              className="row g-3 mb-4"
            />

            <div>
              <ListAddFranchise 
                insuranceValues={insurance}
                addItem={addFranchiseItem}
                newItemText={newItemText}
                setNewItemText={setNewItemText}
                removeItem={removeFranchiseItem}
              />
            </div>
          </React.Fragment>
        )}

        <div className="mt-auto pt-3 border-top">
          <button className="btn color-gipp btn-lg px-5" onClick={handleSubmit}>
            <i className="fa fa-solid fa-save text-white"></i> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}