import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { ActiveFormValues, FormActiveProps, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";
import { mapActiveToApi, mapVehicleToApi } from "../PayloadMapper/PayloadMapper";
import { mapFormToApi as mapInsuranceToApi } from "../PayloadMapper/PayloadMapperInsurance";
import ListAdd from "../ListAddItem/ListAdd";
import { formVehicle } from "./FormSchema/FormVehicle.schema";
import { formAddress } from "./FormSchema/FormAddress.schema";
import { formActive } from "./FormSchema/FormActive.schema";
import { buildOptions, buildOptionsInsurance } from "../BuildFunction/BuildFunction";
import { ActivePostData, ActivePutData, InsurancePostData, InsurancePutData, VehiclePutData } from "../../Adapters/Adapters";
import { formInsurance } from "./FormSchema/FormInsurance.schema";
import ListAddFranchise from "../ListAddItem/ListAddFranchise";
import "./FormActive.css";

export default function FormActive({ mode = "edit", apiData, openModal, onBack, onSave }: FormActiveProps) {
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
  const [newValueText, setNewValueText] = useState("");

  const initialActive    = useRef<Partial<ActiveFormValues>>({});
  const initialVehicle   = useRef<Partial<VehicleFormValues>>({});
  const initialInsurance = useRef<Partial<Insurance>>({});
  
  useEffect(() => {
    if (apiData) {
      if (apiData.active)    { setActiveValues(apiData.active);       initialActive.current    = apiData.active; }
      if (apiData.vehicle)   { setVehicleValues(apiData.vehicle);     initialVehicle.current   = apiData.vehicle; }
      if (apiData.insurance) { setInsurance(apiData.insurance);       initialInsurance.current = apiData.insurance; }
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
          list: [...(prev.franchise_list?.list || []), { description: newItemText, value: newValueText }],
        },
      }));
      setNewItemText("");
      setNewValueText("");
    }
  }, [newItemText, newValueText]);

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

  const hasChanged = (current: object, initial: object): boolean =>
    JSON.stringify(current) !== JSON.stringify(initial);

  const handleSubmit = async () => {
    try {
      const requests: Promise<{ error: boolean; message?: string }>[] = [];

      if (mode === "add") {
        requests.push(ActivePostData(mapActiveToApi(activeValues as ActiveFormValues)));
        if (activeValues.is_vehicle) {
          requests.push(InsurancePostData(mapInsuranceToApi(activeValues as ActiveFormValues, vehicleValues as VehicleFormValues, insurance as Insurance)));
        }
      } else {
        if (hasChanged(activeValues, initialActive.current)) {
          requests.push(ActivePutData(mapActiveToApi(activeValues as ActiveFormValues)));
        }
        if (hasChanged(vehicleValues, initialVehicle.current)) {
          requests.push(VehiclePutData(mapVehicleToApi(vehicleValues as VehicleFormValues)));
        }
        if (hasChanged(insurance, initialInsurance.current)) {
          requests.push(InsurancePutData(mapInsuranceToApi(activeValues as ActiveFormValues, vehicleValues as VehicleFormValues, insurance as Insurance)));
        }
        if (requests.length === 0) {
          openModal?.(false);
          return;
        }
      }

      const results = await Promise.all(requests);
      const failed  = results.find((res) => res.error);
      if (failed) throw new Error(failed.message);

      onSave?.({
        active:    activeValues,
        ...(activeValues.is_vehicle && { vehicle: vehicleValues, insurance }),
      });

      openModal?.(false);
    } catch (error) {
      throw new Error("Erro no envio: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="form-active-overlay" onClick={() => openModal?.(false)}>
      <div className="form-active-modal" onClick={(e) => e.stopPropagation()}>

        <div className="form-active-modal-header">
          <div className="form-active-modal-header-icon">
            <i className="fa fa-cube text-white"></i>
          </div>
          <div>
            <p className="form-active-modal-title">Formulário de Ativo</p>
            <p className="form-active-modal-subtitle">Edite as informações do ativo selecionado</p>
          </div>
          <button className="form-active-modal-close" onClick={() => onBack ? onBack() : openModal?.(false)}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="form-active-modal-body">

          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-header-icon"><i className="fa fa-tag"></i></div>
              <p className="form-section-title">Dados do Ativo</p>
            </div>
            <CustomForm
              notButton={false}
              className="row g-3"
              fieldsets={formActive(activeValues, options.unit, options.departament, options.company, handleActiveChange)}
            />
          </div>

          <ListAdd
            activeValues={activeValues}
            addItem={addItem}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            removeItem={removeItem}
          />

          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-header-icon"><i className="fa fa-map-marker"></i></div>
              <p className="form-section-title">Local da Compra</p>
            </div>
            <CustomForm
              fieldsets={formAddress(activeValues.place_purchase, handleActiveChange)}
              className="row g-3"
              notButton={false}
            />
          </div>

          {activeValues.is_vehicle && (
            <React.Fragment>
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-header-icon"><i className="fa fa-car"></i></div>
                  <p className="form-section-title">Dados do Veículo</p>
                </div>
                <CustomForm
                  notButton={false}
                  fieldsets={formVehicle(vehicleValues, options.fuel, options.driver, handleVehicleChange)}
                  className="row g-3"
                />
              </div>

              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-header-icon"><i className="fa fa-shield"></i></div>
                  <p className="form-section-title">Dados do Seguro</p>
                </div>
                <CustomForm
                  notButton={false}
                  fieldsets={formInsurance(insurance, handleInsuranceChange)}
                  className="row g-3"
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
            </React.Fragment>
          )}

        </div>

        <div className="form-active-modal-footer">
          <button className="btn-form-cancel" onClick={() => onBack ? onBack() : openModal?.(false)}>
            Cancelar
          </button>
          <button className="btn-form-save" onClick={handleSubmit}>
            <i className="fa fa-save"></i> Salvar
          </button>
        </div>

      </div>
    </div>
  );
}