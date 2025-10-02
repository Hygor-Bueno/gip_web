import React, { useEffect, useState } from "react";
import { useConnection } from "../../../Context/ConnContext";
import CustomTable from "../../../Components/CustomTable";
import { IManagerProps } from "./Interfaces/IManager";
import { formatDateBR, handleNotification } from "../../../Util/Util";
require("./Style.css");

function Manager({ setSelectedProduct, loadList }: IManagerProps) {
  const { fetchData } = useConnection();

  const [tableData, setTableData] = useState<any[]>([]);
  const [stepStatus, setStepStatus] = useState<{ id_status: string; description: string, step?: string }[]>([]);
  const [statusProduct, setStatusProduct] = useState<number>(1);
  const [eanSearch, setEanSearch] = useState<string>("");
  const [firstDate, setFirstDate] = useState<string>("");
  const [lastDate, setLastDate] = useState<string>("");
  const [storeSearch, setStoreSearch] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");

  const productCache = new Map<number, any>();

  // Busca status das etapas
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
        handleNotification("Erro ao buscar status", response?.message || "Falha na comunicação com o servidor.", "danger");
        return;
      }

      setStepStatus(response.data || []);
    } catch (error) {
      console.error("Erro no getStatusStep:", error);
      handleNotification("Erro inesperado", "Falha ao buscar status de etapa.", "danger");
    }
  }

  // Converte status em string com cores
  function statusStepString(value: string) {
    const step = stepStatus.find((s) => s.id_status === value);
    if (!step) return <strong className="text-muted">Desconhecido</strong>;

    const classMap: Record<string, string> = {
      "1": "text-purple",
      "2": "text-success",
      "3": "text-danger",
    };

    return <strong className={classMap[value] || "text-dark"}>{step.description}</strong>;
  }

  // Monta filtros para query string
  function buildFilters() {
    const filters: Record<string, string | number> = {};

    if (eanSearch) filters.eanGepp = eanSearch;
    if (firstDate) filters.first_date = firstDate;
    if (lastDate) filters.last_date = lastDate;
    if (storeSearch) filters.store_number = storeSearch;
    if (expirationDate) filters.expiration_date = expirationDate;
    if (statusProduct) filters.status_product = statusProduct;

    // Envia all=1 apenas se nenhum filtro específico estiver ativo
    if (Object.keys(filters).length === 0) {
      filters.all = 1;
    }

    return Object.entries(filters)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
  }

  // Carrega dados da tabela
  async function loadData() {
    if (!stepStatus.length) return;

    try {
      const filters = buildFilters();
      const data = await fetchData({
        method: "GET",
        pathFile: "GEPP/Product.php",
        params: null,
        urlComplement: `&${filters}`,
        exception: ["no data"],
      });

      if (data.error) {
        handleNotification("Sem registros", data.message, "warning");
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
        store_number: { value: p.store_number, tag: "Loja" },
        id_status_step_fk: { value: statusStepString(p.id_status_step_fk), tag: "Status" },
      }));

      setTableData(mapped);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    }
  }

  // Confirma seleção da tabela
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

  // Reseta filtros
  function resetFilters() {
    setEanSearch("");
    setFirstDate("");
    setLastDate("");
    setStoreSearch("");
    setExpirationDate("");
    setStatusProduct(1);
    loadData();
  }

  // Debounce automático para filtros
  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [eanSearch, firstDate, lastDate, storeSearch, expirationDate, statusProduct, stepStatus]);

  useEffect(() => { getStatusStep(); }, []);
  useEffect(() => { if (loadList) loadList(loadData); }, [loadList]);

  return (
    <div className={`container ${tableData.length > 0 ? "" : "h-100"}`}>

      {/* Botões */}
        <div className="d-flex align-items-end gap-2 mt-2 w-100 justify-content-between mb-3">
          <strong>Filtros de pesquisa:</strong>
          <button className="btn btn-secondary btn-sm d-flex align-items-center gap-2" onClick={resetFilters}>
            <i className="fa fa-times me-1 text-white"></i>Limpar
          </button>
        </div>
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        {/* EAN */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">EAN</label>
          <input type="text" className="form-control form-control-sm" placeholder="EAN" value={eanSearch} onChange={(e) => setEanSearch(e.target.value)} />
        </div>

        {/* Data Inicial */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">Data Inicial</label>
          <input type="date" className="form-control form-control-sm" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
        </div>

        {/* Data Final */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">Data Final</label>
          <input type="date" className="form-control form-control-sm" value={lastDate} onChange={(e) => setLastDate(e.target.value)} />
        </div>

        {/* Validade */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">Validade</label>
          <input type="date" className="form-control form-control-sm" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
        </div>

        {/* Loja */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">Loja</label>
          <select className="form-select form-select-sm" value={storeSearch} onChange={(e) => setStoreSearch(e.target.value)}>
            <option value={1}>Interlagos</option>
          </select>
        </div>

        {/* Status */}
        <div className="d-flex flex-column w-auto">
          <label className="fw-bold mb-1 small">Status</label>
          <select className="form-select form-select-sm" value={statusProduct} onChange={(e) => setStatusProduct(Number(e.target.value))}>
            <option value={1}>Análise</option>
            <option value={2}>Aprovado/Reprovado</option>
            <option value={3}>Executando</option>
            <option value={4}>Finalizados</option> 
          </select>
        </div>

        
      </div>

      {tableData.length > 0 ? (
        <CustomTable list={tableData} onConfirmList={handleConfirmList} selectionKey="id_products" hiddenButton={false} />
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
