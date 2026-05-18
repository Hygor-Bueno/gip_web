/**
 * Cache em memória de listas-lookup do GTPP/CCPP (Company / Shop / Department).
 *
 * Por que existir: o formulário de "Nova Tarefa" (Cardregister) dispara
 * uma chamada a CCPP/Company.php cada vez que abre. Para o usuário ver
 * o card pronto na primeira tela, pré-carregamos no mount do módulo
 * GTPP e servimos do cache nas aberturas seguintes.
 *
 * O cache:
 *  - vive até o reload da página (escopo de módulo)
 *  - tem TTL configurável por entrada (default 10 min)
 *  - deduplica chamadas concorrentes via promise compartilhada
 *  - tem invalidate() pra forçar refetch (ex.: pós-mutação)
 */

import { iReqConn } from "../../../Interface/iConnection";

type FetchData = (req: iReqConn) => Promise<any>;

interface CacheEntry<T> {
  data: T[];
  expiresAt: number;
  pending?: Promise<T[]>;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutos

const caches: {
  company: CacheEntry<any> | null;
  shop: Record<string, CacheEntry<any> | undefined>;
  department: Record<string, CacheEntry<any> | undefined>;
} = {
  company: null,
  shop: {},
  department: {},
};

function isFresh<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  return !!entry && entry.expiresAt > Date.now();
}

// ─── Company ─────────────────────────────────────────────────────────

export async function getCompanies(
  fetchData: FetchData,
  options?: { force?: boolean; ttlMs?: number }
): Promise<any[]> {
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  if (!options?.force && isFresh(caches.company)) return caches.company.data;
  if (caches.company?.pending) return caches.company.pending;

  const pending = (async () => {
    try {
      const req = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Company.php" });
      const data = req?.data ?? [];
      caches.company = { data, expiresAt: Date.now() + ttl };
      return data;
    } catch (err) {
      caches.company = null;
      throw err;
    }
  })();
  caches.company = { data: caches.company?.data ?? [], expiresAt: 0, pending };
  return pending;
}

// ─── Shop (depende de company_id) ────────────────────────────────────

export async function getShops(
  fetchData: FetchData,
  companyId: number | string,
  options?: { force?: boolean; ttlMs?: number }
): Promise<any[]> {
  const key = String(companyId);
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const existing = caches.shop[key];
  if (!options?.force && isFresh(existing)) return existing.data;
  if (existing?.pending) return existing.pending;

  const pending = (async () => {
    try {
      const req = await fetchData({
        method: "GET", params: null,
        pathFile: "CCPP/Shop.php", urlComplement: `&company_id=${companyId}`,
      });
      if (req.error) throw new Error(req.message);
      const data = req?.data ?? [];
      caches.shop[key] = { data, expiresAt: Date.now() + ttl };
      return data;
    } catch (err) {
      caches.shop[key] = undefined;
      throw err;
    }
  })();
  caches.shop[key] = { data: existing?.data ?? [], expiresAt: 0, pending };
  return pending;
}

// ─── Department (depende de shop_id) ─────────────────────────────────

export async function getDepartments(
  fetchData: FetchData,
  shopId: number | string,
  options?: { force?: boolean; ttlMs?: number }
): Promise<any[]> {
  const key = String(shopId);
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const existing = caches.department[key];
  if (!options?.force && isFresh(existing)) return existing.data;
  if (existing?.pending) return existing.pending;

  const pending = (async () => {
    try {
      const req = await fetchData({
        method: "GET", params: null,
        pathFile: "CCPP/Department.php", urlComplement: `&shop_id=${shopId}`,
      });
      if (req.error) throw new Error(req.message);
      const data = req?.data ?? [];
      caches.department[key] = { data, expiresAt: Date.now() + ttl };
      return data;
    } catch (err) {
      caches.department[key] = undefined;
      throw err;
    }
  })();
  caches.department[key] = { data: existing?.data ?? [], expiresAt: 0, pending };
  return pending;
}

// ─── Invalidação manual ──────────────────────────────────────────────

export function invalidateLookupsCache(target?: "company" | "shop" | "department" | "all"): void {
  if (!target || target === "all") {
    caches.company = null;
    caches.shop = {};
    caches.department = {};
    return;
  }
  if (target === "company") caches.company = null;
  if (target === "shop") caches.shop = {};
  if (target === "department") caches.department = {};
}

/** Estado debug — útil em testes/DevTools. */
export function _debugLookupsCache() {
  return {
    company: caches.company,
    shop: { ...caches.shop },
    department: { ...caches.department },
  };
}
