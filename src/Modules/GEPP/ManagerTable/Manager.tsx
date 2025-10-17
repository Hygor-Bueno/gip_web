import React, { useEffect, useState, useCallback } from "react";
import { useConnection } from "../../../Context/ConnContext";
import CustomTable from "../../../Components/CustomTable";
import { IManagerProps } from "./Interfaces/IManager";
import { convertForTable, formatDateBR, handleNotification } from "../../../Util/Util";
import { EStatusProduct } from "./Enum/statusProduct";
import CustomForm from "../../../Components/CustomForm";
require("./Style.css");

const customTags = {
  id_products: "ID",
  ean: "EAN",
  description: "Descrição",
  price: "Preço",
  new_price: "Novo Preço",
  quantity: "Qtd",
  expiration_date: "Validade",
  store_number: "Loja",
  id_status_step_fk: "Etapa",
  created_name: "Criador"
};

function Manager({ setSelectedProduct, loadList, setCardProd }: IManagerProps) {
  const { fetchData } = useConnection();

  // tabela
  const [tableData, setTableData] = useState<any[]>([]);
  const [stepStatus, setStepStatus] = useState<{ id_status: string; description: string; step?: string }[]>([]);

  // filtros
  const [eanSearch, setEanSearch] = useState("");
  const [firstDate, setFirstDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [statusProduct, setStatusProduct] = useState<number>(1);

  // cache de produtos
  const productCache = new Map<number, any>();

  // opções de select
  const storeOptions: any[] = [{ value: 1, label: "Interlagos" }];
  const statusOptions: any[] = [
    { value: EStatusProduct.DELETED, label: "Deletados/Reprovados" },
    { value: EStatusProduct.ACTIVE, label: "Ativos" },
    { value: EStatusProduct.EXECUTED, label: "Executados" },
    { value: EStatusProduct.FINALIZED, label: "Finalizados" },
  ];
  // fieldsets para CustomForm
  const filterFieldsets = [
    {
      attributes: { className: "p-3 bg-light rounded shadow-sm mb-3 d-flex flex-wrap gap-2" }, // deixa os campos em linha
      item: {
        classLabel: "fw-bold mb-2 text-dark w-100", // label do grupo ocupa a linha inteira
        captureValue: [
          { type: "text", value: eanSearch, placeholder: "EAN", className: "form-control form-control-sm d-inline-block", style: { width: "120px" }, onChange: (e: any) => setEanSearch(e.target.value) },
          { type: "date", value: firstDate, placeholder: "Data Inicial", className: "form-control form-control-sm d-inline-block", style: { width: "120px" }, onChange: (e: any) => setFirstDate(e.target.value) },
          { type: "date", value: lastDate, placeholder: "Data Final", className: "form-control form-control-sm d-inline-block", style: { width: "120px" }, onChange: (e: any) => setLastDate(e.target.value) },
          { type: "date", value: expirationDate, placeholder: "Validade", className: "form-control form-control-sm d-inline-block", style: { width: "120px" }, onChange: (e: any) => setExpirationDate(e.target.value) },
          { type: "select", value: storeSearch, options: storeOptions, className: "form-select wd-auto form-select-sm d-inline-block", onChange: (e: any) => setStoreSearch(e.target.value) },
          { type: "select", value: statusProduct, options: statusOptions, className: "form-select wd-auto form-select-sm d-inline-block", style: { width: "140px" }, onChange: (e: any) => setStatusProduct(Number(e.target.value)) },
        ],
      },
      legend: { text: "Filtros", style: "fs-5 fw-bold text-secondary mb-2" },
    },
  ];

  // busca status das etapas
  async function getStatusStep() {
    try {
      const response = await fetchData({
        method: "GET",
        pathFile: "GEPP/StatusStep.php",
        params: null,
        urlComplement: "&all=1",
        exception: ["no data"],
      });
      if (!response || response.error) throw new Error(response?.message);
      setStepStatus(response.data || []);
    } catch (error: any) {
      handleNotification("Erro!", error.getMessage(), "danger");
    }
  }

  function buildFilters() {
    const filters: Record<string, string | number> = {};
    if (eanSearch) filters.eanGepp = eanSearch;
    if (firstDate) filters.first_date = firstDate;
    if (lastDate) filters.last_date = lastDate;
    if (storeSearch) filters.store_number = storeSearch;
    if (expirationDate) filters.expiration_date = expirationDate;
    if (statusProduct != null) filters.status_product = statusProduct;
    if (Object.keys(filters).length === 0) filters.all = 1;
    return Object.entries(filters)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
  }

  async function loadData() {
    try {
      const data = await fetchData({
        method: "GET",
        pathFile: "GEPP/Product.php",
        params: null,
        urlComplement: `&isWeb=1`,
        exception: ["no data"],
      });
      if(data.error) throw new Error(data.message);
      setTableData(data.data);
    } catch (error: any) {
      setTableData([]);
    }
  }

  async function handleConfirmList(selected: any[]) {
    if (!selected || selected.length === 0) return;
    try {
      const fetchPromises = selected.map(async (item) => {
        const id = item.id_products.value;

        if (productCache.has(id)) return productCache.get(id);

        const [firstData, secondData] = await Promise.all([
          fetchData({ method: "GET", pathFile: "GEPP/Progress.php", params: null, urlComplement: `&id=${id}`, exception: ["no data"] }),
          fetchData({ method: "GET", pathFile: "GEPP/Product.php", params: null, urlComplement: `&id=${id}`, exception: ["no data"] }),
        ]);

        const combined = [firstData.data || [], secondData.data || []];
        productCache.set(id, combined);
        return combined;
      });
      const results = await Promise.all(fetchPromises);
      setSelectedProduct?.(results);
    } catch (error: any) {
      console.error("Erro ao buscar produtos selecionados:", error.message);
    }
  }

  function resetFilters() {
    setEanSearch("");
    setFirstDate("");
    setLastDate("");
    setStoreSearch("");
    setExpirationDate("");
    setStatusProduct(1);
    loadData();
  }

  // debounce automático
  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [eanSearch, firstDate, lastDate, storeSearch, expirationDate, statusProduct, stepStatus]);

  useEffect(() => { getStatusStep(); }, []);
  useEffect(() => { if (loadList) loadList(loadData); }, [loadList]);

  return (
    <div className="p-4 h-75 w-100">
      <div className="d-flex align-items-end gap-2 mt-2 w-100 justify-content-end mb-3">
        <button className="btn btn-danger btn-sm d-flex align-items-center gap-2" onClick={resetFilters}>
          <i className="fa-solid fa-eraser text-white"></i>Limpar
        </button>
      </div>

      {/* CustomForm substituindo todos os filtros */}
      <CustomForm
        fieldsets={filterFieldsets}
        notButton={false}
        titleButton="Filtrar"
        typeButton="button"
        onAction={loadData}
      />

      {tableData.length > 0 ? (
        <CustomTable list={convertForTable(tableData, { customTags })} onConfirmList={(event)=>{handleConfirmList(event);setCardProd(true)}} selectionKey="id_products" hiddenButton={false} />
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
