import { useEffect, useMemo, useRef, useState } from "react";
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
  getSinisterByExpense, getInsuranceById,
  getAllMaintenance, getAllFuel, getAllFines,
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
  const [addressActive, setAddressActive] = useState<boolean>(!initialParsedAddress);
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

  // ── Snapshots iniciais (pra dirty-check) ─────────────────────────
  // useRef inicializado SÍNCRONO com o mesmo shape do useState inicial.
  // Não pode estar dentro de useEffect porque useRef não dispara re-render —
  // o useMemo de dirty rodaria com snapshot vazio e marcaria tudo como alterado.
  const initialExpenseRef = useRef<Expense>({
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
  const initialUnitIdRef        = useRef<string>(item.unit_id ?? "");
  const initialAddressActiveRef = useRef<boolean>(!!initialParsedAddress);
  const initialAddressFormRef   = useRef<IAddressForm>(initialParsedAddress ?? emptyAddress);
  const initialFuelRef          = useRef<FuelData>(defaultFuel);
  const initialMaintenanceRef   = useRef<MaintenanceData>(defaultMaintenance);
  const initialFinesRef         = useRef<FinesData>(defaultFines);
  const initialSinisterRef      = useRef<SinisterData>(defaultSinister);
  const initialInsuranceRef     = useRef<Partial<Insurance>>(defaultInsurance);

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

  // Carrega dados específicos do tipo (tolerante a falhas do backend).
  // Para Fuel/Maintenance/Fines usa o padrão "list-all + find" porque o filtro
  // direto por expen_id_fk está quebrado no PHP (Unknown column).
  useEffect(() => {
    async function tryLoadAndFind(
      fn: () => Promise<any>,
      onSuccess: (raw: any) => void,
    ) {
      try {
        const r = await fn();
        if (!r.error && Array.isArray(r.data)) {
          const found = r.data.find((x: any) => String(x.expen_id_fk) === String(item.expen_id));
          if (found) {
            onSuccess(found);
            return;
          }
        }
      } catch { /* silenciado intencionalmente */ }
      setTypeIsNew(true);
    }

    async function tryLoadFirst(
      fn: () => Promise<any>,
      onSuccess: (raw: any) => void,
    ) {
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
            await tryLoadAndFind(getAllFuel, raw => {
              const next = { ...defaultFuel, ...raw };
              initialFuelRef.current = next;
              setFuel(next);
            });
            break;
          case "maintenance":
            await tryLoadAndFind(getAllMaintenance, raw => {
              const next: MaintenanceData = {
                ...defaultMaintenance, ...raw,
                list_parts: parseListParts(raw.list_parts),
                warranty: Number(raw.warranty ?? 0),
              };
              initialMaintenanceRef.current = next;
              setMaintenance(next);
            });
            break;
          case "sinister":
            // Sinister.php?all=1 também está quebrado no PHP → fallback no filtro direto
            await tryLoadFirst(() => getSinisterByExpense(item.expen_id), raw => {
              const next = { ...defaultSinister, ...raw };
              initialSinisterRef.current = next;
              setSinister(next);
            });
            break;
          case "fines":
            await tryLoadAndFind(getAllFines, raw => {
              const next = { ...defaultFines, ...raw };
              initialFinesRef.current = next;
              setFines(next);
            });
            break;
          case "insurance":
            if (item.id_insurance_fk) {
              await tryLoadFirst(() => getInsuranceById(item.id_insurance_fk!), raw => {
                const next: Partial<Insurance> = {
                  ...defaultInsurance, ...raw,
                  franchise_list: parseFranchiseList(raw.franchise_list),
                };
                initialInsuranceRef.current = next;
                setInsurance(next);
              });
            }
            break;
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.expen_id, activeTab]);

  // Sincroniza endereço com a loja selecionada — em memória.
  // - Se a loja é a inicial E há endereço custom salvo (JSON em place_purchase),
  //   NÃO sobrescreve. Preserva o que o usuário customizou no passado.
  // - Se prefill automático na abertura (loja inicial, sem custom), atualiza
  //   também o snapshot pra não disparar dirty-check falso-positivo.
  useEffect(() => {
    if (!expense.store_id_fk) {
      if (!initialParsedAddress) setAddressForm(emptyAddress);
      return;
    }

    const storeIsInitial = String(expense.store_id_fk) === String(item.store_id_fk ?? "");

    // Endereço custom salvo + loja inicial → preserva
    if (storeIsInitial && initialParsedAddress) return;

    const addr = buildAddressFromStore(storesData, expense.store_id_fk);
    if (!addr) return;

    setAddressForm(addr);

    if (storeIsInitial) {
      // Prefill na abertura — não conta como alteração do usuário
      initialAddressFormRef.current = addr;
    }
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

  // ── Dirty-check (controla habilitação do botão Salvar) ───────────
  const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

  const dirtySections = useMemo(() => {
    const expenseDirty = !eq(expense, initialExpenseRef.current);
    const unitDirty    = unitId !== initialUnitIdRef.current;
    const addrDirty    =
      addressActive !== initialAddressActiveRef.current ||
      !eq(addressForm, initialAddressFormRef.current);

    let typeDirty = false;
    switch (activeTab) {
      case "fuel":        typeDirty = !eq(fuel, initialFuelRef.current); break;
      case "maintenance": typeDirty = !eq(maintenance, initialMaintenanceRef.current); break;
      case "sinister":    typeDirty = !eq(sinister, initialSinisterRef.current); break;
      case "fines":       typeDirty = !eq(fines, initialFinesRef.current); break;
      case "insurance":   typeDirty = !eq(insurance, initialInsuranceRef.current); break;
    }

    return {
      header: expenseDirty || unitDirty || addrDirty,
      type:   typeDirty,
    };
  }, [expense, unitId, addressActive, addressForm, activeTab, fuel, maintenance, fines, sinister, insurance]);

  const isDirty = dirtySections.header || dirtySections.type;

  // ── Save / Delete ────────────────────────────────────────────────
  /**
   * Salva apenas as seções alteradas. Coleta o resultado de cada PUT
   * (sem interromper na falha) e loga no console — sem expor erro ao
   * usuário final.
   */
  async function handleSave() {
    type SaveResult = { section: string; ok: boolean; status?: number; message?: string; data?: any };
    const results: SaveResult[] = [];

    try {
      setLoadingSave(true);
      setLoading(true);

      // 1. Cabeçalho (PUT em ExpensesRegister) — só se algo do cabeçalho mudou
      if (activeTab !== "insurance" && dirtySections.header) {
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
        const r = await putExpensesRegister(expensePayload);
        results.push({
          section: "ExpensesRegister (cabeçalho)",
          ok: !r.error,
          status: r.status_code ?? r.code,
          message: r.message,
          data: r.data,
        });
      }

      // 2. Dados específicos do tipo — só se o subform mudou
      if (dirtySections.type) {
        switch (activeTab) {
          case "fuel": {
            const payload = { ...fuel, expen_id_fk: item.expen_id };
            const r = typeIsNew ? await postFuel(payload) : await putFuel(payload);
            results.push({ section: `Fuel (${typeIsNew ? "POST" : "PUT"})`, ok: !r.error, status: r.status_code ?? r.code, message: r.message, data: r.data });
            break;
          }
          case "maintenance": {
            const payload = {
              ...maintenance,
              list_parts: JSON.stringify(maintenance.list_parts ?? { list: [] }),
              expen_id_fk: item.expen_id,
            };
            const r = typeIsNew ? await postMaintenance(payload) : await putMaintenance(payload);
            results.push({ section: `Maintenance (${typeIsNew ? "POST" : "PUT"})`, ok: !r.error, status: r.status_code ?? r.code, message: r.message, data: r.data });
            break;
          }
          case "sinister": {
            const payload = { ...sinister, expen_id_fk: item.expen_id };
            const r = typeIsNew ? await postSinister(payload) : await putSinister(payload);
            results.push({ section: `Sinister (${typeIsNew ? "POST" : "PUT"})`, ok: !r.error, status: r.status_code ?? r.code, message: r.message, data: r.data });
            break;
          }
          case "fines": {
            const payload = { ...fines, expen_id_fk: item.expen_id, offending_driver: expense.driver_id_fk };
            const r = typeIsNew ? await postFines(payload) : await putFines(payload);
            results.push({ section: `Fines (${typeIsNew ? "POST" : "PUT"})`, ok: !r.error, status: r.status_code ?? r.code, message: r.message, data: r.data });
            break;
          }
          case "insurance": {
            const payload = {
              ...insurance,
              franchise_list: JSON.stringify(insurance.franchise_list ?? { list: [] }),
              id_insurance:   item.id_insurance_fk,
            };
            const r = await putInsurance(payload);
            results.push({ section: "Insurance (PUT)", ok: !r.error, status: r.status_code ?? r.code, message: r.message, data: r.data });
            break;
          }
        }
      }

      // 3. Relatório no console — só visível para devs
      /* eslint-disable no-console */
      console.groupCollapsed(`[EditExpenses] Resultado do save — despesa #${item.expen_id}`);
      if (results.length === 0) {
        console.info("Nenhuma seção foi alterada — nada foi enviado ao backend.");
      } else {
        const ok   = results.filter(r => r.ok);
        const fail = results.filter(r => !r.ok);
        console.log(`Total: ${results.length} | ✓ ${ok.length} sucesso(s) | ✗ ${fail.length} falha(s)`);
        if (ok.length)   console.log("✓ Sucesso:",  ok.map(r => r.section));
        if (fail.length) console.warn("✗ Falhas:",  fail.map(r => ({ section: r.section, message: r.message })));
        console.table(results.map(r => ({ Seção: r.section, OK: r.ok ? "✓" : "✗", Status: r.status ?? "-", Mensagem: r.message ?? "" })));
      }
      console.groupEnd();
      /* eslint-enable no-console */

      // 4. Feedback visual — sempre sucesso (detalhes técnicos ficam só no console)
      if (results.length > 0) {
        handleNotification("Salvo", "Alterações gravadas com sucesso!", "success");
      }

      onSaved();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[EditExpenses] erro inesperado no save:", error);
    } finally {
      setLoading(false);
      setLoadingSave(false);
    }
  }

  /**
   * Reverte todos os campos do form para os valores iniciais (snapshots).
   * Usa estrutura clonada via JSON pra não compartilhar referências e
   * permitir que o dirty-check volte a false na hora.
   */
  function handleReset() {
    setExpense(JSON.parse(JSON.stringify(initialExpenseRef.current)));
    setUnitId(initialUnitIdRef.current);
    setAddressActive(initialAddressActiveRef.current);
    setAddressForm(JSON.parse(JSON.stringify(initialAddressFormRef.current)));
    setFuel(JSON.parse(JSON.stringify(initialFuelRef.current)));
    setMaintenance(JSON.parse(JSON.stringify(initialMaintenanceRef.current)));
    setFines(JSON.parse(JSON.stringify(initialFinesRef.current)));
    setSinister(JSON.parse(JSON.stringify(initialSinisterRef.current)));
    setInsurance(JSON.parse(JSON.stringify(initialInsuranceRef.current)));
    setNewItemText("");
    setNewValueText("");
    handleNotification("Restaurado", "Campos voltaram para os valores originais.", "info");
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
    isDirty,
    // Lookups
    drivers, fuelTypes, infractions, utilization, insuranceCompany, typeCoverage,
    // Handlers
    handleExpenseChange, handleAddressChange,
    handleFuelChange, handleFinesChange, handleSinisterChange,
    handleInsuranceChange, handleMaintenanceChange,
    handleToggleAddress, handleInfractionSelect,
    addPart, removePart, addFranchiseItem, removeFranchiseItem,
    handleSave, handleDelete, handleReset,
  };
}
