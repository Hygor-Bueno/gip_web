import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ActiveFilters, defaultFilters } from "../FilterPanel/FilterPanel";
import { normalizeBrand } from "../FilterPanel/brandNormalization";
import { Active } from "../../Interfaces/Interfaces";
import { ActiveVehicleByPlate } from "../../Adapters/Adapters";
import { convertForTable, distinct } from "../../../../../Util/Utils";
import { customTagsActive, customValueActive, listColumnsOcult } from "../../ConfigurationTable/ConfigurationTable";
import { handleNotification } from "../../../../../Util/ui/notifications";
import { tItemTable } from "../../../../../types/types";

const FILTER_KEY = "gapp_active_filters";

export interface UseActiveFiltersReturn {
  filters:            ActiveFilters;
  setFilters:         React.Dispatch<React.SetStateAction<ActiveFilters>>;
  plateIds:           Set<string>;
  filterOpen:         boolean;
  setFilterOpen:      React.Dispatch<React.SetStateAction<boolean>>;
  filterBtnRef:       React.RefObject<HTMLButtonElement>;
  enrichedData:       { raw: Active; id: string; status: string; value: number; unit: string; brand: string }[];
  filteredData:       Active[];
  unitNames:          string[];
  brands:             string[];
  activeFilterCount:  number;
  tableList:          tItemTable[];
  handlePlateSearch:  (plate: string) => Promise<void>;
  handleClearFilters: () => void;
}

export function useActiveFilters(data: Active[]): UseActiveFiltersReturn {
  const [filters, setFilters] = useState<ActiveFilters>(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY);
      return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });

  const [plateIds,   setPlateIds]   = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(() =>
    Object.values(filters).some(v => v !== "")
  );

  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Persist filters on every change
  useEffect(() => {
    try { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); } catch { /* quota exceeded */ }
  }, [filters]);

  const handlePlateSearch = useCallback(async (plate: string) => {
    if (!plate.trim()) { setPlateIds(new Set()); return; }
    try {
      const res = await ActiveVehicleByPlate(plate.trim());
      if (res.error || !res.data?.length) {
        handleNotification("Placa não encontrada", "Nenhum veículo encontrado para a placa informada.", "warning");
        setPlateIds(new Set());
        return;
      }
      const ids = new Set<string>(res.data.map((v: any) => String(v.active_id_fk)));
      setPlateIds(ids);
    } catch {
      setPlateIds(new Set());
    }
  }, []);

  // Re-run plate search on mount if one was saved
  useEffect(() => {
    if (filters.plate) handlePlateSearch(filters.plate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPlateIds(new Set());
    try { localStorage.removeItem(FILTER_KEY); } catch { /* ignore */ }
  }, []);

  // Pre-normalize expensive fields once
  const enrichedData = useMemo(() =>
    (data ?? []).map(a => ({
      raw:    a,
      id:     String(a.active_id),
      status: String(a.status_active),
      value:  Number(a.value_purchase),
      unit:   (a.unit_name ?? "").trim().toUpperCase(),
      brand:  normalizeBrand((a.brand ?? "").split("-")[0]),
    })),
  [data]);

  // Single-pass filter
  const filteredData = useMemo(() => {
    const minVal = filters.valueMin ? Number(filters.valueMin) : null;
    const maxVal = filters.valueMax ? Number(filters.valueMax) : null;

    return enrichedData
      .filter(a => {
        if (plateIds.size > 0 && !plateIds.has(a.id))                           return false;
        if (filters.status   && a.status !== filters.status)                     return false;
        if (minVal !== null  && a.value  <  minVal)                              return false;
        if (maxVal !== null  && a.value  >  maxVal)                              return false;
        if (filters.unitName && a.unit   !== filters.unitName.trim().toUpperCase()) return false;
        if (filters.brand    && a.brand  !== filters.brand)                      return false;
        return true;
      })
      .map(a => a.raw);
  }, [enrichedData, filters, plateIds]);

  const unitNames = useMemo(() => distinct(data.map(a => a.unit_name)), [data]);
  const brands    = useMemo(() => distinct(enrichedData.map(a => a.brand)), [enrichedData]);

  const activeFilterCount = useMemo(() =>
    Object.entries(filters).filter(([k, v]) => k !== "plate" && v !== "").length
    + (plateIds.size > 0 ? 1 : 0),
  [filters, plateIds]);

  const tableList = useMemo(() => convertForTable(filteredData ?? [], {
    ocultColumns: listColumnsOcult,
    customTags:   customTagsActive,
    customValue:  customValueActive,
  }), [filteredData]);

  return {
    filters, setFilters,
    plateIds,
    filterOpen, setFilterOpen,
    filterBtnRef,
    enrichedData, filteredData,
    unitNames, brands,
    activeFilterCount,
    tableList,
    handlePlateSearch, handleClearFilters,
  };
}
