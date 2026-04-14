import { useState, useCallback, useRef, useEffect } from "react";
import { handleNotification } from "../../../../../Util/ui/notifications";
import {
  ActiveForMovement,
  MovementFormState,
  LazyDepartament,
  LazySubdepartament,
} from "../../Interfaces/MovementInterfaces";
import {
  getDepartamentsByUnit,
  getSubdepartamentsByDep,
  postMovimentation,
} from "../../Adapters/MovementAdapters";

export const EMPTY_FORM: MovementFormState = {
  type_movimentation: "internal",
  unit_id_fk:         "",
  dep_id_fk:          "",
  sub_dep_id_fk:      "",
  obs_movimentation:  "",
};

/** Normalise a plate string for comparison — strips hyphens/spaces, uppercase */
export function normPlate(s: string) {
  return s.replace(/[\s\-]/g, "").toUpperCase();
}

export function useMovementForm(
  actives:   ActiveForMovement[],
  onSuccess: () => void,
) {
  const [phase, setPhase] = useState<0 | 1>(0);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [plateInput,  setPlateInput]  = useState("");

  const filterBtnRef   = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node) &&
        filterBtnRef.current   && !filterBtnRef.current.contains(e.target as Node)
      ) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const activeFilterCount = (search ? 1 : 0) + (plateInput ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setPlateInput("");
  }, []);

  // ── Client-side filtered list (text search + plate) ───────────────────────
  const filteredActives = actives.filter(a => {
    if (plateInput) {
      const plate = normPlate(a.license_plates ?? "");
      if (!plate || !plate.includes(normPlate(plateInput))) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchesText =
        String(a.active_id).includes(q) ||
        (a.brand             ?? "").toLowerCase().includes(q) ||
        (a.model             ?? "").toLowerCase().includes(q) ||
        (a.unit_name         ?? "").toLowerCase().includes(q) ||
        (a.desc_active_class ?? "").toLowerCase().includes(q) ||
        (a.license_plates    ?? "").toLowerCase().includes(q);
      if (!matchesText) return false;
    }
    return true;
  });

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedActives, setSelectedActives] = useState<ActiveForMovement[]>([]);
  const [form,            setForm]            = useState<MovementFormState>(EMPTY_FORM);
  const [departments,     setDepartments]     = useState<LazyDepartament[]>([]);
  const [subdepartaments, setSubdepartaments] = useState<LazySubdepartament[]>([]);
  const [loadingDepts,    setLoadingDepts]    = useState(false);
  const [loadingSubDepts, setLoadingSubDepts] = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [confirmCancel,   setConfirmCancel]   = useState(false);

  const toggleActive = useCallback((active: ActiveForMovement) => {
    setSelectedActives(prev =>
      prev.some(a => a.active_id === active.active_id)
        ? prev.filter(a => a.active_id !== active.active_id)
        : [...prev, active]
    );
  }, []);

  const handleAdvance = () => {
    if (!selectedActives.length) return;
    if (form.type_movimentation === "external" && selectedActives.length > 1) {
      handleNotification("Atenção", "Movimentação externa permite apenas 1 ativo por vez.", "warning");
      return;
    }
    setPhase(1);
  };

  const handleUnitChange = useCallback(async (unitId: string) => {
    setForm(f => ({ ...f, unit_id_fk: unitId, dep_id_fk: "", sub_dep_id_fk: "" }));
    setDepartments([]); setSubdepartaments([]);
    if (!unitId) return;
    setLoadingDepts(true);
    try {
      const res = await getDepartamentsByUnit(unitId);
      if (!res?.error) setDepartments(res.data ?? []);
    } finally { setLoadingDepts(false); }
  }, []);

  const handleDepChange = useCallback(async (depId: string) => {
    setForm(f => ({ ...f, dep_id_fk: depId, sub_dep_id_fk: "" }));
    setSubdepartaments([]);
    if (!depId) return;
    setLoadingSubDepts(true);
    try {
      const res = await getSubdepartamentsByDep(depId);
      if (!res?.error) setSubdepartaments(res.data ?? []);
    } finally { setLoadingSubDepts(false); }
  }, []);

  const handleReset = useCallback(() => {
    setPhase(0);
    setSearch(""); setPlateInput("");
    setSelectedActives([]); setForm(EMPTY_FORM);
    setDepartments([]); setSubdepartaments([]);
    setConfirmCancel(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.unit_id_fk) {
      handleNotification("Campo obrigatório", "Selecione a unidade de destino.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      for (const active of selectedActives) {
        const res = await postMovimentation({
          active_id_fk:       active.active_id,
          unit_id_fk:         Number(form.unit_id_fk),
          dep_id_fk:          form.dep_id_fk     ? Number(form.dep_id_fk)     : null,
          sub_dep_id_fk:      form.sub_dep_id_fk ? Number(form.sub_dep_id_fk) : null,
          type_movimentation: form.type_movimentation,
          obs_movimentation:  form.obs_movimentation.trim(),
        });
        if (res?.error) throw new Error(res.message ?? "Erro ao registrar movimentação.");
      }
      handleNotification(
        "Movimentação registrada",
        `${selectedActives.length} ativo(s) movimentado(s) com sucesso.`,
        "success"
      );
      handleReset(); onSuccess();
    } catch (e: any) {
      handleNotification("Erro ao registrar", e.message ?? "Tente novamente.", "danger");
    } finally { setSubmitting(false); }
  }, [form, selectedActives, handleReset, onSuccess]);

  return {
    // phase
    phase, setPhase,
    // filter
    filterOpen, setFilterOpen,
    search, setSearch,
    plateInput, setPlateInput,
    filterBtnRef, filterPanelRef,
    activeFilterCount,
    filteredActives,
    handleClearFilters,
    // selection + form
    selectedActives, setSelectedActives,
    form, setForm,
    departments,
    subdepartaments,
    loadingDepts,
    loadingSubDepts,
    submitting,
    confirmCancel, setConfirmCancel,
    // handlers
    toggleActive,
    handleAdvance,
    handleUnitChange,
    handleDepChange,
    handleReset,
    handleSubmit,
  };
}
