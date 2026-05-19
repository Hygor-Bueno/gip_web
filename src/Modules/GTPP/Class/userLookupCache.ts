/**
 * Cache em memória dos funcionários (CCPP/Employee.php).
 *
 * Carregado lazy na primeira vez que um drill-down de KPI é aberto.
 * Vive até o reload da página; expõe um Map<id, {name, photo}> pronto
 * pra consumo dos cards do drill panel (avatar + nome do responsável).
 */

import { iReqConn } from "../../../Interface/iConnection";

type FetchData = (req: iReqConn) => Promise<any>;

export interface EmployeeInfo {
  id: number;
  name: string;
  photo: string; // base64 sem prefixo data:
}

const cache: {
  map: Map<number, EmployeeInfo>;
  loaded: boolean;
  loading: Promise<void> | null;
} = { map: new Map(), loaded: false, loading: null };

async function fetchAllPages(fetchData: FetchData): Promise<void> {
  let page = 1;
  // Limite alto pra evitar loop infinito se backend retornar limitPage inconsistente
  const MAX_PAGES = 100;
  while (page <= MAX_PAGES) {
    const res: any = await fetchData({
      method: "GET",
      params: null,
      pathFile: "CCPP/Employee.php",
      urlComplement: `&pPage=${page}`,
    });
    if (res?.error) break;
    const list: any[] = Array.isArray(res?.data) ? res.data : [];
    for (const emp of list) {
      const id = Number(emp.employee_id);
      if (!Number.isNaN(id) && id > 0) {
        cache.map.set(id, {
          id,
          name: String(emp.employee_name ?? ""),
          photo: String(emp.employee_photo ?? ""),
        });
      }
    }
    const limit = Number(res?.limitPage ?? 1);
    if (page >= limit || list.length === 0) break;
    page++;
  }
  cache.loaded = true;
}

export async function ensureEmployees(fetchData: FetchData): Promise<Map<number, EmployeeInfo>> {
  if (cache.loaded) return cache.map;
  if (!cache.loading) {
    cache.loading = fetchAllPages(fetchData).finally(() => { cache.loading = null; });
  }
  try { await cache.loading; } catch { /* swallow */ }
  return cache.map;
}

export function getCachedEmployees(): Map<number, EmployeeInfo> {
  return cache.map;
}

export function isEmployeesLoaded(): boolean {
  return cache.loaded;
}
