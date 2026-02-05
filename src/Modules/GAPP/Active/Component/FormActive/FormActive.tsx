import React, { useEffect, useState, useMemo, useCallback } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { useConnection } from "../../../../../Context/ConnContext";
import { ActiveFormValues, FormActiveProps, VehicleFormValues } from "./FormInterfaces/FormActiveInterface";
import { mapFormToApi } from "../DataMapper/DataMapper";
import ListAdd from "../ListAddItem/ListAdd";
import { formVehicle } from "./FormSchema/FormVehicle.schema";
import { formAddress } from "./FormSchema/FormAddress.schema";
import { formActive } from "./FormSchema/FormActive.schema";
import { buildOptions } from "../BuildFunction/BuildFunction";
import { ActivePostData } from "../../Hooks/ActiveHook";

/** 
  Esse Componente de formulario tem como obtivo de registrar/editar os ativos, endereço e se for um 
  Veiculo ele registra todas as informações de um veiculo também.
*/
export default function FormActive({ apiData, openModal }: FormActiveProps) {
  const { fetchData } = useConnection();

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

  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    if (apiData) {
      if (apiData.active) setActiveValues(apiData.active);
      if (apiData.vehicle) setVehicleValues(apiData.vehicle);
    }
  }, [apiData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue =
    type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : value;

    if (name === 'is_vehicle') {
      fieldValue = value === '1';
    } else if (name === 'shielding') {
      fieldValue = value === '1';
    }

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
    
    setActiveValues((prev) => ({
      ...prev,
      list_items: {
        list: [...(prev.list_items?.list || []), newItemText],
      },
    }));
    setNewItemText("");
  };

  const removeItem = (indexToRemove: number) => {
    setActiveValues((prev) => ({
      ...prev,
      list_items: {
        list: (prev.list_items?.list || []).filter((
            i
            , index: number) => index !== indexToRemove)
      }
    }));
  };

  // Para o options não ficar complexo construi um build para simplificar 
  // a montagem das opções e passalas para frente em cada form mapeado.
  const options = useMemo(() => buildOptions(apiData), [apiData])

  const handleSubmit = async () => {
    try {
      // usando o mapFormToApi para montar o payload para enviar para o backend.
      const payload = mapFormToApi(activeValues as ActiveFormValues, vehicleValues as VehicleFormValues);
      const res = await ActivePostData(payload);

      // const res = await fetchData({
      //   method: "POST",
      //   params: payload,
      //   pathFile: "GAPP_V2/Active.php",
      //   urlComplement: "&v2=1&smart=ON",
      // });

      if (res.error) throw new Error(res.message);
      alert("Ativo salvo com sucesso!");
    } catch (error) {
      if(error instanceof Error) {
        console.error("Erro no envio:", error.message);
      } else {
        console.error("Erro no envio:", error);
      }
    }
  };

  return (
    <div onClick={() => openModal?.(false)} className="position-absolute top-0 start-0 vw-100 vh-100 bg-dark bg-opacity-25 d-flex flex-column align-items-center justify-content-center" >
      <div onClick={(e) => e.stopPropagation()} className="bg-white container h-75 w-75 overflow-auto p-4 rounded shadow">
        <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Formulário de Ativo</h2>
        
        <CustomForm 
          notButton={false}
          fieldsets={formActive(activeValues, options.unit, options.departament, options.company, handleChange)}
          className="row g-3 mb-4"
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
          fieldsets={formAddress(activeValues.place_purchase, handleChange)}
          className="row g-3 mb-4"
          notButton={false}
        />
        
        {activeValues.is_vehicle && (
          <React.Fragment>
            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados do Veículo</h2>
            <CustomForm
              notButton={false}
              fieldsets={formVehicle(vehicleValues, options.fuel, options.driver, handleChange)}
              className="row g-3 mb-4"
            />
          </React.Fragment>
        )}
      </div>

      <div className="mt-3">
        <button className="btn color-gipp btn-lg px-5" onClick={handleSubmit}>
          <i className="fa fa-solid fa-save text-white"></i>
        </button>
      </div>
    </div>
  );
}