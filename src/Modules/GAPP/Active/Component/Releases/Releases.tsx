import React, { useState, useCallback, useEffect } from "react";
import "./Releases.css";
import { handleNotification } from "../../../../../Util/ui/notifications";
import { ReleasesProps, Expense, FuelData, MaintenanceData, FinesData, SinisterData, TabKey, PartItem } from "./Interfaces";
import { Insurance, Schema } from "../../Interfaces/Interfaces";
import { defaultExpense, defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance } from "./defaultValues";
import {
  postExpense, postFuel, postMaintenance, postFines, postSinister,
  getVehicle, getInsurance, putInsurance, postInsurance,
  getFuelTypes, getDrivers, getUtilization, getInsuranceCompany, getTypeCoverage,
} from "./ReleasesAdapters";
import ExpenseFields from "./ExpenseFields";
import FuelTab from "./tabs/FuelTab";
import MaintenanceTab from "./tabs/MaintenanceTab";
import FinesTab from "./tabs/FinesTab";
import SinisterTab from "./tabs/SinisterTab";
import InsuranceTab from "./tabs/InsuranceTab";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

const TABS: { key: TabKey; label: string; expTypeId: number | null; showExpense: boolean }[] = [
  { key: "fuel",        label: "Abastecimento", expTypeId: 1,    showExpense: true  },
  { key: "maintenance", label: "Manutenção",    expTypeId: 2,    showExpense: true  },
  { key: "fines",       label: "Multas",        expTypeId: 4,    showExpense: true  },
  { key: "sinister",    label: "Sinistro",      expTypeId: 3,    showExpense: true  },
  { key: "insurance",   label: "Seguro",        expTypeId: 5,    showExpense: false },
  { key: "trips",       label: "Viagens",       expTypeId: null, showExpense: false },
];

const Releases: React.FC<ReleasesProps> = ({ activeId, userId, isVehicle, gappWorkGroupId, onClose }) => {
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

  useEffect(() => {
    getDrivers().then(r => {
      if (!r.error) setDrivers(
        r.data
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
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
  }, []);

  const handleExpenseChange     = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setExpense(p    => ({ ...p, [name]: value })); }, []);
  const handleFuelChange        = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setFuel(p       => ({ ...p, [name]: value })); }, []);
  const handleFinesChange       = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setFines(p      => ({ ...p, [name]: value })); }, []);
  const handleSinisterChange    = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setSinister(p   => ({ ...p, [name]: value })); }, []);
  const handleInsuranceChange   = useCallback((e: ChangeEvent) => { const { name, value } = e.target; setInsurance(p  => ({ ...p, [name]: value })); }, []);

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
  }, [activeId, userId, gappWorkGroupId]);

  const insertExpenseHeader = async (expTypeId: number): Promise<string> => {
    const res = await postExpense({ ...expense, exp_type_id_fk: expTypeId });
    if (res.error) throw new Error(res.message || "Erro ao inserir despesa.");
    return res.last_id;
  };

  const handleSubmit = async () => {
    const currentTab = TABS.find(t => t.key === activeTab)!;

    if (currentTab.showExpense && (!expense.date || !expense.hour || !expense.total_value)) {
      handleNotification("Campos obrigatórios", "Preencha data, hora e valor total.", "warning");
      return;
    }
    if (!currentTab.expTypeId) { handleNotification("Aba indisponível", "Esta aba ainda não possui funcionalidade de inserção.", "info"); return; }

    setLoading(true);
    try {
      switch (activeTab) {
        case "fuel": {
          const res = await postFuel({ ...expense, exp_type_id_fk: 1, ...fuel, gappProcedure: 1 });
          if (res.error) throw new Error(res.message);
          break;
        }
        case "maintenance": {
          const expenId = await insertExpenseHeader(2);
          const res = await postMaintenance({ ...maintenance, expen_id_fk: expenId });
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
          if (!insFk)
            throw new Error("ID do seguro inválido. Verifique o cadastro do seguro.");

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

          // Seguro tem tabela própria — NÃO gera lançamento em ExpensesRegister
          const insRes = await postInsurance({ ...insurance, vehicle_id_fk: vehicleId });
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
  
  const currentTab = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="releases-overlay" onClick={onClose}>
      <div className="releases-modal" onClick={e => e.stopPropagation()}>
        <div className="releases-header">
          <div className="releases-header-icon"><i className="fa fa-file-text"></i></div>
          <div>
            <p className="releases-title">Lançamento de Despesas</p>
            <p className="releases-subtitle">Selecione o tipo e preencha os dados</p>
          </div>
          <button className="releases-close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>
        <div className="releases-tabs">
          {TABS.map(t => (
            <button key={t.key}
              className={`releases-tab ${activeTab === t.key ? "releases-tab--active" : ""}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="releases-body">
          {currentTab.showExpense && (
            <ExpenseFields expense={expense} onChange={handleExpenseChange} drivers={drivers} />
          )}
          {activeTab === "fuel"        && <FuelTab fuel={fuel} onChange={handleFuelChange} fuelTypes={fuelTypes} />}
          {activeTab === "maintenance" && <MaintenanceTab maintenance={maintenance} onChange={handleMaintenanceChange} addPart={addPart} removePart={removePart} />}
          {activeTab === "fines"       && <FinesTab fines={fines} onChange={handleFinesChange} />}
          {activeTab === "sinister"    && <SinisterTab sinister={sinister} onChange={handleSinisterChange} />}
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
          {activeTab === "trips" && (
            <div className="rel-section" style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
              <i className="fa fa-map fa-2x mb-2 d-block"></i>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Módulo de viagens em desenvolvimento.</p>
            </div>
          )}
        </div>
        <div className="releases-footer">
          <button className="btn-rel-back" onClick={onClose}>
            <i className="fa fa-arrow-left"></i> Voltar
          </button>
          <div className="d-flex gap-2">
            <button className="btn-rel-clear" onClick={clearForm}>
              <i className="fa fa-eraser text-white"></i> Limpar
            </button>
            {currentTab.expTypeId !== null && (
              <button className="btn-rel-save" onClick={handleSubmit} disabled={loading}>
                <i className="fa fa-check"></i> {loading ? "Salvando..." : "Salvar"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Releases;
