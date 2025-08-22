import React, { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useConnection } from "../../../../Context/ConnContext";

interface SelectTaskItemProps {
  data?: {
    // Array com as relações já existentes vindas do banco
    csds: { company_id: number; shop_id: number; depart_id: number }[];
    id: number;
    setcheckTaskComShoDepSub: any;
  };
}

const SelectTaskItem: React.FC<SelectTaskItemProps> = (props) => {
  const { data } = props;
  const { loadTasks, checkTaskComShoDepSub } = useWebSocket();
  const { fetchData } = useConnection();

  // --- ESTADOS ---

  // Opções para os seletores
  const [companyOptions, setCompanyOptions] = useState<
    { id: number; description: string }[]
  >([]);
  const [shopOptions, setShopOptions] = useState<
    { id: number; description: string }[]
  >([]);
  const [departmentOptions, setDepartmentOptions] = useState<
    { id: number; description: string }[]
  >([]);

  // Valores selecionados pelo usuário
  const [selectedCompany, setSelectedCompany] = useState<number | "">(
    data?.csds[0]?.company_id || ""
  );
  const [selectedShop, setSelectedShop] = useState<number | "">(
    data?.csds[0]?.shop_id || ""
  );

  // ✅ CORREÇÃO: Inicializa o estado como um array de IDs de departamentos que já vêm do banco.
  // Usamos .map() para extrair todos os depart_id do array csds.
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>(
    data?.csds?.map((item) => item.depart_id) || []
  );

  // Controle de visibilidade da lista de departamentos
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);

  // --- EFEITOS PARA BUSCAR DADOS (DATA FETCHING) ---

  // Busca todas as companhias na montagem do componente
  useEffect(() => {
    async function fetchCompanyData() {
      const response: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "CCPP/Company.php",
      });
      if (response?.data) {
        setCompanyOptions(response.data);
      }
    }
    fetchCompanyData();
  }, [fetchData]);

  // Busca as lojas sempre que uma companhia for selecionada
  useEffect(() => {
    // Só busca se uma companhia estiver selecionada
    if (selectedCompany) {
      async function fetchShopData() {
        const response: any = await fetchData({
          method: "GET",
          params: null,
          pathFile: "CCPP/Shop.php",
          urlComplement: `&company_id=${selectedCompany}`,
        });
        if (response?.data) {
          setShopOptions(response.data);
        }
      }
      fetchShopData();
    } else {
      // Limpa as opções de loja se nenhuma companhia for selecionada
      setShopOptions([]);
    }
  }, [selectedCompany, fetchData]);

  // Busca os departamentos sempre que uma loja for selecionada
  useEffect(() => {
    if (selectedShop) {
      async function fetchDepartmentData() {
        const response: any = await fetchData({
          method: "GET",
          params: null,
          pathFile: "CCPP/Department.php",
          urlComplement: `&shop_id=${selectedShop}`,
        });
        if (response?.data) {
          setDepartmentOptions(response.data);
        }
      }
      fetchDepartmentData();
    } else {
      // Limpa as opções de departamento se nenhuma loja for selecionada
      setDepartmentOptions([]);
    }
  }, [selectedShop, fetchData]);

  // --- MEMOIZAÇÃO ---

  // useMemo para ordenar as companhias apenas quando a lista mudar, otimizando a performance.
  const sortedCompanies = useMemo(() => {
    return [...companyOptions].sort((a, b) =>
      a.description.localeCompare(b.description)
    );
  }, [companyOptions]);

  // --- MANIPULADORES DE EVENTOS (EVENT HANDLERS) ---

  // ✅ LÓGICA: Atualiza a companhia selecionada e reseta a loja e os departamentos.
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = Number(e.target.value);
    setSelectedCompany(companyId);
    // Reseta a seleção de loja e departamentos para forçar o usuário a escolher novamente
    setSelectedShop("");
    setDepartmentOptions([]);
    setIsDepartmentsOpen(false); // Fecha a lista de departamentos
  };

  // ✅ LÓGICA: Atualiza a loja selecionada.
  const handleShopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shopId = Number(e.target.value);
    setSelectedShop(shopId);
    setIsDepartmentsOpen(false); // Fecha a lista para recarregar com os novos deps
  };

  // ✅ LÓGICA: Adiciona ou remove um departamento da lista de selecionados.
  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    departmentId: number
  ) => {
    try {
      const isChecked = e.target.checked;
      const reqCSDS:any = await checkTaskComShoDepSub(
        data?.id || 0,
        Number(selectedCompany),
        Number(selectedShop),
        departmentId,
        data?.id
      );
      if(reqCSDS["error"]) throw new Error(reqCSDS["message"]);

      if (isChecked) {
        setSelectedDepartments((prev) => [...prev, departmentId]);
        // Envia os dados para o WebSocket/Contexto
      } else {
        setSelectedDepartments((prev) =>
          prev.filter((id) => id !== departmentId)
        );
        // Aqui você poderia adicionar uma função para "desmarcar" no backend se necessário
      }

      await loadTasks(); // Recarrega as tarefas após a alteração
    } catch (error:any) {
      console.error("Erro ao atualizar o departamento:", error.message || error);
    }
  };

  // --- RENDERIZAÇÃO ---

  return (
    <div>
      <div className="d-flex gap-3">
        {/* Seletor de Companhia */}
        <select
          className="form-select"
          value={selectedCompany}
          onChange={handleCompanyChange}
        >
          <option value="">Selecione uma companhia</option>
          {sortedCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.description}
            </option>
          ))}
        </select>

        {/* ✅ LÓGICA: Seletor de Loja - Habilitado apenas se uma companhia for selecionada */}
        <select
          className="form-select"
          value={selectedShop}
          onChange={handleShopChange}
          disabled={!selectedCompany} // Desabilita se não houver companhia
        >
          <option value="">Selecione uma loja</option>
          {shopOptions.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.description}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ LÓGICA: Botão de Departamentos - Habilitado apenas se uma loja for selecionada */}
      <button
        className="btn border-light w-100 mt-2 hover-bg-primary"
        onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
        disabled={!selectedShop} // Desabilita se não houver loja
      >
        Departamentos
      </button>

      {/* Lista de Departamentos (Checkboxes) */}
      <div>
        {isDepartmentsOpen && departmentOptions.length > 0 && (
          <div className="form-control mt-2 p-3 department-list">
            {departmentOptions.map((dep: any) => (
              <label className="form-check d-block form-check-inline" key={dep.id} >
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={dep.id}
                  // ✅ LÓGICA: Marca o checkbox se o ID do departamento estiver no nosso array de estado.
                  checked={selectedDepartments.includes(dep.id)}
                  onChange={(e) => handleCheckboxChange(e, dep.id)}
                />
                <strong>{dep.description}</strong>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Estilos (mantidos como no original) */}
      <style>{`
        .hover-bg-primary {
            transition: all 0.5s ease;
        }
        .hover-bg-primary:hover {
            background-color: #2b63c9 !important;
            color: #fff !important;
            border-color: #2b63c9 !important;
        }
        .border-light {
            border: 1px solid #e0e0e0 !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.25rem !important;
        }
        .department-list {
            max-height: clamp(200px, 25vh, 450px);
            overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default SelectTaskItem;
