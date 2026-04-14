/**
 * Testa os formatadores de valor usados nas colunas de tabela da tela de Configurações.
 *
 * Dois padrões coexistem no módulo:
 *   - Number:  v => Number(v) !== 0 ? "Ativo" : "Inativo"
 *              (CompanyTab, UnitsTab, DepartamentsTab, SubdepartamentsTab)
 *   - String:  v => String(v) !== "0" ? "Ativo" : "Inativo"
 *              (ActiveTypeTab, ActiveClassTab)
 *
 * Os formatadores são lambdas inline nos componentes — aqui são extraídos como
 * funções puras para teste isolado, sem renderização React.
 */

// ─── Formatadores espelhando os componentes ───────────────────────────────────

/** Usado em CompanyTab, UnitsTab, DepartamentsTab, SubdepartamentsTab */
const numberStatusFormatter = (v: unknown): string =>
  Number(v) !== 0 ? "Ativo" : "Inativo";

/** Usado em ActiveTypeTab, ActiveClassTab */
const stringStatusFormatter = (v: unknown): string =>
  String(v) !== "0" ? "Ativo" : "Inativo";

// ─────────────────────────────────────────────────────────────────────────────
describe("numberStatusFormatter (Number(v) !== 0)", () => {
  // ── Ativo ──
  it("número 1 → 'Ativo'",   () => expect(numberStatusFormatter(1)).toBe("Ativo"));
  it("número 2 → 'Ativo'",   () => expect(numberStatusFormatter(2)).toBe("Ativo"));
  it("número -1 → 'Ativo'",  () => expect(numberStatusFormatter(-1)).toBe("Ativo"));
  it("string '1' → 'Ativo'", () => expect(numberStatusFormatter("1")).toBe("Ativo"));
  it("string '2' → 'Ativo'", () => expect(numberStatusFormatter("2")).toBe("Ativo"));
  it("boolean true → 'Ativo'", () => expect(numberStatusFormatter(true)).toBe("Ativo"));

  // ── Inativo ──
  it("número 0 → 'Inativo'",    () => expect(numberStatusFormatter(0)).toBe("Inativo"));
  it("string '0' → 'Inativo'",  () => expect(numberStatusFormatter("0")).toBe("Inativo"));
  it("boolean false → 'Inativo'", () => expect(numberStatusFormatter(false)).toBe("Inativo"));
  it("null → 'Inativo'",         () => expect(numberStatusFormatter(null)).toBe("Inativo"));
  it("undefined → 'Ativo' (Number(undefined) = NaN, NaN !== 0 é true)", () =>
    expect(numberStatusFormatter(undefined)).toBe("Ativo"));
  it("string '' → 'Inativo'",    () => expect(numberStatusFormatter("")).toBe("Inativo"));

  // ── Consistência ──
  it("resultado é sempre 'Ativo' ou 'Inativo'", () => {
    const values = [0, 1, "0", "1", null, undefined, true, false, "", "ativo"];
    values.forEach(v => {
      const result = numberStatusFormatter(v);
      expect(["Ativo", "Inativo"]).toContain(result);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("stringStatusFormatter (String(v) !== '0')", () => {
  // ── Ativo ──
  it("string '1' → 'Ativo'",   () => expect(stringStatusFormatter("1")).toBe("Ativo"));
  it("string '2' → 'Ativo'",   () => expect(stringStatusFormatter("2")).toBe("Ativo"));
  it("número 1 → 'Ativo'",     () => expect(stringStatusFormatter(1)).toBe("Ativo"));
  it("boolean true → 'Ativo'", () => expect(stringStatusFormatter(true)).toBe("Ativo"));
  it("string 'ativo' → 'Ativo'", () => expect(stringStatusFormatter("ativo")).toBe("Ativo"));

  // ── Inativo ──
  it("string '0' → 'Inativo'",  () => expect(stringStatusFormatter("0")).toBe("Inativo"));
  it("número 0 → 'Inativo'",    () => expect(stringStatusFormatter(0)).toBe("Inativo"));

  // ── Casos que diferem entre os dois formatadores ──
  it("null → 'Ativo' (String(null) = 'null', não '0')", () =>
    expect(stringStatusFormatter(null)).toBe("Ativo"));
  it("undefined → 'Ativo' (String(undefined) = 'undefined', não '0')", () =>
    expect(stringStatusFormatter(undefined)).toBe("Ativo"));
  it("string '' → 'Ativo' (String('') = '', não '0')", () =>
    expect(stringStatusFormatter("")).toBe("Ativo"));

  // ── Consistência ──
  it("resultado é sempre 'Ativo' ou 'Inativo'", () => {
    const values = [0, 1, "0", "1", "2", true, false];
    values.forEach(v => {
      const result = stringStatusFormatter(v);
      expect(["Ativo", "Inativo"]).toContain(result);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Diferença entre os dois formatadores", () => {
  it("número 0: ambos retornam 'Inativo'", () => {
    expect(numberStatusFormatter(0)).toBe("Inativo");
    expect(stringStatusFormatter(0)).toBe("Inativo");
  });

  it("string '0': ambos retornam 'Inativo'", () => {
    expect(numberStatusFormatter("0")).toBe("Inativo");
    expect(stringStatusFormatter("0")).toBe("Inativo");
  });

  it("string '1': ambos retornam 'Ativo'", () => {
    expect(numberStatusFormatter("1")).toBe("Ativo");
    expect(stringStatusFormatter("1")).toBe("Ativo");
  });

  it("null: numberFormatter → 'Inativo', stringFormatter → 'Ativo'", () => {
    expect(numberStatusFormatter(null)).toBe("Inativo");
    expect(stringStatusFormatter(null)).toBe("Ativo");
  });

  it("undefined: ambos retornam 'Ativo' (NaN !== 0; String(undefined) !== '0')", () => {
    expect(numberStatusFormatter(undefined)).toBe("Ativo");
    expect(stringStatusFormatter(undefined)).toBe("Ativo");
  });
});
