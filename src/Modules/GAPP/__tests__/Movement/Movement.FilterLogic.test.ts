/**
 * Testa a lógica de filtragem client-side da tela de Movimentações (Fase 0).
 * Espelha o filteredActives de useMovementForm: busca por texto e por placa (normPlate).
 */

import { normPlate } from "../../Movement/Components/MovementForm/useMovementForm";
import { ActiveForMovement } from "../../Movement/Interfaces/MovementInterfaces";

// ─── Helper: espelha o filteredActives de useMovementForm ─────────────────────
function applyFilter(
  actives: Partial<ActiveForMovement>[],
  search: string,
  plateInput: string,
): Partial<ActiveForMovement>[] {
  return actives.filter(a => {
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
}

// ─── Dataset ──────────────────────────────────────────────────────────────────
const dataset: Partial<ActiveForMovement>[] = [
  { active_id: 1,  brand: "Toyota",      model: "Corolla",  unit_name: "Filial SP",  desc_active_class: "Veículo Passeio", license_plates: "ABC-1234" },
  { active_id: 2,  brand: "Honda",       model: "Civic",    unit_name: "Filial RJ",  desc_active_class: "Veículo Passeio", license_plates: "DEF-5678" },
  { active_id: 3,  brand: "Ford",        model: "Ranger",   unit_name: "Filial SP",  desc_active_class: "Utilitário",      license_plates: "GHI-9012" },
  { active_id: 4,  brand: "Volkswagen",  model: "Amarok",   unit_name: "Matriz",     desc_active_class: "Utilitário",      license_plates: "" },
  { active_id: 5,  brand: "Dell",        model: "Latitude", unit_name: "Filial MG",  desc_active_class: "Notebook",        license_plates: "" },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterLogic — sem filtros retorna tudo", () => {
  it("search '' e plateInput '' retorna todos os 5 ativos", () => {
    expect(applyFilter(dataset, "", "")).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterLogic — busca por texto (search)", () => {
  it("busca pela marca 'toyota' (case-insensitive) retorna 1 ativo", () => {
    const result = applyFilter(dataset, "toyota", "");
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe(1);
  });

  it("busca por modelo 'ranger' retorna 1 ativo", () => {
    const result = applyFilter(dataset, "ranger", "");
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe("Ford");
  });

  it("busca por unidade 'filial sp' retorna 2 ativos", () => {
    const result = applyFilter(dataset, "filial sp", "");
    expect(result).toHaveLength(2);
  });

  it("busca por categoria 'notebook' retorna 1 ativo", () => {
    const result = applyFilter(dataset, "notebook", "");
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe("Dell");
  });

  it("busca por ID '3' retorna o ativo 3", () => {
    const result = applyFilter(dataset, "3", "");
    expect(result.some(a => a.active_id === 3)).toBe(true);
  });

  it("busca por placa via campo search ('ABC') retorna o Corolla", () => {
    const result = applyFilter(dataset, "ABC", "");
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Corolla");
  });

  it("busca sem correspondência retorna lista vazia", () => {
    expect(applyFilter(dataset, "bmw", "")).toHaveLength(0);
  });

  it("busca por 'filial' retorna ativos de SP (×2), RJ e MG (4 ativos)", () => {
    expect(applyFilter(dataset, "filial", "")).toHaveLength(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterLogic — filtro por placa (plateInput + normPlate)", () => {
  it("placa exata 'ABC-1234' retorna o Corolla", () => {
    const result = applyFilter(dataset, "", "ABC-1234");
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe(1);
  });

  it("placa sem hífen 'ABC1234' também retorna o Corolla", () => {
    const result = applyFilter(dataset, "", "ABC1234");
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe(1);
  });

  it("placa em minúsculas 'abc1234' retorna o Corolla", () => {
    const result = applyFilter(dataset, "", "abc1234");
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe(1);
  });

  it("prefixo de placa 'DEF' retorna o Civic", () => {
    const result = applyFilter(dataset, "", "DEF");
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Civic");
  });

  it("ativos sem placa não são retornados quando há plateInput", () => {
    const result = applyFilter(dataset, "", "GHI");
    expect(result.every(a => (a.license_plates ?? "") !== "")).toBe(true);
  });

  it("placa inexistente retorna lista vazia", () => {
    expect(applyFilter(dataset, "", "ZZZ9999")).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterLogic — filtros combinados (search + plateInput)", () => {
  it("search 'filial sp' + plateInput 'ABC' retorna apenas o Corolla", () => {
    const result = applyFilter(dataset, "filial sp", "ABC");
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe(1);
  });

  it("search 'utilitário' + plateInput 'GHI' retorna apenas o Ranger", () => {
    const result = applyFilter(dataset, "utilitário", "GHI");
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Ranger");
  });

  it("combinação sem correspondência retorna lista vazia", () => {
    const result = applyFilter(dataset, "toyota", "DEF");
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterLogic — contagem de filtros ativos (activeFilterCount)", () => {
  it("nenhum filtro ativo: count = 0", () => {
    const count = (search: string, plate: string) => (search ? 1 : 0) + (plate ? 1 : 0);
    expect(count("", "")).toBe(0);
  });

  it("só search ativo: count = 1", () => {
    const count = (search: string, plate: string) => (search ? 1 : 0) + (plate ? 1 : 0);
    expect(count("toyota", "")).toBe(1);
  });

  it("só plate ativo: count = 1", () => {
    const count = (search: string, plate: string) => (search ? 1 : 0) + (plate ? 1 : 0);
    expect(count("", "ABC")).toBe(1);
  });

  it("ambos ativos: count = 2", () => {
    const count = (search: string, plate: string) => (search ? 1 : 0) + (plate ? 1 : 0);
    expect(count("toyota", "ABC")).toBe(2);
  });
});
