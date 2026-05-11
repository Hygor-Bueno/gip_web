import { useEffect, useRef, useState } from "react";
import { useConnection } from "../../../../../Context/ConnContext";
import { useMyContext } from "../../../../../Context/MainContext";
import { handleNotification } from "../../../../../Util/ui/notifications";
import { IExpensesItem } from "../../Interfaces/InterfaceExpensesRegister";
import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData,
  PartItem, InfractionItem, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance } from "../../../Active/Interfaces/Interfaces";
import {
  defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance,
} from "../../../Active/Component/Releases/defaultValues";
import { IAddressForm, emptyAddress, tabKeyFromExpType } from "../types";
import {
  safeString, tryParseAddress, buildAddressFromStore, mergeAddressForm,
} from "../helpers";
import { useLookups } from "./useLookups";
import { useTypeDataLoader } from "./useTypeDataLoader";
import { useDirtyCheck } from "./useDirtyCheck";
import { saveExpense } from "../save/saveExpense";

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

  const initialParsedAddress = tryParseAddress(item.place_purchase);
  const [addressActive, setAddressActive] = useState<boolean>(!initialParsedAddress);
  const [addressForm, setAddressForm] = useState<IAddressForm>(initialParsedAddress ?? emptyAddress);

  const [fuel,         setFuel]         = useState<FuelData>(defaultFuel);
  const [maintenance,  setMaintenance]  = useState<MaintenanceData>(defaultMaintenance);
  const [fines,        setFines]        = useState<FinesData>(defaultFines);
  const [sinister,     setSinister]     = useState<SinisterData>(defaultSinister);
  const [insurance,    setInsurance]    = useState<Partial<Insurance>>(defaultInsurance);
  const [newItemText,  setNewItemText]  = useState("");
  const [newValueText, setNewValueText] = useState("");
  const [typeIsNew,    setTypeIsNew]    = useState<boolean>(false);

  // ── Snapshots iniciais (dirty-check) ─────────────────────────────
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
  const initialAddressFormRef   = useRef<IAddressForm>(initialParsedAddress ?? emptyAddress);
  const initialFuelRef          = useRef<FuelData>(defaultFuel);
  const initialMaintenanceRef   = useRef<MaintenanceData>(defaultMaintenance);
  const initialFinesRef         = useRef<FinesData>(defaultFines);
  const initialSinisterRef      = useRef<SinisterData>(defaultSinister);
  const initialInsuranceRef     = useRef<Partial<Insurance>>(defaultInsurance);

  // ── Lookups (drivers, fuelTypes, infractions, etc.) ──────────────
  const lookups = useLookups(activeTab);

  // ── Carrega dados específicos do tipo ────────────────────────────
  useTypeDataLoader({
    activeTab,
    expenId: item.expen_id,
    insuranceFk: item.id_insurance_fk,
    setFuel, setMaintenance, setFines, setSinister, setInsurance,
    setTypeIsNew, setLoading,
    initialFuelRef, initialMaintenanceRef, initialFinesRef,
    initialSinisterRef, initialInsuranceRef,
  });

  // ── Sincroniza endereço com a loja selecionada ───────────────────
  // - Loja inicial + JSON custom → mescla (JSON tem prioridade, loja completa
  //   o que falta)
  // - Loja diferente OU sem JSON → usa só o cadastro da loja
  useEffect(() => {
    if (!expense.store_id_fk) {
      if (!initialParsedAddress) setAddressForm(emptyAddress);
      return;
    }
    const storeAddr = buildAddressFromStore(storesData, expense.store_id_fk);
    if (!storeAddr) return;

    const storeIsInitial = String(expense.store_id_fk) === String(item.store_id_fk ?? "");
    const nextAddr: IAddressForm = storeIsInitial && initialParsedAddress
      ? mergeAddressForm(initialParsedAddress, storeAddr)
      : storeAddr;

    setAddressForm(nextAddr);
    if (storeIsInitial) initialAddressFormRef.current = nextAddr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense.store_id_fk, storesData]);

  // ── Dirty-check ──────────────────────────────────────────────────
  const { dirtySections, isDirty } = useDirtyCheck({
    activeTab, expense, unitId, addressForm,
    fuel, maintenance, fines, sinister, insurance,
    initialExpenseRef, initialUnitIdRef, initialAddressFormRef,
    initialFuelRef, initialMaintenanceRef, initialFinesRef,
    initialSinisterRef, initialInsuranceRef,
  });

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
    // Apenas visibilidade — não chama prefill aqui pra não disparar dirty
    // falso-positivo. O sync já é feito pelo useEffect de store_id_fk.
    setAddressActive(prev => !prev);
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
        value_parts: String(updated.reduce((s, q) => s + Number(q.quantity) * Number(q.value), 0)),
      };
    });
  };

  const removePart = (index: number) => {
    setMaintenance(prev => {
      const updated = (prev.list_parts?.list || []).filter((_, i) => i !== index);
      return {
        ...prev,
        list_parts:  { list: updated },
        value_parts: String(updated.reduce((s, q) => s + Number(q.quantity) * Number(q.value), 0)),
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

  // ── Save / Reset / Delete ────────────────────────────────────────
  async function handleSave() {
    try {
      setLoadingSave(true);
      setLoading(true);
      const opsCount = await saveExpense({
        activeTab,
        expenId: item.expen_id,
        insuranceFk: item.id_insurance_fk,
        typeIsNew,
        dirtyHeader: dirtySections.header,
        dirtyType: dirtySections.type,
        expense, unitId, addressActive, addressForm,
        fuel, maintenance, fines, sinister, insurance,
      });
      if (opsCount > 0) {
        handleNotification("Salvo", "Alterações gravadas com sucesso!", "success");
      }
      onSaved();
    } catch {
      // Silenciado — usuário não precisa ver detalhes técnicos
    } finally {
      setLoading(false);
      setLoadingSave(false);
    }
  }

  function handleReset() {
    setExpense(JSON.parse(JSON.stringify(initialExpenseRef.current)));
    setUnitId(initialUnitIdRef.current);
    setAddressActive(!initialParsedAddress);
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
    activeTab,
    expense, unitId, setUnitId,
    addressActive, addressForm,
    fuel, maintenance, fines, sinister, insurance,
    newItemText, setNewItemText, newValueText, setNewValueText,
    confirmDelete, setConfirmDelete,
    loadingSave, isDirty,
    ...lookups,
    handleExpenseChange, handleAddressChange,
    handleFuelChange, handleFinesChange, handleSinisterChange,
    handleInsuranceChange, handleMaintenanceChange,
    handleToggleAddress, handleInfractionSelect,
    addPart, removePart, addFranchiseItem, removeFranchiseItem,
    handleSave, handleDelete, handleReset,
  };
}
