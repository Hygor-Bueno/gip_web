import React, { useState } from 'react'
import TableComponent from '../../../../Components/CustomTable';
import { convertForTable } from '../../../../Util/Util';
import { useSalesData } from '../../Hooks/useSalesData';
import "./TableSalesEppStyle.css";

type Props = {
  tableData: any,
  setDataOrder?: any,
  setDataLogSale?: any,
}

const TableSalesEpp = (props: Props) => {
  const [inputValue, setInputValue] = useState("");
  const { fetchLogSale, fetchOrder } = useSalesData();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      const orderId = Number(inputValue.trim());
      if (!isNaN(orderId)) {
        const dataOrder = await fetchOrder(orderId);
        props.setDataOrder(dataOrder);
        setInputValue("");
      } else {
        console.warn("ID do pedido inválido:", inputValue);
      }
    }
  };

  return (
    <div className="mt-4">
      <div>
        <input
          className="form-control w-25 mb-2"
          placeholder="N° do pedido"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='overflow-auto screenTable'>
        {props.tableData.length > 0 && (
          <TableComponent
            maxSelection={1}
            list={convertForTable(props.tableData, {
              ocultColumns: ["menu", "pluMenu", "typeRice", "description", "dessert", "obs", "userId", "idMenu", "deliveryStore", "dateOrder"],
              customTags: {
                idOrder: "N°",
                fone: "Telefone",
                signalValue: "Sinal",
                store: "Loja",
                email: "E-mail",
                nameClient: "Nome do cliente",
                deliveryDate: "Data de entrega",
                deliveryHour: "Hora da entrega",
                delivered: 'Status',
                total: "Total"
              }
            })}
            onConfirmList={async (selected: any) => {
              const val: any = selected[0].idOrder.value;
              // const logData = await fetchLogSale(val);
              const logOrder = await fetchOrder(val);
              props.setDataOrder(logOrder);
              // props.setDataLogSale(logData);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TableSalesEpp;
