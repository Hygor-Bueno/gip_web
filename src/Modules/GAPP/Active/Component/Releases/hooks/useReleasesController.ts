import { useCallback, useEffect, useState } from "react";
import { handleNotification } from "../../../../../../Util/ui/notifications";
import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData,
  TabKey, PartItem, InfractionItem,
} from "../Interfaces";
import { Insurance, Schema } from "../../../Interfaces/Interfaces";
import {
  defaultExpense, defaultFuel, defaultMaintenance,
  defaultFines, defaultSinister, defaultInsurance,
} from "../defaultValues";
import {
  postExpense, postFuel, postMaintenance, postFines, postSinister,
  getVehicle, getInsurance, putInsurance, postInsurance,
  getFuelTypes, getDrivers, getUtilization, getInsuranceCompany,
  getTypeCoverage, getInfractions, getStores,
} from "../ReleasesAdapters";
import { AddressForm } from "../ExpenseFields";
import { TABS, emptyAddress } from "../constants";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

interface UseControllerProps {
  activeId: string;
  userId: string | number;
  isVehicle: boolean;
  gappWorkGroupId?: number | null;
}

export function useReleasesController({ activeId, userId, isVehicle, gappWorkGroupId }: UseControllerProps) {
  const [activeTab,    setActiveTab]    = useState<TabKey>("fuel");
  const [loading,      setLoading]      = useState(false);
  const [expense,      setExpense]      = useState<Expense>(defaultExpense(activeId, userId, gappWorkGroupId));
  const [fuel,         setFuel]         = useState<FuelData>(defaultFuel);
  const [maintenance,  setMaintenance]  = useState<MaintenanceData>(defaultMaintenance);
  const [fines,        setFines]        = useState<FinesData>(defaultFines);
  const [sinister,     setSinister]     = useState<SinisterData>(defaultSinister);
  const [insurance,    setInsurance]    = useState<Partial<Insurance>>(defaultInsurance);
  const [newItemText,  setNewItemText]  = useState("");
  const [newValueText, setNewValueText] = useState("");

  const [drivers,          setDrivers]          = useState<Schema[]>([]);
  const [fuelTypes,        setFuelTypes]        = useState<Schema[]>([]);
  const [utilization,      setUtilization]      = useState<Schema[]>([]);
  const [insuranceCompany, setInsuranceCompany] = useState<Schema[]>([]);
  const [typeCoverage,     setTypeCoverage]     = useState<Schema[]>([]);
  const [infractions,      setInfractions]      = useState<InfractionItem[]>([]);
  const [stores,           setStores]           = useState<Schema[]>([]);
  const [storesData,       setStoresData]       = useState<any[]>([]);

  const [addressActive, setAddressActive] = useState<boolean>(false);
  const [addressForm,   setAddressForm]   = useState<AddressForm>(emptyAddress);

  // Pre-fill seguro do veículo (se houver)
  useEffect(() => {
    if (!isVehicle) return;
    getVehicle(activeId).then(vehicleRes => {
      if (vehicleRes.error || !vehicleRes.data?.length) return;
      getInsurance(String(vehicleRes.data[0].vehicle_id)).then(insRes => {
        if (insRes.error || !insRes.data?.length) return;
        const raw = insRes.data[0];
        setInsurance({
          ...raw,
          franchise_list: typeof raw.franchise_list === "string"
            ? (() => { try { return JSON.parse(raw.franchise_list); } catch { return { list: [] }; } })()
            : raw.franchise_list ?? { list: [] },
        });
      });
    });
  }, [activeId, isVehicle]);

  // Lookups iniciais
  useEffect(() => {
    getDrivers().then(r => {
      if (!r.error) setDrivers(
        r.data.sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((d: any) => ({ value: String(d.driver_id), label: d.name }))
      );
    });
    getFuelTypes().then(r => {
      if (!r.error) setFuelTypes(r.data.map((f: any) => ({ value: String(f.id_fuel_type), label: f.description })));
    });
    getUtilization().then(r => {
      if (!r.error) setUtilization(r.data.map((i: any) => ({ value: String(i.util_id), label: i.util_name })));
    });
    getInsuranceCompany().then(r => {
      if (!r.error) setInsuranceCompany(r.data.map((i: any) => ({ value: String(i.ins_id), label: i.ins_name })));
    });
    getTypeCoverage().then(r => {
      if (!r.error) setTypeCoverage(r.data.map((i: any) => ({ value: String(i.cov_id), label: i.cov_name })));
    });
    getInfractions().then(r => {
      if (!r.error) setInfractions(r.data);
    });
    getStores().then(r => {
      if (!r.error) {
        const sorted = (r.data || []).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        setStoresData(sorted);
        setStores(sorted.map((s: any) => ({ value: String(s.store_id), label: s.name })));
      }
    });
  }, []);

  // Resolve endereço da loja em memória — sem hit no backend
  const buildAddressFromStore = useCallback((storeId: string): AddressForm | null => {
    if (!storeId) return null;
    const s = storesData.find((x: any) => String(x.store_id) === String(storeId));
    if (!s) return null;
    return {
      name: s.name ?? "", street: s.street ?? "", district: s.district ?? "",
      city: s.city ?? "", state: s.state ?? "", zip_code: s.zip_code ?? "",
      number: s.number ?? "", complement: s.complement ?? "",
    };
  }, [storesData]);

  // Atualiza endereço quando muda a loja
  useEffect(() => {
    if (!expense.store_id_fk) {
      setAddressForm(emptyAddress);
      return;
    }
    const addr = buildAddressFromStore(expense.store_id_fk);
    if (addr) setAddressForm(addr);
  }, [expense.store_id_fk, buildAddressFromStore]);

  const handleToggleAddress = useCallback(() => {
    const next = !addressActive;
    setAddressActive(next);
    if (next) {
      const addr = buildAddressFromStore(expense.store_id_fk);
      if (addr) setAddressForm(addr);
    }
  }, [addressActive, expense.store_id_fk, buildAddressFromStore]);

  const handleAddressChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setAddressForm(p => ({ ...p, [name]: value }));
  }, []);

  const handleInfractionSelect = useCallback((inf: InfractionItem) => {
    setFines(prev => ({
      ...prev,
      infraction_id_fk: String(inf.infraction_id),
      infraction:       String(inf.infraction),
      points:           String(inf.points),
      gravity:          String(inf.gravitity),
    }));
  }, []);

  const handleExpenseChange   = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setExpense(p   => ({ ...p, [name]: value })); }, []);
  const handleFuelChange      = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setFuel(p      => ({ ...p, [name]: value })); }, []);
  const handleFinesChange     = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setFines(p     => ({ ...p, [name]: value })); }, []);
  const handleSinisterChange  = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setSinister(p  => ({ ...p, [name]: value })); }, []);
  const handleInsuranceChange = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setInsurance(p => ({ ...p, [name]: value })); }, []);

  const handleMaintenanceChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setMaintenance(p => ({ ...p, [name]: name === "warranty" ? Number(value) : value }));
  }, []);

  const addPart = useCallback((part: PartItem) => {
    setMaintenance(prev => {
      const updated = [...(prev.list_parts?.list || []), part];
      return {
        ...prev,
        list_parts:  { list: updated },
        value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
      };
    });
  }, []);

  const removePart = useCallback((index: number) => {
    setMaintenance(prev => {
      const updated = (prev.list_parts?.list || []).filter((_, i) => i !== index);
      return {
        ...prev,
        list_parts:  { list: updated },
        value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
      };
    });
  }, []);

  const addFranchiseItem = useCallback(() => {
    if (!newItemText.trim()) return;
    setInsurance(prev => ({
      ...prev,
      franchise_list: { list: [...(prev.franchise_list?.list || []), { description: newItemText.trim(), value: newValueText }] },
    }));
    setNewItemText("");
    setNewValueText("");
  }, [newItemText, newValueText]);

  const removeFranchiseItem = useCallback((index: number) => {
    setInsurance(prev => ({
      ...prev,
      franchise_list: { list: (prev.franchise_list?.list || []).filter((_, i) => i !== index) },
    }));
  }, []);

  const clearForm = useCallback(() => {
    setExpense(defaultExpense(activeId, userId, gappWorkGroupId));
    setFuel(defaultFuel);
    setMaintenance(defaultMaintenance);
    setFines(defaultFines);
    setSinister(defaultSinister);
    setInsurance(defaultInsurance);
    setNewItemText("");
    setNewValueText("");
    setAddressActive(false);
    setAddressForm(emptyAddress);
  }, [activeId, userId, gappWorkGroupId]);

  // ── Save ─────────────────────────────────────────────────────────
  const buildExpenseWithAddress = (expTypeId: number) => ({
    ...expense,
    exp_type_id_fk: expTypeId,
    place_purchase: addressActive ? JSON.stringify(addressForm) : "",
  });

  const insertExpenseHeader = async (expTypeId: number): Promise<string> => {
    const res = await postExpense(buildExpenseWithAddress(expTypeId));
    if (res.error) throw new Error(res.message || "Erro ao inserir despesa.");
    return res.last_id;
  };

  const handleSubmit = async () => {
    const currentTab = TABS.find(t => t.key === activeTab)!;

    if (currentTab.showExpense && (!expense.date || !expense.hour || !expense.total_value || !expense.local?.trim())) {
      handleNotification("Campos obrigatórios", "Preencha data, hora, valor total e estabelecimento.", "warning");
      return;
    }

    if (!currentTab.expTypeId) {
      handleNotification("Aba indisponível", "Esta aba ainda não possui funcionalidade de inserção.", "info");
      return;
    }

    setLoading(true);
    try {
      switch (activeTab) {
        case "fuel": {
          const res = await postFuel({ ...buildExpenseWithAddress(1), ...fuel, gappProcedure: 1 });
          if (res.error) throw new Error(res.message);
          break;
        }
        case "maintenance": {
          const expenId = await insertExpenseHeader(2);
          const res = await postMaintenance({
            ...maintenance,
            list_parts: JSON.stringify(maintenance.list_parts ?? { list: [] }),
            expen_id_fk: expenId,
          });
          if (res.error) throw new Error(res.message);
          break;
        }
        case "fines": {
          if (!expense.driver_id_fk) throw new Error("Selecione um motorista.");
          const expenId = await insertExpenseHeader(4);
          const res = await postFines({ ...fines, expen_id_fk: expenId, offending_driver: expense.driver_id_fk });
          if (res.error) throw new Error(res.message);
          break;
        }
        case "sinister": {
          const vehicleRes = await getVehicle(activeId);
          if (vehicleRes.error || !vehicleRes.data?.length)
            throw new Error("Veículo não encontrado para este ativo.");

          const insRes = await getInsurance(vehicleRes.data[0].vehicle_id);
          if (insRes.error || !insRes.data?.length)
            throw new Error("Nenhum seguro ativo encontrado para este veículo. Cadastre um seguro antes de registrar um sinistro.");

          const insFk = insRes.data[0].id_insurance;
          if (!insFk) throw new Error("ID do seguro inválido. Verifique o cadastro do seguro.");

          const expenId = await insertExpenseHeader(3);
          const res = await postSinister({
            ...sinister, expen_id_fk: expenId,
            offending_driver: expense.driver_id_fk, id_insurance_fk: insFk,
          });
          if (res.error) throw new Error(res.message);
          break;
        }
        case "insurance": {
          if (!insurance.insurance_value) throw new Error("Informe o valor do seguro.");
          if (!insurance.util_id_fk)     throw new Error("Selecione a utilização.");
          if (!insurance.ins_id_fk)      throw new Error("Selecione a seguradora.");
          if (!insurance.cov_id_fk)      throw new Error("Selecione a cobertura.");

          const vehicleRes = await getVehicle(activeId);
          if (vehicleRes.error) throw new Error("Veículo não encontrado para este ativo.");
          const vehicleId = vehicleRes.data[0].vehicle_id;

          const oldIns = await getInsurance(vehicleId);
          if (!oldIns.error && oldIns.data?.length) {
            await Promise.all(oldIns.data.map((item: any) =>
              putInsurance({ status_insurance: 0, id_insurance: item.id_insurance })
            ));
          }

          const insRes = await postInsurance({
            ...insurance,
            franchise_list: JSON.stringify(insurance.franchise_list ?? { list: [] }),
            vehicle_id_fk: vehicleId,
          });
          if (insRes.error) throw new Error(insRes.message);
          break;
        }
      }

      handleNotification("Registro salvo", "Lançamento inserido com sucesso!", "success");
      clearForm();
    } catch (err: any) {
      handleNotification("Erro ao inserir", err.message || "Tente novamente.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return {
    // tab
    activeTab, setActiveTab,
    // state
    expense, fuel, maintenance, fines, sinister, insurance,
    newItemText, setNewItemText, newValueText, setNewValueText,
    addressActive, addressForm,
    loading,
    // lookups
    drivers, fuelTypes, utilization, insuranceCompany, typeCoverage,
    infractions, stores,
    // handlers
    handleExpenseChange, handleFuelChange, handleFinesChange,
    handleSinisterChange, handleInsuranceChange, handleMaintenanceChange,
    handleAddressChange, handleToggleAddress, handleInfractionSelect,
    addPart, removePart, addFranchiseItem, removeFranchiseItem,
    clearForm, handleSubmit,
  };
}
