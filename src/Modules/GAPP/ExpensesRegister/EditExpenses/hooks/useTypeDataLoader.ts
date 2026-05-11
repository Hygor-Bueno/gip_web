import { useEffect, MutableRefObject, Dispatch, SetStateAction } from "react";
import {
  FuelData, MaintenanceData, FinesData, SinisterData, TabKey,
} from "../../../Active/Component/Releases/Interfaces";
import { Insurance } from "../../../Active/Interfaces/Interfaces";
import {
  defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance,
} from "../../../Active/Component/Releases/defaultValues";
import {
  getAllFuel, getAllMaintenance, getAllFines,
  getSinisterByExpense, getInsuranceById,
} from "../EditExpensesAdapters";
import { parseListParts, parseFranchiseList } from "../helpers";

interface Props {
  activeTab: TabKey;
  expenId: number | string;
  insuranceFk?: string;
  setFuel:        Dispatch<SetStateAction<FuelData>>;
  setMaintenance: Dispatch<SetStateAction<MaintenanceData>>;
  setFines:       Dispatch<SetStateAction<FinesData>>;
  setSinister:    Dispatch<SetStateAction<SinisterData>>;
  setInsurance:   Dispatch<SetStateAction<Partial<Insurance>>>;
  setTypeIsNew:   Dispatch<SetStateAction<boolean>>;
  setLoading:     (v: boolean) => void;
  initialFuelRef:        MutableRefObject<FuelData>;
  initialMaintenanceRef: MutableRefObject<MaintenanceData>;
  initialFinesRef:       MutableRefObject<FinesData>;
  initialSinisterRef:    MutableRefObject<SinisterData>;
  initialInsuranceRef:   MutableRefObject<Partial<Insurance>>;
}

/**
 * Carrega os dados específicos do tipo da despesa.
 * Para Fuel/Maintenance/Fines usa "list-all + find" porque o filtro direto
 * por `expen_id_fk` está quebrado no PHP. Sinister e Insurance usam o filtro
 * tradicional. Todos os GETs são silenciosos em caso de erro.
 */
export function useTypeDataLoader(p: Props) {
  useEffect(() => {
    async function tryLoadAndFind(fn: () => Promise<any>, onSuccess: (raw: any) => void) {
      try {
        const r = await fn();
        if (!r.error && Array.isArray(r.data)) {
          const found = r.data.find((x: any) => String(x.expen_id_fk) === String(p.expenId));
          if (found) { onSuccess(found); return; }
        }
      } catch { /* silenciado */ }
      p.setTypeIsNew(true);
    }

    async function tryLoadFirst(fn: () => Promise<any>, onSuccess: (raw: any) => void) {
      try {
        const r = await fn();
        if (!r.error && r.data?.length) { onSuccess(r.data[0]); return; }
      } catch { /* silenciado */ }
      p.setTypeIsNew(true);
    }

    (async () => {
      try {
        p.setLoading(true);
        switch (p.activeTab) {
          case "fuel":
            await tryLoadAndFind(getAllFuel, raw => {
              const next = { ...defaultFuel, ...raw };
              p.initialFuelRef.current = next;
              p.setFuel(next);
            });
            break;
          case "maintenance":
            await tryLoadAndFind(getAllMaintenance, raw => {
              const next: MaintenanceData = {
                ...defaultMaintenance, ...raw,
                list_parts: parseListParts(raw.list_parts),
                warranty: Number(raw.warranty ?? 0),
              };
              p.initialMaintenanceRef.current = next;
              p.setMaintenance(next);
            });
            break;
          case "sinister":
            // Sinister.php?all=1 também está quebrado no PHP → fallback no filtro direto
            await tryLoadFirst(() => getSinisterByExpense(p.expenId), raw => {
              const next = { ...defaultSinister, ...raw };
              p.initialSinisterRef.current = next;
              p.setSinister(next);
            });
            break;
          case "fines":
            await tryLoadAndFind(getAllFines, raw => {
              const next = { ...defaultFines, ...raw };
              p.initialFinesRef.current = next;
              p.setFines(next);
            });
            break;
          case "insurance":
            if (p.insuranceFk) {
              await tryLoadFirst(() => getInsuranceById(p.insuranceFk!), raw => {
                const next: Partial<Insurance> = {
                  ...defaultInsurance, ...raw,
                  franchise_list: parseFranchiseList(raw.franchise_list),
                };
                p.initialInsuranceRef.current = next;
                p.setInsurance(next);
              });
            }
            break;
        }
      } finally {
        p.setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.expenId, p.activeTab]);
}
