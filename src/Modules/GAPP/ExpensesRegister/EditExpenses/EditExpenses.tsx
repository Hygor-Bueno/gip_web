import React, { useEffect, useState } from "react";
import { useConnection } from "../../../../Context/ConnContext";
import { useMyContext } from "../../../../Context/MainContext";
import { IExpensesItem } from "../Interfaces/InterfaceExpensesRegister";
import ConfirmModal from "../../../../Components/CustomConfirm";
import { handleNotification } from "../../../../Util/ui/notifications";
import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData, PartItem, InfractionItem, TabKey,
} from "../../Active/Component/Releases/Interfaces";
import { Insurance, Schema } from "../../Active/Interfaces/Interfaces";
import {
  defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance,
} from "../../Active/Component/Releases/defaultValues";
import CustomForm from "../../../../Components/CustomForm";
import FuelTab from "../../Active/Component/Releases/tabs/FuelTab";
import MaintenanceTab from "../../Active/Component/Releases/tabs/MaintenanceTab";
import FinesTab from "../../Active/Component/Releases/tabs/FinesTab";
import SinisterTab from "../../Active/Component/Releases/tabs/SinisterTab";
import InsuranceTab from "../../Active/Component/Releases/tabs/InsuranceTab";
import "../../Active/Component/Releases/Releases.css";
import {
  getMaintenanceByExpense, getFuelByExpense, getFinesByExpense,
  getSinisterByExpense, getInsuranceById,
  putExpensesRegister, putMaintenance, putFuel, putFines, putSinister, putInsurance,
  postMaintenance, postFuel, postFines, postSinister,
  getDrivers, getFuelTypes, getInfractions,
  getUtilization, getInsuranceCompany, getTypeCoverage,
  getStoreById,
} from "./EditExpensesAdapters";

interface IAddressForm {
  name: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  number: string;
  complement: string;
}

const emptyAddress: IAddressForm = {
  name: "", street: "", district: "", city: "", state: "", zip_code: "", number: "", complement: "",
};

interface IEditExpenses {
  item: IExpensesItem;
  units: { label: string; value: string }[];
  expensesType: { label: string; value: string }[];
  stores: { label: string; value: string }[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (id: number) => void;
}

const TABS: { key: TabKey; label: string; expTypeId: string; showExpense: boolean }[] = [
  { key: "fuel",        label: "Abastecimento", expTypeId: "1", showExpense: true  },
  { key: "maintenance", label: "Manutenção",    expTypeId: "2", showExpense: true  },
  { key: "sinister",    label: "Sinistro",      expTypeId: "3", showExpense: true  },
  { key: "fines",       label: "Multas",        expTypeId: "4", showExpense: true  },
  { key: "insurance",   label: "Seguro",        expTypeId: "5", showExpense: false },
];

function tabKeyFromExpType(expTypeId: string): TabKey {
  const t = TABS.find((x) => x.expTypeId === String(expTypeId));
  return t?.key ?? "fuel";
}

function parseListParts(raw: any): { list: PartItem[] } {
  if (!raw) return { list: [] };
  if (typeof raw === "object" && Array.isArray(raw.list)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.list) ? parsed : { list: [] };
    } catch { return { list: [] }; }
  }
  return { list: [] };
}

function parseFranchiseList(raw: any) {
  if (!raw) return { list: [] };
  if (typeof raw === "object" && Array.isArray(raw.list)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.list) ? parsed : { list: [] };
    } catch { return { list: [] }; }
  }
  return { list: [] };
}

function EditExpenses({ item, units, stores, onClose, onSaved, onDeleted }: IEditExpenses): JSX.Element {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const activeTab: TabKey = tabKeyFromExpType(String(item.exp_type_id_fk));
  const currentTab = TABS.find((t) => t.key === activeTab)!;

  function safeString(v: any): string {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      try { return JSON.stringify(v); } catch { return ""; }
    }
    return String(v);
  }

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

  // Address-specific form (toggle)
  function tryParseAddress(raw: any): IAddressForm | null {
    if (!raw) return null;
    if (typeof raw === "object") {
      return { ...emptyAddress, ...raw };
    }
    if (typeof raw === "string" && raw.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return { ...emptyAddress, ...parsed };
      } catch { /* noop */ }
    }
    return null;
  }
  const initialParsedAddress = tryParseAddress(item.place_purchase);
  const [addressActive, setAddressActive] = useState<boolean>(!initialParsedAddress);
  const [addressForm, setAddressForm] = useState<IAddressForm>(initialParsedAddress ?? emptyAddress);

  // Type-specific state
  const [fuel,        setFuel]        = useState<FuelData>(defaultFuel);
  const [maintenance, setMaintenance] = useState<MaintenanceData>(defaultMaintenance);
  const [fines,       setFines]       = useState<FinesData>(defaultFines);
  const [sinister,    setSinister]    = useState<SinisterData>(defaultSinister);
  const [insurance,   setInsurance]   = useState<Partial<Insurance>>(defaultInsurance);
  const [newItemText,  setNewItemText]  = useState("");
  const [newValueText, setNewValueText] = useState("");
  const [typeIsNew, setTypeIsNew] = useState<boolean>(false);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  // Lookup lists
  const [drivers,          setDrivers]          = useState<Schema[]>([]);
  const [fuelTypes,        setFuelTypes]        = useState<Schema[]>([]);
  const [infractions,      setInfractions]      = useState<InfractionItem[]>([]);
  const [utilization,      setUtilization]      = useState<Schema[]>([]);
  const [insuranceCompany, setInsuranceCompany] = useState<Schema[]>([]);
  const [typeCoverage,     setTypeCoverage]     = useState<Schema[]>([]);

  // Drivers usado pelo ExpenseFields
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

  // Lookups por aba
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
    (async () => {
      // Helper: trata qualquer erro como "registro novo" e libera o form pra POST.
      // Erros são silenciados pra não expor mensagens técnicas ao usuário.
      async function tryLoad<T>(fn: () => Promise<any>, onSuccess: (raw: any) => void) {
        try {
          const r = await fn();
          if (!r.error && r.data?.length) {
            onSuccess(r.data[0]);
            return;
          }
        } catch { /* silenciado intencionalmente */ }
        setTypeIsNew(true);
      }

      try {
        setLoading(true);
        switch (activeTab) {
          case "fuel":
            await tryLoad(() => getFuelByExpense(item.expen_id), (raw) => {
              setFuel({ ...defaultFuel, ...raw });
            });
            break;
          case "maintenance":
            await tryLoad(() => getMaintenanceByExpense(item.expen_id), (raw) => {
              setMaintenance({
                ...defaultMaintenance,
                ...raw,
                list_parts: parseListParts(raw.list_parts),
                warranty: Number(raw.warranty ?? 0),
              });
            });
            break;
          case "sinister":
            await tryLoad(() => getSinisterByExpense(item.expen_id), (raw) => {
              setSinister({ ...defaultSinister, ...raw });
            });
            break;
          case "fines":
            await tryLoad(() => getFinesByExpense(item.expen_id), (raw) => {
              setFines({ ...defaultFines, ...raw });
            });
            break;
          case "insurance":
            if (item.id_insurance_fk) {
              await tryLoad(() => getInsuranceById(item.id_insurance_fk!), (raw) => {
                setInsurance({ ...defaultInsurance, ...raw, franchise_list: parseFranchiseList(raw.franchise_list) });
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

  type Ev = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  const handleExpenseChange     = (e: Ev) => setExpense(p     => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddressChange     = (e: Ev) => setAddressForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleToggleAddress() {
    const next = !addressActive;
    setAddressActive(next);
    if (next) {
      // Ao ativar: prefilla com dados da loja selecionada (se houver)
      const storeId = expense.store_id_fk;
      if (storeId) {
        try {
          const r = await getStoreById(storeId);
          if (!r.error && r.data?.length) {
            const s = r.data[0];
            setAddressForm({
              name:       s.name       ?? "",
              street:     s.street     ?? "",
              district:   s.district   ?? "",
              city:       s.city       ?? "",
              state:      s.state      ?? "",
              zip_code:   s.zip_code   ?? "",
              number:     s.number     ?? "",
              complement: s.complement ?? "",
            });
          }
        } catch { /* noop */ }
      }
    }
  }

  // Quando muda a loja com endereço ativo, recarrega prefill
  useEffect(() => {
    if (!addressActive) return;
    if (!expense.store_id_fk) return;
    (async () => {
      try {
        const r = await getStoreById(expense.store_id_fk);
        if (!r.error && r.data?.length) {
          const s = r.data[0];
          setAddressForm({
            name:       s.name       ?? "",
            street:     s.street     ?? "",
            district:   s.district   ?? "",
            city:       s.city       ?? "",
            state:      s.state      ?? "",
            zip_code:   s.zip_code   ?? "",
            number:     s.number     ?? "",
            complement: s.complement ?? "",
          });
        }
      } catch { /* noop */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense.store_id_fk]);

  const handleFuelChange        = (e: Ev) => setFuel(p        => ({ ...p, [e.target.name]: e.target.value }));
  const handleFinesChange       = (e: Ev) => setFines(p       => ({ ...p, [e.target.name]: e.target.value }));
  const handleSinisterChange    = (e: Ev) => setSinister(p    => ({ ...p, [e.target.name]: e.target.value }));
  const handleInsuranceChange   = (e: Ev) => setInsurance(p   => ({ ...p, [e.target.name]: e.target.value }));
  const handleMaintenanceChange = (e: Ev) => setMaintenance(p => ({
    ...p,
    [e.target.name]: e.target.name === "warranty" ? Number(e.target.value) : e.target.value,
  }));

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

  async function handleSave() {
    try {
      setLoadingSave(true);
      setLoading(true);

      // 1. Cabeçalho da despesa (Seguro vai direto pra GAPP/Insurance.php)
      if (activeTab !== "insurance") {
        const placePurchasePayload = addressActive
          ? JSON.stringify(addressForm)
          : "";
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

      // 2. Dados específicos do tipo
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
          const payload = {
            ...fines,
            expen_id_fk:      item.expen_id,
            offending_driver: expense.driver_id_fk,
          };
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

  return (
    <div className="releases-overlay" onClick={onClose}>
      <div className="releases-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="releases-header">
          <div className="releases-header-icon"><i className="fa fa-file-invoice-dollar"></i></div>
          <div>
            <p className="releases-title">Editar Despesa #{item.expen_id}</p>
            <p className="releases-subtitle">
              Tipo: <strong>{currentTab.label}</strong>
            </p>
          </div>
          <button className="releases-close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>

        {/* Tabs (somente leitura — tipo trava no edit) */}
        <div className="releases-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`releases-tab ${activeTab === t.key ? "releases-tab--active" : ""}`}
              type="button"
              disabled
              title={activeTab === t.key ? "Tipo da despesa" : "Para mudar o tipo, exclua e cadastre novamente"}
              style={activeTab !== t.key ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="releases-body">

          {/* Resumo da Despesa — schema clonado do Active mas com Estabelecimento/Unidade como SELECT */}
          {currentTab.showExpense && (
            <div className="rel-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.65rem", borderBottom: "1.5px solid #f1f3f8" }}>
                <p className="rel-section-title" style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>
                  <i className="fa fa-money"></i> Resumo da Despesa
                </p>
                <button
                  type="button"
                  onClick={handleToggleAddress}
                  className={addressActive ? "btn-rel-clear" : "btn-rel-save"}
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}
                  title={addressActive ? "Desativar endereço específico" : "Ativar formulário de endereço para um local específico"}
                >
                  <i className={`fa ${addressActive ? "fa-times" : "fa-map-marker"}`}></i>{" "}
                  {addressActive ? "Desativar endereço" : "Ativar endereço específico"}
                </button>
              </div>
              <CustomForm
                notButton={false}
                className="row g-3"
                fieldsets={[
                  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Data',            mandatory: true, captureValue: { type: 'date',     name: 'date',          className: 'form-control', value: expense.date,          onChange: handleExpenseChange, required: true } } },
                  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Hora',            mandatory: true, captureValue: { type: 'time',     name: 'hour',          className: 'form-control', value: expense.hour,          onChange: handleExpenseChange, required: true } } },
                  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor Total',     mandatory: true, captureValue: { type: 'number',   name: 'total_value',   className: 'form-control', value: expense.total_value,   onChange: handleExpenseChange, required: true } } },
                  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Nº Cupom',                         captureValue: { type: 'text',     name: 'coupon_number', className: 'form-control', value: expense.coupon_number, onChange: handleExpenseChange } } },
                  { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Desconto',                         captureValue: { type: 'number',   name: 'discount',      className: 'form-control', value: expense.discount,      onChange: handleExpenseChange } } },
                  { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Estabelecimento', mandatory: true, captureValue: { type: 'select',   name: 'store_id_fk',   className: 'form-control', value: expense.store_id_fk,   onChange: handleExpenseChange, options: stores } } },
                  { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Unidade',         mandatory: true, captureValue: { type: 'select',   name: 'unit_id',       className: 'form-control', value: unitId,                onChange: (e: any) => setUnitId(e.target.value), options: units } } },
                  { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Motorista',                        captureValue: { type: 'select',   name: 'driver_id_fk',  className: 'form-control', value: expense.driver_id_fk,  onChange: handleExpenseChange, options: drivers } } },
                  { attributes: { className: 'my-2 col-12' },         item: { label: 'Descrição',                        captureValue: { type: 'textarea', name: 'description',   className: 'form-control', value: expense.description,   onChange: handleExpenseChange, rows: 2 } } },
                ]}
              />
            </div>
          )}

          {/* Endereço específico (toggle) */}
          {currentTab.showExpense && addressActive && (
            <div className="rel-section">
              <p className="rel-section-title">
                <i className="fa fa-map-marker"></i> Endereço específico do local
              </p>
              <small style={{ color: "#64748b", display: "block", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                Preenchido com os dados da loja selecionada — edite se o local for diferente do cadastro.
              </small>
              <CustomForm
                notButton={false}
                className="row g-3"
                fieldsets={[
                  { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Estabelecimento (nome)', captureValue: { type: 'text',   name: 'name',       className: 'form-control', value: addressForm.name,       onChange: handleAddressChange, placeholder: 'Nome do local' } } },
                  { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'CEP',                    captureValue: { type: 'text',   name: 'zip_code',   className: 'form-control', value: addressForm.zip_code,   onChange: handleAddressChange, placeholder: '00000-000' } } },
                  { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Estado (UF)',            captureValue: { type: 'text',   name: 'state',      className: 'form-control', value: addressForm.state,      onChange: handleAddressChange, maxLength: 2, placeholder: 'UF' } } },
                  { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Logradouro',             captureValue: { type: 'text',   name: 'street',     className: 'form-control', value: addressForm.street,     onChange: handleAddressChange, placeholder: 'Rua / Avenida' } } },
                  { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Número',                 captureValue: { type: 'text',   name: 'number',     className: 'form-control', value: addressForm.number,     onChange: handleAddressChange, placeholder: 'Nº' } } },
                  { attributes: { className: 'my-2 col-6 col-md-3' },  item: { label: 'Bairro',                 captureValue: { type: 'text',   name: 'district',   className: 'form-control', value: addressForm.district,   onChange: handleAddressChange, placeholder: 'Bairro' } } },
                  { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Cidade',                 captureValue: { type: 'text',   name: 'city',       className: 'form-control', value: addressForm.city,       onChange: handleAddressChange, placeholder: 'Cidade' } } },
                  { attributes: { className: 'my-2 col-12 col-md-6' }, item: { label: 'Complemento',            captureValue: { type: 'text',   name: 'complement', className: 'form-control', value: addressForm.complement, onChange: handleAddressChange, placeholder: 'Complemento (opcional)' } } },
                ]}
              />
            </div>
          )}

          {/* Subform por tipo */}
          {activeTab === "fuel"        && <FuelTab fuel={fuel} onChange={handleFuelChange} fuelTypes={fuelTypes} />}
          {activeTab === "maintenance" && <MaintenanceTab maintenance={maintenance} onChange={handleMaintenanceChange} addPart={addPart} removePart={removePart} />}
          {activeTab === "sinister"    && <SinisterTab sinister={sinister} onChange={handleSinisterChange} />}
          {activeTab === "fines"       && <FinesTab fines={fines} onChange={handleFinesChange} infractions={infractions} onInfractionSelect={handleInfractionSelect} />}
          {activeTab === "insurance"   && (
            <InsuranceTab
              insurance={insurance}
              onChange={handleInsuranceChange}
              addFranchiseItem={addFranchiseItem}
              removeFranchiseItem={removeFranchiseItem}
              newItemText={newItemText}
              setNewItemText={setNewItemText}
              newValueText={newValueText}
              setNewValueText={setNewValueText}
              utilization={utilization}
              insuranceCompany={insuranceCompany}
              typeCoverage={typeCoverage}
            />
          )}

        </div>

        {/* Footer */}
        <div className="releases-footer">
          <button className="btn-rel-back" type="button" onClick={onClose}>
            <i className="fa fa-arrow-left"></i> Voltar
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-rel-clear" type="button" onClick={() => setConfirmDelete(true)}>
              <i className="fa fa-trash text-white"></i> Excluir
            </button>
            <button className="btn-rel-save" type="button" onClick={handleSave} disabled={loadingSave}>
              <i className="fa fa-check"></i> {loadingSave ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir despesa"
          message={`Deseja realmente excluir a despesa #${item.expen_id}? Esta ação não poderá ser desfeita.`}
          confirmLabel="Sim, excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default EditExpenses;
