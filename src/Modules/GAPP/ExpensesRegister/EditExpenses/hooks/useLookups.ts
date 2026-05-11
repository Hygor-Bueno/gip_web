import { useEffect, useState } from "react";
import { InfractionItem, TabKey } from "../../../Active/Component/Releases/Interfaces";
import { Schema } from "../../../Active/Interfaces/Interfaces";
import {
  getDrivers, getFuelTypes, getInfractions,
  getUtilization, getInsuranceCompany, getTypeCoverage,
} from "../EditExpensesAdapters";

/**
 * Carrega listas auxiliares usadas pelo modal de edição.
 * - Drivers: sempre (usado pelo Resumo da Despesa)
 * - FuelTypes / Infractions / (Utilization+InsuranceCompany+TypeCoverage):
 *   sob demanda, conforme aba ativa.
 */
export function useLookups(activeTab: TabKey) {
  const [drivers,          setDrivers]          = useState<Schema[]>([]);
  const [fuelTypes,        setFuelTypes]        = useState<Schema[]>([]);
  const [infractions,      setInfractions]      = useState<InfractionItem[]>([]);
  const [utilization,      setUtilization]      = useState<Schema[]>([]);
  const [insuranceCompany, setInsuranceCompany] = useState<Schema[]>([]);
  const [typeCoverage,     setTypeCoverage]     = useState<Schema[]>([]);

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

  return { drivers, fuelTypes, infractions, utilization, insuranceCompany, typeCoverage };
}
