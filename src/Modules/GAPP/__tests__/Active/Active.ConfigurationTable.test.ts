import { customValueActive, listColumnsOcult, customTagsActive } from "../../Active/ConfigurationTable/ConfigurationTable";

// ─────────────────────────────────────────────────────────────────────────────
// customValueActive — formatadores de célula da tabela
// ─────────────────────────────────────────────────────────────────────────────
describe("customValueActive.status_active", () => {

  it("deve retornar 'Ativo' quando valor é '1'", () => {
    expect(customValueActive.status_active("1")).toBe("Ativo");
  });

  it("deve retornar 'Inativo' quando valor é '0'", () => {
    expect(customValueActive.status_active("0")).toBe("Inativo");
  });

  it("deve retornar 'Inativo' para valores inesperados", () => {
    expect(customValueActive.status_active(null)).toBe("Inativo");
    expect(customValueActive.status_active(undefined)).toBe("Inativo");
    expect(customValueActive.status_active("")).toBe("Inativo");
  });
});

describe("customValueActive.value_purchase", () => {

  it("deve formatar número como moeda BRL", () => {
    const result = customValueActive.value_purchase(90000);
    expect(result).toMatch(/90\.000/);
    expect(result).toMatch(/R\$/);
  });

  it("deve formatar string numérica como moeda BRL", () => {
    const result = customValueActive.value_purchase("1500.50");
    expect(result).toMatch(/1\.500/);
  });

  it("deve retornar string vazia para NaN", () => {
    expect(customValueActive.value_purchase("abc")).toBe("");
  });

  it("deve retornar string vazia para null", () => {
    expect(customValueActive.value_purchase(null)).toBe("");
  });
});

describe("customValueActive.address", () => {

  it("deve montar string 'cidade, logradouro, cep' a partir do JSON da linha", () => {
    const row = {
      address: JSON.stringify({
        city:        "São Paulo",
        public_place: "Av. Paulista",
        zip_code:    "01310-100",
      }),
    };
    const result = customValueActive.address(null, row);
    expect(result).toBe("São Paulo, Av. Paulista, 01310-100");
  });

  it("deve retornar string vazia quando address é null", () => {
    expect(customValueActive.address(null, { address: null })).toBe("");
  });

  it("deve retornar string vazia quando row é undefined", () => {
    expect(customValueActive.address(null, undefined)).toBe("");
  });

  it("deve retornar string vazia quando JSON inválido", () => {
    expect(customValueActive.address(null, { address: "not-json" })).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listColumnsOcult — colunas escondidas da tabela
// ─────────────────────────────────────────────────────────────────────────────
describe("listColumnsOcult", () => {

  it("deve ocultar campos sensíveis de infraestrutura", () => {
    const sensitiveCols = ["user_id_fk", "work_group_fk", "id_active_class_fk"];
    sensitiveCols.forEach((col) => {
      expect(listColumnsOcult).toContain(col);
    });
  });

  it("deve ocultar campos de layout interno", () => {
    expect(listColumnsOcult).toContain("list_items");
    expect(listColumnsOcult).toContain("place_purchase");
    expect(listColumnsOcult).toContain("photo");
  });

  it("não deve ocultar colunas visíveis na tabela", () => {
    const visibleCols = ["brand", "model", "active_id", "date_purchase", "value_purchase"];
    visibleCols.forEach((col) => {
      expect(listColumnsOcult).not.toContain(col);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// customTagsActive — renomeação de colunas
// ─────────────────────────────────────────────────────────────────────────────
describe("customTagsActive", () => {

  it("deve renomear active_id para 'Cód'", () => {
    expect(customTagsActive.active_id).toBe("Cód");
  });

  it("deve renomear brand para 'Marca'", () => {
    expect(customTagsActive.brand).toBe("Marca");
  });

  it("deve renomear status_active para 'Status do Ativo'", () => {
    expect(customTagsActive.status_active).toBe("Status do Ativo");
  });
});
