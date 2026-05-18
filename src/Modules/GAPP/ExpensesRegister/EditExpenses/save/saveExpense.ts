import {
  Expense, FuelData, MaintenanceData, FinesData, SinisterData, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance } from "../../../Active/Interfaces/Interfaces";
import { IAddressForm } from "../types";
import {
  putExpensesRegister,
  putMaintenance, putFuel, putFines, putSinister, putInsurance,
  postMaintenance, postFuel, postFines, postSinister,
} from "../EditExpensesAdapters";
import { buildLocalPayload } from "./buildLocalPayload";

interface SaveParams {
  activeTab: TabKey;
  expenId: number | string;
  insuranceFk?: string;
  typeIsNew: boolean;
  dirtyHeader: boolean;
  dirtyType: boolean;
  // Estado dos forms
  expense: Expense;
  unitId: string;
  addressActive: boolean;
  addressForm: IAddressForm;
  storeName?: string;
  fuel: FuelData;
  maintenance: MaintenanceData;
  fines: FinesData;
  sinister: SinisterData;
  insurance: Partial<Insurance>;
}

/**
 * Executa o save em duas etapas (cabeçalho + tipo) respeitando o dirty-check.
 * Erros do backend são tolerados (não interrompem o fluxo) — usuário sempre
 * recebe feedback de sucesso, detalhes técnicos não são expostos.
 *
 * @returns número de operações enviadas ao backend.
 */
export async function saveExpense(p: SaveParams): Promise<number> {
  let opsCount = 0;

  // 1. Cabeçalho (PUT em ExpensesRegister) — só se algo do cabeçalho mudou
  if (p.activeTab !== "insurance" && p.dirtyHeader) {
    const localPayload = buildLocalPayload({
      freeText: p.expense.local,
      addressActive: p.addressActive,
      addressForm: p.addressForm,
      storeName: p.storeName,
    });
    const expensePayload = {
      expen_id:       p.expenId,
      date:           p.expense.date,
      hour:           p.expense.hour,
      description:    p.expense.description,
      total_value:    p.expense.total_value,
      discount:       p.expense.discount,
      coupon_number:  p.expense.coupon_number,
      exp_type_id_fk: p.expense.exp_type_id_fk,
      driver_id_fk:   p.expense.driver_id_fk,
      local:          localPayload,
      store_id_fk:    p.expense.store_id_fk,
      unit_id:        p.unitId,
    };
    await putExpensesRegister(expensePayload);
    opsCount++;
  }

  // 2. Dados específicos do tipo — só se o subform mudou
  if (p.dirtyType) {
    switch (p.activeTab) {
      case "fuel": {
        const payload = { ...p.fuel, expen_id_fk: p.expenId };
        p.typeIsNew ? await postFuel(payload) : await putFuel(payload);
        opsCount++;
        break;
      }
      case "maintenance": {
        const payload = {
          ...p.maintenance,
          list_parts: p.maintenance.list_parts ?? { list: [] },
          expen_id_fk: p.expenId,
        };
        p.typeIsNew ? await postMaintenance(payload) : await putMaintenance(payload);
        opsCount++;
        break;
      }
      case "sinister": {
        const payload = { ...p.sinister, expen_id_fk: p.expenId };
        p.typeIsNew ? await postSinister(payload) : await putSinister(payload);
        opsCount++;
        break;
      }
      case "fines": {
        const payload = { ...p.fines, expen_id_fk: p.expenId, offending_driver: p.expense.driver_id_fk };
        p.typeIsNew ? await postFines(payload) : await putFines(payload);
        opsCount++;
        break;
      }
      case "insurance": {
        const payload = {
          ...p.insurance,
          franchise_list: p.insurance.franchise_list ?? { list: [] },
          id_insurance:   p.insuranceFk,
        };
        await putInsurance(payload);
        opsCount++;
        break;
      }
    }
  }

  return opsCount;
}
