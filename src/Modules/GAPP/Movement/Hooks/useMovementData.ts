import { useState, useEffect, useCallback } from "react";
import { getActives, getMovimentations, getVehicles } from "../Adapters/MovementAdapters";
import { ActiveUnitsData } from "../../Active/Adapters/Adapters";
import { ActiveForMovement, Movimentation } from "../Interfaces/MovementInterfaces";
import { Unit } from "../../Active/Interfaces/OrgInterfaces";

export function useMovementData() {
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState<string | null>(null);

  const [actives,        setActives]        = useState<ActiveForMovement[]>([]);
  const [units,          setUnits]          = useState<Unit[]>([]);
  const [movimentations, setMovimentations] = useState<Movimentation[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [rActives, rVehicles, rUnits, rMovs] = await Promise.all([
        getActives(),
        getVehicles(),
        ActiveUnitsData(),
        getMovimentations(),
      ]);

      // Build a map: active_id_fk → { license_plates, ... } from Vehicle table
      const vehicleMap = new Map<number, { license_plates: string; is_vehicle: number }>();
      if (!rVehicles?.error && Array.isArray(rVehicles?.data)) {
        for (const v of rVehicles.data) {
          const id = Number(v.active_id_fk);
          if (!isNaN(id)) {
            vehicleMap.set(id, {
              license_plates: v.license_plates ?? "",
              is_vehicle:     1,
            });
          }
        }
      }

      // Join license_plates onto each active
      if (!rActives?.error) {
        const enriched: ActiveForMovement[] = (rActives.data ?? []).map((a: any) => {
          const veh = vehicleMap.get(Number(a.active_id));
          return {
            ...a,
            license_plates: veh?.license_plates ?? "",
            is_vehicle:     veh ? 1 : 0,
          };
        });
        setActives(enriched);
      }

      if (!rUnits?.error) setUnits(rUnits.data   ?? []);
      if (!rMovs?.error)  setMovimentations(rMovs.data ?? []);
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return {
    loading, loadError, loadAll,
    actives,
    units,
    movimentations, setMovimentations,
  };
}
