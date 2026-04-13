import { useState, useEffect } from "react";
import { useMyContext } from "../../../../Context/MainContext";
import { GappUserData } from "../../Active/Adapters/Adapters";
import {
  getActiveTypes, getActiveClasses,
  getCompanies, getUnits,
  getDepartaments, getSubdepartaments,
} from "../Adapters/SettingsAdapters";
import { ActiveClass, Subdepartament } from "../Interfaces/SettingsInterfaces";
import { ActiveType, Company, Unit, Departament } from "../../Active/Interfaces/OrgInterfaces";

export function useSettingsData() {
  const { userLog } = useMyContext();

  const [loading,           setLoading]           = useState(true);
  const [loadError,         setLoadError]         = useState<string | null>(null);
  const [gappWorkGroupId,   setGappWorkGroupId]   = useState<number | null>(null);

  const [activeTypes,       setActiveTypes]       = useState<ActiveType[]>([]);
  const [activeClasses,     setActiveClasses]     = useState<ActiveClass[]>([]);
  const [companies,         setCompanies]         = useState<Company[]>([]);
  const [units,             setUnits]             = useState<Unit[]>([]);
  const [departaments,      setDepartaments]      = useState<Departament[]>([]);
  const [subdepartaments,   setSubdepartaments]   = useState<Subdepartament[]>([]);

  // ── Resolve GAPP user ──────────────────────────────────────────────────────
  useEffect(() => {
    if (userLog?.id) {
      GappUserData(userLog.id).then(res => {
        if (!res?.error && res?.data?.length) {
          setGappWorkGroupId(res.data[0].group_id_fk ?? null);
        }
      });
    }
  }, [userLog?.id]);

  // ── Load all catalog data in parallel ──────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [rTypes, rClasses, rCompanies, rUnits, rDepts, rSubDepts] = await Promise.all([
        getActiveTypes(),
        getActiveClasses(),
        getCompanies(),
        getUnits(),
        getDepartaments(),
        getSubdepartaments(),
      ]);
      if (!rTypes?.error)     setActiveTypes(rTypes.data     ?? []);
      if (!rClasses?.error)   setActiveClasses(rClasses.data ?? []);
      if (!rCompanies?.error) setCompanies(rCompanies.data   ?? []);
      if (!rUnits?.error)     setUnits(rUnits.data           ?? []);
      if (!rDepts?.error)     setDepartaments(rDepts.data    ?? []);
      if (!rSubDepts?.error)  setSubdepartaments(rSubDepts.data ?? []);
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  return {
    loading, loadError, loadAll, gappWorkGroupId,
    activeTypes,      setActiveTypes,
    activeClasses,    setActiveClasses,
    companies,        setCompanies,
    units,            setUnits,
    departaments,     setDepartaments,
    subdepartaments,  setSubdepartaments,
  };
}
