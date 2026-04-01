import React, { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useConnection } from "../../../../Context/ConnContext";

interface SelectTaskItemProps {
  data?: {
    csds?: { company_id: number; shop_id: number; depart_id: number }[];
    id?: number;
  };
}

interface Option {
  id: number;
  description: string;
}

const SelectTaskItem: React.FC<SelectTaskItemProps> = ({ data }) => {
  const { loadTasks, checkTaskComShoDepSub } = useWebSocket();
  const { fetchData } = useConnection();

  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [shopOptions, setShopOptions] = useState<Option[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<number | "">(
    data?.csds?.[0]?.company_id || ""
  );

  const [selectedShop, setSelectedShop] = useState<number | "">(
    data?.csds?.[0]?.shop_id || ""
  );

  const [selectedDepartments, setSelectedDepartments] = useState<number[]>(
    data?.csds?.map((item) => item.depart_id) || []
  );

  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);

  const request = async (
    pathFile: string,
    urlComplement: string = ""
  ): Promise<Option[]> => {
    try {
      const response: any = await fetchData({
        method: "GET",
        params: null,
        pathFile,
        urlComplement,
      });

      return response?.data || [];
    } catch (error) {
      console.error(`Error loading ${pathFile}`, error);
      return [];
    }
  };

  useEffect(() => {
    async function loadCompanies() {
      const companies = await request("CCPP/Company.php");
      setCompanyOptions(companies);
    }

    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setShopOptions([]);
      return;
    }

    async function loadShops() {
      const shops = await request(
        "CCPP/Shop.php",
        `&company_id=${selectedCompany}`
      );

      setShopOptions(shops);
    }

    loadShops();
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedShop) {
      setDepartmentOptions([]);
      return;
    }

    async function loadDepartments() {
      const departments = await request(
        "CCPP/Department.php",
        `&shop_id=${selectedShop}`
      );

      setDepartmentOptions(departments);
    }

    loadDepartments();
  }, [selectedShop]);

  const sortedCompanies = useMemo(() => {
    return [...companyOptions].sort((a, b) =>
      a.description.localeCompare(b.description)
    );
  }, [companyOptions]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = Number(e.target.value);

    setSelectedCompany(companyId);
    setSelectedShop("");
    setDepartmentOptions([]);
    setSelectedDepartments([]);
    setIsDepartmentsOpen(false);
  };

  const handleShopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shopId = Number(e.target.value);

    setSelectedShop(shopId);
    setSelectedDepartments([]);
    setIsDepartmentsOpen(false);
  };

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    departmentId: number
  ) => {
    try {
      const isChecked = e.target.checked;

      const req: any = await checkTaskComShoDepSub(
        data?.id || 0,
        Number(selectedCompany),
        Number(selectedShop),
        departmentId,
        data?.id ?? 0
      );

      if (req?.error) throw new Error(req.message);

      setSelectedDepartments((prev) =>
        isChecked
          ? [...prev, departmentId]
          : prev.filter((id) => id !== departmentId)
      );

      await loadTasks();
    } catch (error: any) {
      console.error("Error updating department:", error.message);
    }
  };

  return (
    <div>
      <div className="d-flex gap-3">
        <select
          className="form-select"
          value={selectedCompany}
          onChange={handleCompanyChange}
          disabled={selectedDepartments.length > 0}
        >
          <option value="">Selecione a companhia</option>

          {sortedCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.description}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedShop}
          onChange={handleShopChange}
          disabled={!selectedCompany || selectedDepartments.length > 0}
        >
          <option value="">Selecione a Loja</option>

          {shopOptions.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.description}
            </option>
          ))}
        </select>

      </div>

      <button
        className="btn btn-primary w-100 mt-2"
        onClick={() => setIsDepartmentsOpen((prev) => !prev)}
        disabled={!selectedShop}
      >
        Departamento {!isDepartmentsOpen ? "▲" : "▼"}
      </button>

      {isDepartmentsOpen && departmentOptions.length > 0 && (
        <div
          className="border rounded p-3 mt-2 overflow-auto"
          style={{ maxHeight: "250px" }}
        >
          {departmentOptions.map((dep) => (
            <label
              className="form-check d-block"
              key={dep.id}
            >
              <input
                className="form-check-input"
                type="checkbox"
                checked={selectedDepartments.includes(dep.id)}
                onChange={(e) => handleCheckboxChange(e, dep.id)}
              />

              <span className="fw-semibold ms-2">
                {dep.description}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectTaskItem;