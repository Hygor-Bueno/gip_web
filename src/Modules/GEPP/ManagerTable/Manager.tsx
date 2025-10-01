import React, { useEffect, useState } from "react";
import { useConnection } from "../../../Context/ConnContext";
import CustomTable from "../../../Components/CustomTable";
import { IManagerProps } from "./Interfaces/IManager";
import { formatDateBR, handleNotification } from "../../../Util/Util";
require("./Style.css");

function Manager({ setSelectedProduct, loadList }: IManagerProps) {
  const { fetchData } = useConnection();
  const [tableData, setTableData] = useState<any[]>([]);
  const [stepStatus, setStepStatus] = useState<any[]>([]);
  const [statusProduct, setStatusProduct] = useState<number>(1);
  const productCache = new Map<number, any>();

  // Load status steps do servidor
  async function getStatusStep() {
    try {
      const response = await fetchData({
        method: "GET",
        pathFile: "GEPP/StatusStep.php",
        params: null,
        urlComplement: "&all=1",
        exception: ["no data"],
      });

      if (!response || response.error) {
        handleNotification(
          "Erro ao buscar status",
          response?.message || "Falha na comunicação com o servidor.",
          "danger"
        );
        return;
      }

      setStepStatus(response.data || []);
    } catch (error) {
      console.error("Erro no getStatusStep:", error);
      handleNotification(
        "Erro inesperado",
        "Ocorreu um erro ao buscar os status de etapa.",
        "danger"
      );
    }
  }

  // Função que retorna JSX com cor do status
  function statusStepString(value: string, stepStatus: { id_status: string; description: string }[]): React.ReactNode {
    const step = stepStatus.find((item) => item.id_status === value);
    if (!step) return <strong className="text-muted">Desconhecido</strong>;

    let className = "text-dark";
    if (value === "1") className = "text-purple";
    else if (value === "2") className = "text-success";
    else if (value === "3") className = "text-danger";

    return <strong className={className}>{step.description}</strong>;
  }

  function storeString(value: string): React.ReactNode {
    const map: Record<string, React.ReactNode> = {
      '1': <strong>Interlagos</strong>,
    };
    return map[value] ?? "Desconhecido";
  }

  // Carrega produtos
  async function loadData() {
    if (!stepStatus.length) return;
    try {
      const data = await fetchData({
        method: "GET",
        pathFile: "GEPP/Product.php",
        params: null,
        urlComplement: `&all=1&status_product=${statusProduct}`,
        exception: ["no data"],
      });

      if (data.error) {
        handleNotification("Não há registros salvos", data.message, "danger");
        setTableData([]);
        return;
      }

      const mapped = (data.data || []).map((p: any) => ({
        id_products: { value: p.id_products, tag: "ID" },
        ean: { value: p.ean, tag: "EAN" },
        description: { value: p.description, tag: "Descrição" },
        price: { value: `R$ ${p.price}`, tag: "Preço" },
        new_price: { value: `R$ ${p.new_price}`, tag: "Novo Preço" },
        quantity: { value: p.quantity, tag: "Qtd" },
        expiration_date: { value: formatDateBR(p.expiration_date), tag: "Validade" },
        store_number: { value: storeString(p.store_number), tag: "Loja" },
        id_status_step_fk: { value: statusStepString(p.id_status_step_fk, stepStatus), tag: "Status" },
      }));

      setTableData(mapped);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    }
  }

  // Handle seleção de produtos
  async function handleConfirmList(selected: any[]) {
    if (!selected || selected.length === 0) return;

    try {
      const fetchPromises = selected.map(async (item) => {
        const id = item.id_products.value;

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

        const combined = [(firstData.data || []), (secondData.data || [])];
        productCache.set(id, combined);
        return combined;
      });

      const results = await Promise.all(fetchPromises);
      setSelectedProduct?.(results);
    } catch (error: any) {
      console.error("Erro ao buscar produtos selecionados:", error.message);
    }
  }

  // useEffect inicial
  useEffect(() => {
    getStatusStep();
  }, []);

  // Reload tabela quando statusProduct muda ou stepStatus é carregado
  useEffect(() => {
    loadData();
  }, [statusProduct, stepStatus]);

  useEffect(() => {
    if (loadList) loadList(loadData);
  }, [loadList]);

  return (
    <div className={`container ${tableData.length > 0 ? "" : "h-100"}`}>
      <div className="d-flex w-100 justify-content-between mb-2">
        <button className="btn btn-primary mb-2 fa fa-refresh" onClick={loadData}></button>
        <select
          className="d-block form-select w-50"
          value={statusProduct}
          onChange={(e) => setStatusProduct(Number(e.target.value))}
        >
          <option value={1}>Analise</option>
          <option value={2}>Aprovado/Reprovado</option>
          <option value={3}>Executando</option>
          <option value={4}>Finalizados</option>
        </select>
      </div>

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
