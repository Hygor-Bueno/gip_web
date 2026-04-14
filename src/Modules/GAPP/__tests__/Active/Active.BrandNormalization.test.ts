/**
 * Testa a normalização de nomes de marcas via dicionário estático (BRAND_MAP).
 * Cobre: mapeamento direto de typos, abreviações, sufixo numérico, trim/uppercase e fallback.
 */
export {};

import { normalizeBrand } from "../../Active/Component/FilterPanel/brandNormalization";

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Volkswagen", () => {
  it("'Volkswagem' → 'VOLKSWAGEN'  (M→N)", () => {
    expect(normalizeBrand("Volkswagem")).toBe("VOLKSWAGEN");
  });

  it("'Volks Wagen' → 'VOLKSWAGEN'  (espaço no meio)", () => {
    expect(normalizeBrand("Volks Wagen")).toBe("VOLKSWAGEN");
  });

  it("'Wolksvagen' → 'VOLKSWAGEN'  (W inicial)", () => {
    expect(normalizeBrand("Wolksvagen")).toBe("VOLKSWAGEN");
  });

  it("'VW' → 'VOLKSWAGEN'  (abreviação mapeada)", () => {
    expect(normalizeBrand("VW")).toBe("VOLKSWAGEN");
  });

  it("'Volkswagen' correto → 'VOLKSWAGEN'  (sem alteração)", () => {
    expect(normalizeBrand("Volkswagen")).toBe("VOLKSWAGEN");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Chevrolet", () => {
  it("'Chevrolett' → 'CHEVROLET'  (extra T)", () => {
    expect(normalizeBrand("Chevrolett")).toBe("CHEVROLET");
  });

  it("'Chevrolt' → 'CHEVROLET'  (falta E)", () => {
    expect(normalizeBrand("Chevrolt")).toBe("CHEVROLET");
  });

  it("'Chevy' → 'CHEVROLET'  (apelido mapeado)", () => {
    expect(normalizeBrand("Chevy")).toBe("CHEVROLET");
  });

  it("'GM' → 'CHEVROLET'  (abreviação mapeada)", () => {
    expect(normalizeBrand("GM")).toBe("CHEVROLET");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Mercedes-Benz", () => {
  it("'Mercedes Benz' → 'MERCEDES-BENZ'  (espaço→hífen)", () => {
    expect(normalizeBrand("Mercedes Benz")).toBe("MERCEDES-BENZ");
  });

  it("'Mercedez' → 'MERCEDES-BENZ'  (Z→S)", () => {
    expect(normalizeBrand("Mercedez")).toBe("MERCEDES-BENZ");
  });

  it("'Mercedez-Benz' → 'MERCEDES-BENZ'  (Z→S)", () => {
    expect(normalizeBrand("Mercedez-Benz")).toBe("MERCEDES-BENZ");
  });

  it("'Mercedes' → 'MERCEDES-BENZ'  (sem sufixo Benz)", () => {
    expect(normalizeBrand("Mercedes")).toBe("MERCEDES-BENZ");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Toyota", () => {
  it("'Toyata' → 'TOYOTA'  (falta O)", () => {
    expect(normalizeBrand("Toyata")).toBe("TOYOTA");
  });

  it("'Toyoyta' → 'TOYOTA'  (extra Y)", () => {
    expect(normalizeBrand("Toyoyta")).toBe("TOYOTA");
  });

  it("'Toyotta' → 'TOYOTA'  (extra T)", () => {
    expect(normalizeBrand("Toyotta")).toBe("TOYOTA");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Ford / Fiat / Honda", () => {
  it("'Forde' → 'FORD'  (extra E)", () => {
    expect(normalizeBrand("Forde")).toBe("FORD");
  });

  it("'Fiatt' → 'FIAT'  (extra T)", () => {
    expect(normalizeBrand("Fiatt")).toBe("FIAT");
  });

  it("'Fiat Mobi' → 'FIAT'  (modelo junto à marca)", () => {
    expect(normalizeBrand("Fiat Mobi")).toBe("FIAT");
  });

  it("'Hondda' → 'HONDA'  (extra D)", () => {
    expect(normalizeBrand("Hondda")).toBe("HONDA");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Hyundai / Renault / Nissan", () => {
  it("'Hundai' → 'HYUNDAI'  (falta HY)", () => {
    expect(normalizeBrand("Hundai")).toBe("HYUNDAI");
  });

  it("'Hundayi' → 'HYUNDAI'  (Y deslocado)", () => {
    expect(normalizeBrand("Hundayi")).toBe("HYUNDAI");
  });

  it("'Hyunday' → 'HYUNDAI'  (letras trocadas)", () => {
    expect(normalizeBrand("Hyunday")).toBe("HYUNDAI");
  });

  it("'Renauld' → 'RENAULT'  (LD→LT)", () => {
    expect(normalizeBrand("Renauld")).toBe("RENAULT");
  });

  it("'Renald' → 'RENAULT'  (falta U)", () => {
    expect(normalizeBrand("Renald")).toBe("RENAULT");
  });

  it("'Nisan' → 'NISSAN'  (falta S)", () => {
    expect(normalizeBrand("Nisan")).toBe("NISSAN");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — Mitsubishi / Peugeot / Citroën", () => {
  it("'Mitsubichi' → 'MITSUBISHI'  (CH→SH)", () => {
    expect(normalizeBrand("Mitsubichi")).toBe("MITSUBISHI");
  });

  it("'Mitusbishi' → 'MITSUBISHI'  (letras transpostas)", () => {
    expect(normalizeBrand("Mitusbishi")).toBe("MITSUBISHI");
  });

  it("'Mitsubish' → 'MITSUBISHI'  (falta I final)", () => {
    expect(normalizeBrand("Mitsubish")).toBe("MITSUBISHI");
  });

  it("'Peugeout' → 'PEUGEOT'  (extra U)", () => {
    expect(normalizeBrand("Peugeout")).toBe("PEUGEOT");
  });

  it("'Peugot' → 'PEUGEOT'  (falta E)", () => {
    expect(normalizeBrand("Peugot")).toBe("PEUGEOT");
  });

  it("'Citroen' → 'CITROËN'  (sem trema)", () => {
    expect(normalizeBrand("Citroen")).toBe("CITROËN");
  });

  it("'Citroem' → 'CITROËN'  (M→N e sem trema)", () => {
    expect(normalizeBrand("Citroem")).toBe("CITROËN");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — remoção de sufixo numérico", () => {
  it("'Volkswagen 1' → 'VOLKSWAGEN'", () => {
    expect(normalizeBrand("Volkswagen 1")).toBe("VOLKSWAGEN");
  });

  it("'Toyota 2' → 'TOYOTA'", () => {
    expect(normalizeBrand("Toyota 2")).toBe("TOYOTA");
  });

  it("'Ford 99' → 'FORD'", () => {
    expect(normalizeBrand("Ford 99")).toBe("FORD");
  });

  it("typo + sufixo numérico: 'Volkswagem 3' → 'VOLKSWAGEN'", () => {
    expect(normalizeBrand("Volkswagem 3")).toBe("VOLKSWAGEN");
  });

  it("abreviação + sufixo numérico: 'VW 1' → 'VOLKSWAGEN'", () => {
    expect(normalizeBrand("VW 1")).toBe("VOLKSWAGEN");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — trim e uppercase", () => {
  it("espaços são removidos antes da comparação", () => {
    expect(normalizeBrand("  Toyota  ")).toBe("TOYOTA");
  });

  it("lowercase é aceito e normalizado", () => {
    expect(normalizeBrand("toyota")).toBe("TOYOTA");
  });

  it("mixed case é normalizado", () => {
    expect(normalizeBrand("ToYoTa")).toBe("TOYOTA");
  });

  it("abreviação lowercase 'vw' → 'VOLKSWAGEN'", () => {
    expect(normalizeBrand("vw")).toBe("VOLKSWAGEN");
  });

  it("abreviação lowercase 'gm' → 'CHEVROLET'", () => {
    expect(normalizeBrand("gm")).toBe("CHEVROLET");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeBrand — fallback (marca sem mapeamento)", () => {
  it("string vazia retorna string vazia", () => {
    expect(normalizeBrand("")).toBe("");
  });

  it("marca desconhecida sem typo é retornada em uppercase", () => {
    expect(normalizeBrand("  Scania  ")).toBe("SCANIA");
  });

  it("marca desconhecida é retornada em uppercase", () => {
    expect(normalizeBrand("Volvo")).toBe("VOLVO");
  });

  it("typo sem mapeamento retorna o valor limpo em uppercase", () => {
    expect(normalizeBrand("XYZ")).toBe("XYZ");
  });
});
