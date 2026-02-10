import React, { useEffect, useMemo, useState } from "react";
import CustomForm from "../../../Components/CustomForm";
import { formCustomerData } from "./Components/CustomerData/FormCustomerData.schema";
import { formOrderData } from "./Components/CustomerData/FormOrderData.schema";
import { formDelivery } from "./Components/CustomerData/FormDeliveryData.schema";
import { IRegisterConfiguration } from "../Interfaces/General.interfaces";
import { buildOptions } from "../Helpers/Option.helper";
import { IOrder } from "../Interfaces/IOrder.interface";

export default function Register({apiData}: IRegisterConfiguration) {

  const [ordersForm, setOrdersForm] = useState<Partial<IOrder> | any>({
    delivered: "",
  });

  useEffect(() => {
    if (apiData?.order) setOrdersForm(apiData.order[0]);
  }, [apiData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setOrdersForm((prev: any) => ({ ...prev,[name]: fieldValue }));
  }

  const options = useMemo(() => buildOptions(apiData), [apiData]);

  return (
    <React.Fragment>
      <div className="h-100 w-50 d-flex justify-content-center flex-column">
        <div className="bg-white d-flex flex-column gap-3 container h-75 w-75 overflow-auto p-4 rounded shadow">
          <div className="w-100 p-3 bg-light border border-gray rounded">
            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados do cliente</h2>
            <CustomForm
              notButton={false}
              className="row g-3 mb-4"
              fieldsets={formCustomerData(ordersForm, options.delivered, handleChange)}
            />
          </div>
          <div className="w-100 p-3 bg-light border border-gray rounded">
            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados do Pedido</h2>
            <div className="w-100 d-flex justify-content-between mb-2 align-items-center"><label>Dados do pedido:</label> <button className="btn color-gipp"><i className="fa fa-solid fa-plus text-white"></i></button></div>
            <div className="border border-gray mb-3" style={{height: '100px', width: '100%'}}>

            </div>
            <CustomForm
              notButton={false}
              className="row g-3 mb-4"
              fieldsets={formOrderData()}
            />
          </div>
          <div className="w-100 p-3 bg-light border border-gray rounded">
            <h2 className="color-gipp-head text-white p-2 rounded-top mb-2">Dados de entrega</h2>
            <CustomForm
              notButton={false}
              className="row g-3 mb-4"
              fieldsets={formDelivery()}
            />
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center gap-3 w-100 mt-3">
          <button className="btn color-gipp" onClick={() => console.log(apiData)}>
            Inserir
          </button>
          <button className="btn color-gipp">
            Alterar
          </button>
          <button className="btn color-gipp">
            Excluir
          </button>
          <button className="btn color-gipp">
            Limpar
          </button>

          <div className="d-flex gap-2">
            <button className="btn color-gipp">
              <i className="fa fa-solid fa-car text-white"></i>
            </button>
            <button className="btn color-gipp">
              <i className="fa fa-solid fa-print text-white"></i>
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}