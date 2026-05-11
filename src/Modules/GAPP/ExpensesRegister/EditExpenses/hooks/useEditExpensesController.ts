import { useEffect, useState } from "react";
import { useConnection } from "../../../../../Context/ConnContext";
import { useMyContext } from "../../../../../Context/MainContext";
import { handleNotification } from "../../../../../Util/ui/notifications";
import { IExpensesItem } from "../../Interfaces/InterfaceExpensesRegister";
import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData,
  PartItem, InfractionItem, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance, Schema } from "../../../Active/Interfaces/Interfaces";
import {
  defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance,
} from "../../../Active/Component/Releases/defaultValues";
import {
  getMaintenanceByExpense, getFuelByExpense, getFinesByExpense,
  getSinisterByExpense, getInsuranceById,
  putExpensesRegister, putMaintenance, putFuel, putFines, putSinister, putInsurance,
  postMaintenance, postFuel, postFines, postSinister,
  getDrivers, getFuelTypes, getInfractions,
  getUtilization, getInsuranceCompany, getTypeCoverage,
} from "../EditExpensesAdapters";
import {
  IAddressForm, emptyAddress, tabKeyFromExpType,
} from "../types";
import {
  safeString, parseListParts, parseFranchiseList,
  tryParseAddress, buildAddressFromStore,
} from "../helpers";

interface UseControllerProps {
  item: IExpensesItem;
  storesData: any[];
  onSaved: () => void;
  onDeleted: (id: number) => void;
}

export function useEditExpensesController({ item, storesData, onSaved, onDeleted }: UseControllerProps) {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const activeTab: TabKey = tabKeyFromExpType(String(item.exp_type_id_fk));

  // ── State principal ──────────────────────────────────────────────
  const [expense, setExpense] = useState<Expense>({
    date:           item.date.slice(0, 10),
    hour:           item.hour.slice(0, 5),
    local:          safeString(item.place_purchase),
    store_id_fk:    item.store_id_fk ? String(item.store_id_fk) : "",
    description:    safeString(item.description),
    coupon_number:  safeString(item.coupon_number),
    total_value:    safeString(item.total_value),
    discount:       safeString(item.discount),
    exp_type_id_fk: String(item.exp_type_id_fk),
    status_expen:   "1",
    driver_id_fk:   safeString(item.driver_id_fk),
    active_id_fk:   "",
    user_id_fk:     "",
  });
  const [unitId, setUnitId] = useState<string>(item.unit_id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // ── Endereço (toggle) ────────────────────────────────────────────
  const initialParsedAddress = tryParseAddress(item.place_purchase);
  const [addressActive, setAddressActive] = useState<boolean>(!!initialParsedAddress);
  const [addressForm, setAddressForm] = useState<IAddressForm>(initialParsedAddress ?? emptyAddress);

  // ── State por tipo ───────────────────────────────────────────────
  const [fuel,         setFuel]         = useState<FuelData>(defaultFuel);
  const [maintenance,  setMaintenance]  = useState<MaintenanceData>(defaultMaintenance);
  const [fines,        setFines]        = useState<FinesData>(defaultFines);
  const [sinister,     setSinister]     = useState<SinisterData>(defaultSinister);
  const [insurance,    setInsurance]    = useState<Partial<Insurance>>(defaultInsurance);
  const [newItemText,  setNewItemText]  = useState("");
  const [newValueText, setNewValueText] = useState("");
  const [typeIsNew,    setTypeIsNew]    = useState<boolean>(false);

  // ── Lookups ──────────────────────────────────────────────────────
  const [drivers,          setDrivers]          = useState<Schema[]>([]);
  const [fuelTypes,        setFuelTypes]        = useState<Schema[]>([]);
  const [infractions,      setInfractions]      = useState<InfractionItem[]>([]);
  const [utilization,      setUtilization]      = useState<Schema[]>([]);
  const [insuranceCompany, setInsuranceCompany] = useState<Schema[]>([]);
  const [typeCoverage,     setTypeCoverage]     = useState<Schema[]>([]);

  // Drivers (sempre — usado pelo Resumo da Despesa)
  useEffect(() => {
    (async () => {
      try {
        const r = await getDrivers();
        if (!r.error) setDrivers(
          r.data.sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((d: any) => ({ value: String(d.driver_id), label: d.name }))
        );
      } catch { /* noop */ }
    })();
  }, []);

  // Lookups condicionais por aba
  useEffect(() => {
    (async () => {
      try {
        if (activeTab === "fuel") {
          const r = await getFuelTypes();
          if (!r.error) setFuelTypes(r.data.map((f: any) => ({ value: String(f.id_fuel_type), label: f.description })));
        }
        if (activeTab === "fines") {
          const r = await getInfractions();
          if (!r.error) setInfractions(r.data);
        }
        if (activeTab === "insurance") {
          const [u, c, t] = await Promise.all([getUtilization(), getInsuranceCompany(), getTypeCoverage()]);
          if (!u.error) setUtilization(u.data.map((i: any) => ({ value: String(i.util_id), label: i.util_name })));
          if (!c.error) setInsuranceCompany(c.data.map((i: any) => ({ value: String(i.ins_id), label: i.ins_name })));
          if (!t.error) setTypeCoverage(t.data.map((i: any) => ({ value: String(i.cov_id), label: i.cov_name })));
        }
      } catch { /* noop */ }
    })();
  }, [activeTab]);

  // Carrega dados específicos do tipo (tolerante a falhas do backend)
  useEffect(() => {
    async function tryLoad(fn: () => Promise<any>, onSuccess: (raw: any) => void) {
      try {
        const r = await fn();
        if (!r.error && r.data?.length) {
          onSuccess(r.data[0]);
          return;
        }
      } catch { /* silenciado intencionalmente */ }
      setTypeIsNew(true);
    }

    (async () => {
      try {
        setLoading(true);
        switch (activeTab) {
          case "fuel":
            await tryLoad(() => getFuelByExpense(item.expen_id),
              raw => setFuel({ ...defaultFuel, ...raw }));
            break;
          case "maintenance":
            await tryLoad(() => getMaintenanceByExpense(item.expen_id), raw => setMaintenance({
              ...defaultMaintenance, ...raw,
              list_parts: parseListParts(raw.list_parts),
              warranty: Number(raw.warranty ?? 0),
            }));
            break;
          case "sinister":
            await tryLoad(() => getSinisterByExpense(item.expen_id),
              raw => setSinister({ ...defaultSinister, ...raw }));
            break;
          case "fines":
            await tryLoad(() => getFinesByExpense(item.expen_id),
              raw => setFines({ ...defaultFines, ...raw }));
            break;
          case "insurance":
            if (item.id_insurance_fk) {
              await tryLoad(() => getInsuranceById(item.id_insurance_fk!),
                raw => setInsurance({ ...defaultInsurance, ...raw, franchise_list: parseFranchiseList(raw.franchise_list) }));
            }
            break;
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.expen_id, activeTab]);

  // Sincroniza endereço com a loja selecionada — em memória
  useEffect(() => {
    if (!expense.store_id_fk) {
      if (!initialParsedAddress) setAddressForm(emptyAddress);
      return;
    }
    const addr = buildAddressFromStore(storesData, expense.store_id_fk);
    if (addr) setAddressForm(addr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense.store_id_fk, storesData]);

  // ── Handlers ─────────────────────────────────────────────────────
  type Ev = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  const handleExpenseChange     = (e: Ev) => setExpense(p     => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddressChange     = (e: Ev) => setAddressForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleFuelChange        = (e: Ev) => setFuel(p        => ({ ...p, [e.target.name]: e.target.value }));
  const handleFinesChange       = (e: Ev) => setFines(p       => ({ ...p, [e.target.name]: e.target.value }));
  const handleSinisterChange    = (e: Ev) => setSinister(p    => ({ ...p, [e.target.name]: e.target.value }));
  const handleInsuranceChange   = (e: Ev) => setInsurance(p   => ({ ...p, [e.target.name]: e.target.value }));
  const handleMaintenanceChange = (e: Ev) => setMaintenance(p => ({
    ...p,
    [e.target.name]: e.target.name === "warranty" ? Number(e.target.value) : e.target.value,
  }));

  function handleToggleAddress() {
    const next = !addressActive;
    setAddressActive(next);
    if (next) {
      const addr = buildAddressFromStore(storesData, expense.store_id_fk);
      if (addr) setAddressForm(addr);
    }
  }

  const handleInfractionSelect = (inf: InfractionItem) => {
    setFines(prev => ({
      ...prev,
      infraction_id_fk: String(inf.infraction_id),
      infraction:       String(inf.infraction),
      points:           String(inf.points),
      gravity:          String(inf.gravitity),
    }));
  };

  const addPart = (part: PartItem) => {
    setMaintenance(prev => {
      const updated = [...(prev.list_parts?.list || []), part];
      return {
        ...prev,
        list_parts:  { list: updated },
        value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
      };
    });
  };

  const removePart = (index: number) => {
    setMaintenance(prev => {
      const updated = (prev.list_parts?.list || []).filter((_, i) => i !== index);
      return {
        ...prev,
        list_parts:  { list: updated },
        value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
      };
    });
  };

  const addFranchiseItem = () => {
    if (!newItemText.trim()) return;
    setInsurance(prev => ({
      ...prev,
      franchise_list: { list: [...(prev.franchise_list?.list || []), { description: newItemText.trim(), value: newValueText }] },
    }));
    setNewItemText("");
    setNewValueText("");
  };

  const removeFranchiseItem = (index: number) => {
    setInsurance(prev => ({
      ...prev,
      franchise_list: { list: (prev.franchise_list?.list || []).filter((_, i) => i !== index) },
    }));
  };

  // ── Save / Delete ────────────────────────────────────────────────
  async function handleSave() {
    try {
      setLoadingSave(true);
      setLoading(true);

      if (activeTab !== "insurance") {
        const placePurchasePayload = addressActive ? JSON.stringify(addressForm) : "";
        const expensePayload = {
          expen_id:       item.expen_id,
          date:           expense.date,
          hour:           expense.hour,
          description:    expense.description,
          total_value:    expense.total_value,
          discount:       expense.discount,
          coupon_number:  expense.coupon_number,
          exp_type_id_fk: expense.exp_type_id_fk,
          driver_id_fk:   expense.driver_id_fk,
          local:          expense.local,
          store_id_fk:    expense.store_id_fk,
          place_purchase: placePurchasePayload,
          unit_id:        unitId,
        };
        const reqExp = await putExpensesRegister(expensePayload);
        if (reqExp.error) throw new Error(reqExp.message);
      }

      switch (activeTab) {
        case "fuel": {
          const payload = { ...fuel, expen_id_fk: item.expen_id };
          const r = typeIsNew ? await postFuel(payload) : await putFuel(payload);
          if (r.error) throw new Error(r.message);
          break;
        }
        case "maintenance": {
          const payload = {
            ...maintenance,
            list_parts: JSON.stringify(maintenance.list_parts ?? { list: [] }),
            expen_id_fk: item.expen_id,
          };
          const r = typeIsNew ? await postMaintenance(payload) : await putMaintenance(payload);
          if (r.error) throw new Error(r.message);
          break;
        }
        case "sinister": {
          const payload = { ...sinister, expen_id_fk: item.expen_id };
          const r = typeIsNew ? await postSinister(payload) : await putSinister(payload);
          if (r.error) throw new Error(r.message);
          break;
        }
        case "fines": {
          const payload = { ...fines, expen_id_fk: item.expen_id, offending_driver: expense.driver_id_fk };
          const r = typeIsNew ? await postFines(payload) : await putFines(payload);
          if (r.error) throw new Error(r.message);
          break;
        }
        case "insurance": {
          const payload = {
            ...insurance,
            franchise_list: JSON.stringify(insurance.franchise_list ?? { list: [] }),
            id_insurance:   item.id_insurance_fk,
          };
          const r = await putInsurance(payload);
          if (r.error) throw new Error(r.message);
          break;
        }
      }

      onSaved();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[EditExpenses] erro ao salvar (oculto do usuário):", error);
      handleNotification(
        "Não foi possível salvar agora",
        "Tente novamente em instantes. Se o problema persistir, fale com o suporte.",
        "warning",
      );
    } finally {
      setLoading(false);
      setLoadingSave(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const req = await fetchData({
        method: "PUT",
        params: { expen_id: item.expen_id, status_expen: "0" },
        pathFile: "GAPP/ExpensesRegister.php",
        urlComplement: "",
      });
      if (req.error) throw new Error(req.message);
      setConfirmDelete(false);
      onDeleted(item.expen_id);
    } catch (error) {
      throw new Error("Erro ao excluir despesa: " + error);
    } finally {
      setLoading(false);
    }
  }

  return {
    // Tab
    activeTab,
    // State
    expense, unitId, setUnitId,
    addressActive, addressForm,
    fuel, maintenance, fines, sinister, insurance,
    newItemText, setNewItemText, newValueText, setNewValueText,
    confirmDelete, setConfirmDelete,
    loadingSave,
    // Lookups
    drivers, fuelTypes, infractions, utilization, insuranceCompany, typeCoverage,
    // Handlers
    handleExpenseChange, handleAddressChange,
    handleFuelChange, handleFinesChange, handleSinisterChange,
    handleInsuranceChange, handleMaintenanceChange,
    handleToggleAddress, handleInfractionSelect,
    addPart, removePart, addFranchiseItem, removeFranchiseItem,
    handleSave, handleDelete,
  };
}
