import { PartItem } from "../../Active/Component/Releases/Interfaces";
import { IAddressForm, emptyAddress } from "./types";

/** Converte qualquer valor para string segura — nunca devolve "[object Object]". */
export function safeString(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { return ""; }
  }
  return String(v);
}

/** Parse defensivo do campo `list_parts` (chega como string JSON ou objeto). */
export function parseListParts(raw: any): { list: PartItem[] } {
  if (!raw) return { list: [] };
  if (typeof raw === "object" && Array.isArray(raw.list)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.list) ? parsed : { list: [] };
    } catch { return { list: [] }; }
  }
  return { list: [] };
}

/** Parse defensivo do campo `franchise_list` do seguro. */
export function parseFranchiseList(raw: any): { list: any[] } {
  if (!raw) return { list: [] };
  if (typeof raw === "object" && Array.isArray(raw.list)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.list) ? parsed : { list: [] };
    } catch { return { list: [] }; }
  }
  return { list: [] };
}

/** Detecta se `place_purchase` contém um endereço serializado em JSON. */
export function tryParseAddress(raw: any): IAddressForm | null {
  if (!raw) return null;
  if (typeof raw === "object") {
    return { ...emptyAddress, ...raw };
  }
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return { ...emptyAddress, ...parsed };
    } catch { /* noop */ }
  }
  return null;
}

/** Resolve endereço da loja a partir do array em memória — sem hit no backend. */
export function buildAddressFromStore(storesData: any[], storeId: string): IAddressForm | null {
  if (!storeId) return null;
  const s = storesData.find((x: any) => String(x.store_id) === String(storeId));
  if (!s) return null;
  return {
    name:       s.name       ?? "",
    street:     s.street     ?? "",
    district:   s.district   ?? "",
    city:       s.city       ?? "",
    state:      s.state      ?? "",
    zip_code:   s.zip_code   ?? "",
    number:     s.number     ?? "",
    complement: s.complement ?? "",
  };
}

/**
 * Combina dois endereços: para cada campo, usa o valor de `primary` se não-vazio,
 * senão cai no valor de `fallback`. Usado pra completar lacunas do JSON salvo
 * (place_purchase) com dados do cadastro da loja.
 */
export function mergeAddressForm(primary: IAddressForm, fallback: IAddressForm | null): IAddressForm {
  if (!fallback) return primary;
  const pick = (a: string, b: string) => (a && a.trim() ? a : b);
  return {
    name:       pick(primary.name,       fallback.name),
    street:     pick(primary.street,     fallback.street),
    district:   pick(primary.district,   fallback.district),
    city:       pick(primary.city,       fallback.city),
    state:      pick(primary.state,      fallback.state),
    zip_code:   pick(primary.zip_code,   fallback.zip_code),
    number:     pick(primary.number,     fallback.number),
    complement: pick(primary.complement, fallback.complement),
  };
}

/** True se TODOS os campos do endereço são vazios. */
export function isAddressEmpty(a: IAddressForm): boolean {
  return Object.values(a).every(v => !v || (typeof v === "string" && !v.trim()));
}
