import React, { useEffect, useState, useMemo, useCallback } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { useConnection } from "../../../../../Context/ConnContext";
import { 
  ActiveType, Company, Driver, FuelType, Unit 
} from "../../Interfaces/Interfaces";
import { formActive, formAddress, formVehicle } from "./FormActiveSchema";
import { ActiveFormValues, VehicleFormValues } from "./FormActiveInterface";

interface FormActiveProps {
  apiData?: {
    active?: ActiveFormValues;
    vehicle?: VehicleFormValues;
    driver?: Driver[];
    company?: Company[];
    unit?: Unit[];
    activeType?: ActiveType[];
    fuelType?: FuelType[];
  };
}

export default function FormActive({ apiData }: FormActiveProps) {
  const { fetchData } = useConnection();

  const [activeValues, setActiveValues] = useState<Partial<ActiveFormValues>>({
    brand: "",
    model: "",
    is_vehicle: true,
    list_items: { list: [] }
  });

  const [vehicleValues, setVehicleValues] = useState<Partial<VehicleFormValues>>({
    license_plates: "",
  });

  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    if (apiData) {
      if (apiData.active) setActiveValues(apiData.active);
      if (apiData.vehicle) setVehicleValues(apiData.vehicle);
    }
  }, [apiData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (name.startsWith('place_purchase.')) {
      const field = name.split('.')[1];
      setActiveValues(prev => ({
        ...prev,
        place_purchase: { ...(prev.place_purchase || {}), [field]: fieldValue }
      }));
    } else if (name in (activeValues || {})) {
      setActiveValues(prev => ({ ...prev, [name]: fieldValue }));
    } else {
      setVehicleValues(prev => ({ ...prev, [name]: fieldValue }));
    }
  }, [activeValues]);

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    setActiveValues((prev: any) => ({
      ...prev,
      list_items: {
        list: [...(prev.list_items?.list || []), newItemText]
      }
    }));
    setNewItemText("");
  };

  const removeItem = (indexToRemove: number) => {
    setActiveValues((prev: any) => ({
      ...prev,
      list_items: {
        list: (prev.list_items?.list || []).filter((
            i: any
            , index: number) => index !== indexToRemove)
      }
    }));
  };

  const options = useMemo(() => ({
    company: apiData?.company?.map(c => ({ label: c.corporate_name, value: String(c.comp_id) })) || [],
    unit: apiData?.unit?.map(u => ({ label: u.unit_name, value: String(u.unit_id) })) || [],
    driver: apiData?.driver?.map(d => ({ label: d.name, value: String(d.driver_id) })) || [],
    fuel: apiData?.fuelType?.map(f => ({ label: f.description, value: String(f.id_fuel_type) })) || [],
  }), [apiData]);

  const handleSubmit = async () => {
    try {
      const payload = mapFormToApi(activeValues as ActiveFormValues, vehicleValues as VehicleFormValues);
      const res = await fetchData({
        method: "POST",
        params: payload,
        pathFile: "GAPP_V2/Active.php",
        urlComplement: "&v2=1&smart=ON",
      });
      if (res.error) throw new Error(res.message);
      alert("Ativo salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro no envio:", error.message);
    }
  };

  return (
    <div className="position-absolute top-0 start-0 vw-100 vh-100 bg-dark bg-opacity-25 d-flex flex-column align-items-center justify-content-center">
      <div className="bg-white container h-75 w-75 overflow-auto p-4 rounded shadow">
        <h2 className="bg-secondary text-white p-2 rounded-top mb-2">Formulário de Ativo</h2>
        
        <CustomForm 
          notButton={false}
          fieldsets={
            // @ts-ignore
            formActive(activeValues, options.unit, options.company, options.driver, handleChange)}
          className="row g-3 mb-4"
        />

        <div className="mb-4 p-3 border rounded bg-light">
          <label className="form-label fw-bold">Itens Adicionais</label>
          <div className="d-flex gap-2 mb-3">
            <input 
              className="form-control" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Ex: Extintor, Estepe..."
            />
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              <i className="fa fa-plus text-white"></i>
            </button>
          </div>
          
          <ul className="list-group">
            {activeValues.list_items?.list?.map((item, index) => (
              <li key={`${item}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                {item}
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => removeItem(index)}
                >
                  <i className="fa fa-trash text-white"></i>
                </button>
              </li>
            ))}
            {(!activeValues.list_items?.list?.length) && (
              <span className="text-muted small">Nenhum item adicionado.</span>
            )}
          </ul>
        </div>

        <h2 className="bg-secondary text-white p-2 rounded-top mb-2">Local da Compra</h2>
        <CustomForm
          fieldsets={formAddress(
            // @ts-ignore
            activeValues, handleChange)}
          className="row g-3 mb-4"
          notButton={false}
        />

        {activeValues.is_vehicle && (
          <>
            <h2 className="bg-secondary text-white p-2 rounded-top mb-2">Dados do Veículo</h2>
            <CustomForm
              notButton={false}
              fieldsets={formVehicle(vehicleValues, options.fuel, handleChange)}
              className="row g-3 mb-4"
            />
          </>
        )}
      </div>

      <div className="mt-3">
        <button className="btn btn-success btn-lg px-5" onClick={handleSubmit}>
          Salvar Ativo
        </button>
      </div>
    </div>
  );
}

export function mapFormToApi(active: ActiveFormValues, vehicle: VehicleFormValues) {
  return {
    active: {
      ...active,
      is_vehicle: active.is_vehicle ? 1 : 0,
      list_items: JSON.stringify(active.list_items || { list: [] }),
      place_purchase: JSON.stringify(active.place_purchase || {})
    },
    vehicle: {
      ...vehicle,
      shielding: vehicle.shielding ? 1 : 0
    }
  };
}