import React, { useEffect, useState } from "react";
import { useConnection } from "../../../Context/ConnContext";
import CustomTable from "../../../Components/CustomTable";
import { IManagerProps } from "./Interfaces/IManager";
import { formatDateBR } from "../../../Util/Util";
require("./Style.css");

function Manager({ setSelectedProduct }: IManagerProps) {
  const { fetchData } = useConnection();
  const [tableData, setTableData] = useState<any[]>([]);
  const productCache = new Map<number, any>();

  // Carrega os dados iniciais da tabela
  async function loadData() {
    try {
      const data = await fetchData({
        method: "GET",
        pathFile: "GEPP/Product.php",
        params: null,
        urlComplement: "&all=1",
        exception: ["no data"],
      });

      if (data.error) throw new Error(data.message);

      if (!data.data || data.data.length === 0) {
        setTableData([]);
        return;
      }

      const mapped = data.data
      .map((p: any) => ({
        id_products: { value: p.id_products, tag: "ID" },
        ean: { value: p.ean, tag: "EAN" },
        description: { value: p.description, tag: "Descrição" },
        price: { value: `R$ ${p.price}`, tag: "Preço" },
        new_price: { value: `R$ ${p.new_price}`, tag: "Novo Preço" },
        quantity: { value: p.quantity, tag: "Qtd" },
        expiration_date: { value: formatDateBR(p.expiration_date), tag: "Validade" },
        store_number: { value: storeString(p.store_number), tag: "Loja" },
        id_status_step_fk: {value: statusStepString(p.id_status_step_fk), tag: "Status"  },
      }));

      setTableData(mapped);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    }
  }

  function statusStepString(value: string): string {
    const map: Record<string, any> = {
      '1': <strong className="text-purple">Analise</strong>,
      '2': <strong className="text-success">Aprovado</strong>,
      '3': <strong className="text-danger">Reprovado</strong>,
      '4': <strong className="text-dark">Finalizado</strong>
    }
    return map[value] ?? "Desconhecido";
  }

  function storeString(value: string): string {
    const map: Record<string, any> = {
      '1': <strong>Interlagos</strong>
    }

    return map[value] ?? "Desconhecido";
  }


  useEffect(() => {
    loadData();
  }, []);

  // Handle para produtos selecionados
  async function handleConfirmList(selected: any[]) {
    if (!selected || selected.length === 0) return;

    try {
      // Faz fetch de todos os produtos em paralelo
      const fetchPromises = selected.map(async (item) => {
        const id = item.id_products.value;

        // Usa cache se disponível
        if (productCache.has(id)) return productCache.get(id);

        const firstData = await fetchData({
          method: "GET",
          pathFile: "GEPP/Product.php",
          params: null,
          urlComplement: `&id=${id}&c5=1`,
          exception: ["no data"],
        });

        const secondData = await fetchData({
          method: "GET",
          pathFile: "GEPP/Product.php",
          params: null,
          urlComplement: `&id=${id}`,
          exception: ["no data"],
        });

        // Combina os resultados
        const combined = [(firstData.data || []), (secondData.data || [])];

        // Salva no cache
        productCache.set(id, combined);

        return combined;
      });

      const results = await Promise.all(fetchPromises);
      const unifiedData = results;

      setSelectedProduct?.(unifiedData);
    } catch (error: any) {
      console.error("Erro ao buscar produtos selecionados:", error.message);
    }
  }

  return (
    <div className={`container ${tableData.length > 0 ? null : 'h-100' }`}>
      {tableData.length > 0 ? (
        <CustomTable
          list={tableData}
          onConfirmList={handleConfirmList}
          selectionKey="id_products"
          hiddenButton={false}
        />
      ) : (
        <div className="empty-state h-100">
          <i className="fas fa-box-open empty-icon" aria-hidden="true"></i>
          <h2>Nenhum produto encontrado</h2>
          <p>Os dados que você está procurando não foram encontrados.</p>
        </div>
      )}
    </div>
  );
}

export default Manager;
