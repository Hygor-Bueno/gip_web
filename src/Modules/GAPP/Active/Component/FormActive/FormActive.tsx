import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { ActiveFormValues, FormActiveProps, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";
import { mapActiveToApi, mapActivePostToApi, mapVehicleToApi, mapVehiclePostToApi } from "../PayloadMapper/PayloadMapper";
import { mapFormToApi as mapInsuranceToApi } from "../PayloadMapper/PayloadMapperInsurance";
import ListAdd from "../ListAddItem/ListAdd";
import { formVehicle } from "./FormSchema/FormVehicle.schema";
import { formAddress } from "./FormSchema/FormAddress.schema";
import { formActive } from "./FormSchema/FormActive.schema";
import { buildOptions, buildOptionsInsurance } from "../BuildFunction/BuildFunction";
import { ActivePostData, ActivePutData, InsurancePostData, InsurancePutData, VehiclePostData, VehiclePutData } from "../../Adapters/Adapters";
import { useMyContext } from "../../../../../Context/MainContext";
import { formInsurance } from "./FormSchema/FormInsurance.schema";
import ListAddFranchise from "../ListAddItem/ListAddFranchise";
import "./FormActive.css";

export default function FormActive({ mode = "edit", gappUserId, gappWorkGroupId, apiData, openModal, onBack, onSave }: FormActiveProps) {
  const { userLog } = useMyContext();
  const today = new Date().toISOString().split('T')[0];

  const [activeValues, setActiveValues] = useState<Partial<ActiveFormValues>>({
    brand: "",
    model: "",
    is_vehicle: true,
    list_items: { list: [] },
    place_purchase: {},
    change_date: today,
    user_id_fk: gappUserId ?? userLog?.id,
    work_group_fk: gappWorkGroupId ?? undefined,
  });

  const [vehicleValues, setVehicleValues] = useState<Partial<VehicleFormValues>>({
    license_plates: "",
    shielding: false,
  });

  const [insurance, setInsurance] = useState<Partial<Insurance>>({
    risk_cep: "",
  });

  const [hasInsurance, setHasInsurance] = useState(false);

  const [newItemText, setNewItemText] = useState("");
  const [newValueText, setNewValueText] = useState("");

  const initialActive    = useRef<Partial<ActiveFormValues>>({});
  const initialVehicle   = useRef<Partial<VehicleFormValues>>({});
  const initialInsurance = useRef<Partial<Insurance>>({});
  
  useEffect(() => {
    if (apiData) {
      if (apiData.active)    {
        // Normaliza is_vehicle para boolean — a API retorna 0/1 (number)
        const normalized = { ...apiData.active, is_vehicle: Boolean(apiData.active.is_vehicle) };
        setActiveValues(normalized);
        initialActive.current = normalized;
      }
      if (apiData.vehicle)   { setVehicleValues(apiData.vehicle);     initialVehicle.current   = apiData.vehicle; }
      if (apiData.insurance) { setInsurance(apiData.insurance);       initialInsurance.current = apiData.insurance; }

      // Detecta automaticamente pelos dados carregados
      const ins = apiData.insurance as any;
      setHasInsurance(!!(ins?.policy_number || ins?.ins_id_fk || ins?.insurance_value));
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

    if (name === "fuel_type_id_fk") {
      // Backend requires both the ID and the text label — mirror old GAPP line 210-211
      const selectedText = (e.target as HTMLSelectElement).options[
        (e.target as HTMLSelectElement).selectedIndex
      ]?.text ?? "";
      setVehicleValues(prev => ({ ...prev, fuel_type_id_fk: value, fuel_type: selectedText }));
    } else {
      setVehicleValues(prev => ({ ...prev, [name]: fieldValue }));
    }
  }, []);

  const handleInsuranceChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setInsurance(prev => ({ ...prev, [name]: fieldValue }));
  }, []);

  const handleVehicleToggle = useCallback(() => {
    const turningOff = !!activeValues.is_vehicle;
    setActiveValues(prev => ({ ...prev, is_vehicle: !prev.is_vehicle }));
    if (turningOff) {
      setVehicleValues({ license_plates: "", shielding: false });
      setInsurance({ risk_cep: "" });
      setHasInsurance(false);
    }
  }, [activeValues.is_vehicle]);

  const handleInsuranceToggle = useCallback(() => {
    setHasInsurance(prev => {
      if (prev) setInsurance({ risk_cep: "" });
      return !prev;
    });
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

  const hasChanged = (current: object, initial: object): boolean =>
    JSON.stringify(current) !== JSON.stringify(initial);

  const handleSubmit = async () => {
    try {
      const requests: Promise<{ error: boolean; message?: string }>[] = [];

      if (mode === "add") {
        requests.push(ActivePostData(mapActivePostToApi(
          activeValues as ActiveFormValues,
          vehicleValues as VehicleFormValues
        )));
      } else {
        if (hasChanged(activeValues, initialActive.current)) {
          requests.push(ActivePutData(mapActiveToApi(activeValues as ActiveFormValues)));
        }
        if (hasChanged(vehicleValues, initialVehicle.current)) {
          const vehicleId = (vehicleValues as VehicleFormValues).vehicle_id;
          if (vehicleId) {
            // Veículo já existe — atualiza com PUT (vehicle_id vem do estado carregado)
            requests.push(VehiclePutData(mapVehicleToApi(vehicleValues as VehicleFormValues)));
          } else {
            // Ativo convertido para veículo — cria novo registro com POST
            const activeId = (activeValues as any).active_id;
            requests.push(VehiclePostData(mapVehiclePostToApi(vehicleValues as VehicleFormValues, activeId)));
          }
        }
        if (hasInsurance && hasChanged(insurance, initialInsurance.current)) {
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
        ...(Boolean(activeValues.is_vehicle) ? { vehicle: vehicleValues, insurance } : {}),
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

          {/* ── Toggle buttons ─────────────────────────────────────── */}
          <div className="section-toggle-row">
            <button
              type="button"
              className={`btn-section-toggle ${activeValues.is_vehicle ? "active" : ""}`}
              onClick={handleVehicleToggle}
            >
              <i className="fa fa-car"></i>
              Este ativo é um veículo
              <span className="toggle-track">
                <span className="toggle-knob" />
              </span>
            </button>

            {Boolean(activeValues.is_vehicle) && (
              <button
                type="button"
                className={`btn-section-toggle ${hasInsurance ? "active" : ""}`}
                onClick={handleInsuranceToggle}
              >
                <i className="fa fa-shield"></i>
                Este veículo possui seguro
                <span className="toggle-track">
                  <span className="toggle-knob" />
                </span>
              </button>
            )}
          </div>

          {/* ── Vehicle section ────────────────────────────────────── */}
          {Boolean(activeValues.is_vehicle) && (
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
          )}

          {/* ── Insurance section ──────────────────────────────────── */}
          {Boolean(activeValues.is_vehicle) && hasInsurance && (
            <React.Fragment>
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