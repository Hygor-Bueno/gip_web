/**
 * Testa a função normPlate exportada de useMovementForm.
 * normPlate normaliza strings de placa removendo hífens/espaços e convertendo para maiúsculas.
 */

import { normPlate } from "../../Movement/Components/MovementForm/useMovementForm";

// ─────────────────────────────────────────────────────────────────────────────
describe("normPlate — remoção de caracteres especiais", () => {
  it("remove hífen do padrão antigo (ABC-1234)", () => {
    expect(normPlate("ABC-1234")).toBe("ABC1234");
  });

  it("remove hífen do padrão Mercosul (ABC-1D23)", () => {
    expect(normPlate("ABC-1D23")).toBe("ABC1D23");
  });

  it("remove espaços internos", () => {
    expect(normPlate("ABC 1234")).toBe("ABC1234");
  });

  it("remove hífen e espaço combinados", () => {
    expect(normPlate("AB C-12 34")).toBe("ABC1234");
  });

  it("não altera placa já normalizada (sem separadores)", () => {
    expect(normPlate("ABC1234")).toBe("ABC1234");
  });

  it("string vazia retorna string vazia", () => {
    expect(normPlate("")).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normPlate — conversão para maiúsculas", () => {
  it("converte letras minúsculas para maiúsculas", () => {
    expect(normPlate("abc1234")).toBe("ABC1234");
  });

  it("converte placa mista para maiúsculas", () => {
    expect(normPlate("aBc-1d23")).toBe("ABC1D23");
  });

  it("mantém dígitos numéricos intactos", () => {
    expect(normPlate("123456")).toBe("123456");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normPlate — comparação de placas (uso principal no filtro)", () => {
  it("placa com hífen e sem hífen são equivalentes após normalização", () => {
    expect(normPlate("ABC-1234")).toBe(normPlate("ABC1234"));
  });

  it("placa em minúsculas e maiúsculas são equivalentes após normalização", () => {
    expect(normPlate("abc1234")).toBe(normPlate("ABC1234"));
  });

  it("placa com espaço e sem espaço são equivalentes após normalização", () => {
    expect(normPlate("ABC 1234")).toBe(normPlate("ABC1234"));
  });

  it("buscas parciais funcionam após normalização (includes)", () => {
    const plate = normPlate("ABC-1234");
    expect(plate.includes(normPlate("ABC"))).toBe(true);
    expect(plate.includes(normPlate("1234"))).toBe(true);
    expect(plate.includes(normPlate("xyz"))).toBe(false);
  });

  it("duas placas diferentes não são equivalentes", () => {
    expect(normPlate("ABC-1234")).not.toBe(normPlate("XYZ-9999"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("normPlate — casos extremos", () => {
  it("placa somente com espaços retorna string vazia", () => {
    expect(normPlate("   ")).toBe("");
  });

  it("placa somente com hífens retorna string vazia", () => {
    expect(normPlate("---")).toBe("");
  });

  it("placa com múltiplos hífens e espaços é normalizada", () => {
    expect(normPlate("A - B - C")).toBe("ABC");
  });
});
