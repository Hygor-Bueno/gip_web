import { useMemo, MutableRefObject } from "react";
import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance } from "../../../Active/Interfaces/Interfaces";
import { IAddressForm } from "../types";

interface Props {
  activeTab: TabKey;
  expense: Expense;
  unitId: string;
  addressForm: IAddressForm;
  fuel: FuelData;
  maintenance: MaintenanceData;
  fines: FinesData;
  sinister: SinisterData;
  insurance: Partial<Insurance>;
  initialExpenseRef:       MutableRefObject<Expense>;
  initialUnitIdRef:        MutableRefObject<string>;
  initialAddressFormRef:   MutableRefObject<IAddressForm>;
  initialFuelRef:          MutableRefObject<FuelData>;
  initialMaintenanceRef:   MutableRefObject<MaintenanceData>;
  initialFinesRef:         MutableRefObject<FinesData>;
  initialSinisterRef:      MutableRefObject<SinisterData>;
  initialInsuranceRef:     MutableRefObject<Partial<Insurance>>;
}

/**
 * Compara estado atual com snapshots iniciais. O resultado separa cabeçalho
 * (Resumo da Despesa + Estabelecimento + Endereço) do subform por tipo, pra
 * o save mandar PUT só nas seções alteradas.
 *
 * `addressActive` é DELIBERADAMENTE excluído — toggle de visibilidade não
 * conta como alteração de dado.
 */
export function useDirtyCheck(p: Props) {
  return useMemo(() => {
    const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    const expenseDirty = !eq(p.expense, p.initialExpenseRef.current);
    const unitDirty    = p.unitId !== p.initialUnitIdRef.current;
    const addrDirty    = !eq(p.addressForm, p.initialAddressFormRef.current);

    let typeDirty = false;
    switch (p.activeTab) {
      case "fuel":        typeDirty = !eq(p.fuel,        p.initialFuelRef.current); break;
      case "maintenance": typeDirty = !eq(p.maintenance, p.initialMaintenanceRef.current); break;
      case "sinister":    typeDirty = !eq(p.sinister,    p.initialSinisterRef.current); break;
      case "fines":       typeDirty = !eq(p.fines,       p.initialFinesRef.current); break;
      case "insurance":   typeDirty = !eq(p.insurance,   p.initialInsuranceRef.current); break;
    }

    const dirtySections = {
      header: expenseDirty || unitDirty || addrDirty,
      type:   typeDirty,
    };
    return { dirtySections, isDirty: dirtySections.header || dirtySections.type };
  }, [
    p.activeTab, p.expense, p.unitId, p.addressForm,
    p.fuel, p.maintenance, p.fines, p.sinister, p.insurance,
    // refs intencionalmente fora — só são lidas, e mudanças nelas são
    // sempre acompanhadas de mudança de estado correspondente.
    p.initialExpenseRef, p.initialUnitIdRef, p.initialAddressFormRef,
    p.initialFuelRef, p.initialMaintenanceRef, p.initialFinesRef,
    p.initialSinisterRef, p.initialInsuranceRef,
  ]);
}
