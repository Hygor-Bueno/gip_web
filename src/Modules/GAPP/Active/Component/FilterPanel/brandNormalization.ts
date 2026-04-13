/**
 * Static dictionary mapping known typos and variations to their correct brand name.
 * Key   → trimmed + uppercased + trailing-number-stripped variant.
 * Value → canonical brand name (uppercase).
 *
 * Add new entries here whenever a new typo or abbreviation is found in the data.
 */
const BRAND_MAP: Record<string, string> = {
  // ── Volkswagen ──────────────────────────────
  "VOLKSWAGEM":       "VOLKSWAGEN",
  "VOLKS WAGEN":      "VOLKSWAGEN",
  "WOLKSVAGEN":       "VOLKSWAGEN",
  "VW":               "VOLKSWAGEN",

  // ── Chevrolet ───────────────────────────────
  "CHEVROLETT":       "CHEVROLET",
  "CHEVROLT":         "CHEVROLET",
  "CHEVY":            "CHEVROLET",
  "GM":               "CHEVROLET",

  // ── Mercedes-Benz ───────────────────────────
  "MERCEDES BENZ":    "MERCEDES-BENZ",
  "MERCEDEZ":         "MERCEDES-BENZ",
  "MERCEDEZ-BENZ":    "MERCEDES-BENZ",
  "MERCEDES":         "MERCEDES-BENZ",

  // ── Toyota ──────────────────────────────────
  "TOYATA":           "TOYOTA",
  "TOYOYTA":          "TOYOTA",
  "TOYOTTA":          "TOYOTA",

  // ── Ford ────────────────────────────────────
  "FORDE":            "FORD",

  // ── Fiat ────────────────────────────────────
  "FIATT":            "FIAT",
  "FIAT MOBI":        "FIAT",

  // ── Honda ───────────────────────────────────
  "HONDDA":           "HONDA",

  // ── Hyundai ─────────────────────────────────
  "HUNDAI":           "HYUNDAI",
  "HUNDAYI":          "HYUNDAI",
  "HYUNDAY":          "HYUNDAI",

  // ── Renault ─────────────────────────────────
  "RENAULD":          "RENAULT",
  "RENALD":           "RENAULT",

  // ── Nissan ──────────────────────────────────
  "NISAN":            "NISSAN",

  // ── Mitsubishi ──────────────────────────────
  "MITSUBICHI":       "MITSUBISHI",
  "MITUSBISHI":       "MITSUBISHI",
  "MITSUBISH":        "MITSUBISHI",

  // ── Peugeot ─────────────────────────────────
  "PEUGEOUT":         "PEUGEOT",
  "PEUGOT":           "PEUGEOT",

  // ── Citroën ─────────────────────────────────
  "CITROEN":          "CITROËN",
  "CITROEM":          "CITROËN",
};

/**
 * Normalizes a raw brand string:
 * 1. Trim whitespace and uppercase.
 * 2. Strip trailing numbers (e.g. "Volkswagen 1" → "VOLKSWAGEN").
 * 3. Look up the result in BRAND_MAP.
 * 4. Return the canonical name if found; otherwise return the cleaned value.
 */
export function normalizeBrand(raw: string): string {
  const clean = raw.trim().toUpperCase().replace(/\s+\d+$/, "").trim();
  return BRAND_MAP[clean] ?? clean;
}
