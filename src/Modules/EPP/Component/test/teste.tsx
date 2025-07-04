import React, { useEffect, useState } from "react";
// import LogSales from "../Models/LogSales"; // ajuste o path conforme necessário

type Props = {
  eppIdLog: string;
  eppIdProduct: string;
  eppIdOrder: string;
  quantity: number;
  price: number;
  menu: string;
  description: string;
  measure: string;
  base_item: boolean;
};

const LogSalesComponent: React.FC<Props> = ({
  eppIdLog,
  eppIdProduct,
  eppIdOrder,
  quantity,
  price,
  menu,
  description,
  measure,
  base_item,
}) => {
  const [logSaleInstance, setLogSaleInstance] = useState(null);
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [priceBase, setPriceBase] = useState<string>("0.00");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      //@ts-ignore
      const instance = new LogSales(
        eppIdLog,
        eppIdProduct,
        eppIdOrder,
        quantity,
        price,
        menu,
        description,
        measure,
        base_item
      );

      const result = await instance.addItem();
      if (result.error) {
        setError(result.message);
      } else {
        const desc = instance.getDescription();
        const priceB = instance.getPrice_base();
        setDescriptionText(desc);
        setPriceBase(priceB);
        setLogSaleInstance(instance);
      }
    };

    init();
  }, [
    eppIdLog,
    eppIdProduct,
    eppIdOrder,
    quantity,
    price,
    menu,
    description,
    measure,
    base_item,
  ]);

  if (error) {
    return <div className="text-red-500">Erro: {error.toString()}</div>;
  }

  if (!logSaleInstance) {
    return <div className="text-gray-500">Carregando item...</div>;
  }

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-semibold mb-2">Produto Adicionado</h2>
      <p><strong>Descrição:</strong> {descriptionText}</p>
      <p><strong>Preço Base:</strong> R$ {priceBase}</p>
      {/*@ts-ignore */}
      <p><strong>Medida:</strong> {logSaleInstance.getMeasure()}</p>
      {/*@ts-ignore */}
      <p><strong>É item base:</strong> {logSaleInstance.getBase_item() ? "Sim" : "Não"}</p>
    </div>
  );
};

export default LogSalesComponent;
