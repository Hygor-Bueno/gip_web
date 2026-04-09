/**
 * Testa a lógica de filtragem client-side do FilterPanel.
 * Cobre todos os filtros: status, data, valor, endereço, unidade, marca, CNPJ e placa.
 */
export {};

import { ActiveFilters, defaultFilters } from "../Active/Component/FilterPanel/FilterPanel";
import { maskCnpj, validateCnpj } from "../Active/Component/FilterPanel/CnpjFilterInput";
import { Active } from "../Active/Interfaces/Interfaces";

// ─── Helper: aplica filtros sobre a lista (espelha o useMemo de ActiveTable) ──

function applyFilters(data: Partial<Active>[], filters: ActiveFilters, plateIds: Set<string> = new Set()): Partial<Active>[] {
  let result = data;

  if (plateIds.size > 0)
    result = result.filter(a => plateIds.has(String(a.active_id)));

  if (filters.status !== "")
    result = result.filter(a => String(a.status_active) === filters.status);

  if (filters.dateFrom)
    result = result.filter(a => (a.date_purchase ?? "") >= filters.dateFrom);

  if (filters.dateTo)
    result = result.filter(a => (a.date_purchase ?? "") <= filters.dateTo);

  if (filters.valueMin)
    result = result.filter(a => Number(a.value_purchase) >= Number(filters.valueMin));

  if (filters.valueMax)
    result = result.filter(a => Number(a.value_purchase) <= Number(filters.valueMax));

  if (filters.address) {
    const q = filters.address.toLowerCase();
    result = result.filter(a => String(a.address || "").toLowerCase().includes(q));
  }

  if (filters.unitName)
    result = result.filter(a => (a.unit_name ?? "").trim().toUpperCase() === filters.unitName);

  if (filters.brand)
    result = result.filter(a => (a.brand ?? "").split("-")[0].trim().toUpperCase() === filters.brand);

  if (filters.cnpj) {
    const q = filters.cnpj.replace(/\D/g, "");
    result = result.filter(a => String(a.cnpj || "").replace(/\D/g, "").includes(q));
  }

  return result;
}

// ─── Dataset de teste ──────────────────────────────────────────────────────

const dataset: Partial<Active>[] = [
  { active_id: "1", brand: "Toyota-TCPP01",     model: "Corolla",  status_active: "1", date_purchase: "2023-01-15", value_purchase: "90000", unit_name: "Filial SP",  cnpj: "11.111.111/0001-11", address: '{"city":"São Paulo"}' },
  { active_id: "2", brand: "Honda-TCPP02",      model: "Civic",    status_active: "0", date_purchase: "2022-06-10", value_purchase: "75000", unit_name: "Filial RJ",  cnpj: "22.222.222/0001-22", address: '{"city":"Rio de Janeiro"}' },
  { active_id: "3", brand: "Ford-TCPP03",       model: "Ranger",   status_active: "1", date_purchase: "2024-03-01", value_purchase: "130000",unit_name: "Filial SP",  cnpj: "11.111.111/0001-11", address: '{"city":"São Paulo"}' },
  { active_id: "4", brand: "Volkswagen-TCPP04", model: "Amarok",   status_active: "1", date_purchase: "2021-11-20", value_purchase: "180000",unit_name: "Matriz",     cnpj: "33.333.333/0001-33", address: '{"city":"Campinas"}' },
  { active_id: "5", brand: "Toyota-TCPP05",     model: "Hilux",    status_active: "0", date_purchase: "2023-08-05", value_purchase: "210000",unit_name: "Filial MG",  cnpj: "44.444.444/0001-44", address: '{"city":"Belo Horizonte"}' },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — defaultFilters retorna todos os registros", () => {
  it("sem filtros, todos os 5 registros são retornados", () => {
    expect(applyFilters(dataset, defaultFilters)).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro de status", () => {
  it("status '1' retorna apenas ativos (3 registros)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, status: "1" });
    expect(result).toHaveLength(3);
    expect(result.every(a => a.status_active === "1")).toBe(true);
  });

  it("status '0' retorna apenas inativos (2 registros)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, status: "0" });
    expect(result).toHaveLength(2);
    expect(result.every(a => a.status_active === "0")).toBe(true);
  });

  it("status '' retorna todos", () => {
    expect(applyFilters(dataset, { ...defaultFilters, status: "" })).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro de data de compra", () => {
  it("dateFrom '2023-01-01' exclui registros anteriores", () => {
    const result = applyFilters(dataset, { ...defaultFilters, dateFrom: "2023-01-01" });
    expect(result.every(a => (a.date_purchase ?? "") >= "2023-01-01")).toBe(true);
  });

  it("dateTo '2023-12-31' exclui registros posteriores", () => {
    const result = applyFilters(dataset, { ...defaultFilters, dateTo: "2023-12-31" });
    expect(result.every(a => (a.date_purchase ?? "") <= "2023-12-31")).toBe(true);
  });

  it("intervalo 2023-01-01 a 2023-12-31 retorna apenas compras de 2023", () => {
    const result = applyFilters(dataset, { ...defaultFilters, dateFrom: "2023-01-01", dateTo: "2023-12-31" });
    expect(result).toHaveLength(2); // active_id 1 e 5
  });

  it("intervalo sem resultados retorna lista vazia", () => {
    const result = applyFilters(dataset, { ...defaultFilters, dateFrom: "2025-01-01", dateTo: "2025-12-31" });
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro de valor de compra", () => {
  it("valueMin 100000 filtra corretamente", () => {
    const result = applyFilters(dataset, { ...defaultFilters, valueMin: "100000" });
    expect(result.every(a => Number(a.value_purchase) >= 100000)).toBe(true);
    expect(result).toHaveLength(3); // 130000, 180000, 210000
  });

  it("valueMax 90000 filtra corretamente", () => {
    const result = applyFilters(dataset, { ...defaultFilters, valueMax: "90000" });
    expect(result.every(a => Number(a.value_purchase) <= 90000)).toBe(true);
    expect(result).toHaveLength(2); // 90000, 75000
  });

  it("faixa 80000 a 150000 retorna itens corretos", () => {
    const result = applyFilters(dataset, { ...defaultFilters, valueMin: "80000", valueMax: "150000" });
    expect(result).toHaveLength(2); // 90000, 130000
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro de endereço", () => {
  it("busca 'são paulo' case-insensitive", () => {
    const result = applyFilters(dataset, { ...defaultFilters, address: "são paulo" });
    expect(result).toHaveLength(2);
  });

  it("busca 'campinas' retorna apenas Matriz", () => {
    const result = applyFilters(dataset, { ...defaultFilters, address: "campinas" });
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("4");
  });

  it("endereço inexistente retorna lista vazia", () => {
    expect(applyFilters(dataset, { ...defaultFilters, address: "manaus" })).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro por nome de unidade (select — uppercase exact match)", () => {
  it("'FILIAL SP' retorna 2 registros", () => {
    const result = applyFilters(dataset, { ...defaultFilters, unitName: "FILIAL SP" });
    expect(result).toHaveLength(2);
  });

  it("'MATRIZ' retorna 1 registro", () => {
    const result = applyFilters(dataset, { ...defaultFilters, unitName: "MATRIZ" });
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("4");
  });

  it("valor '' (Todas) retorna todos os registros", () => {
    const result = applyFilters(dataset, { ...defaultFilters, unitName: "" });
    expect(result).toHaveLength(5);
  });

  it("unidade inexistente retorna lista vazia", () => {
    const result = applyFilters(dataset, { ...defaultFilters, unitName: "FILIAL GO" });
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro por marca (select — uppercase prefix match)", () => {
  it("'TOYOTA' corresponde a Toyota-TCPP01 e Toyota-TCPP05 (2 registros)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, brand: "TOYOTA" });
    expect(result).toHaveLength(2);
    expect(result.every(a => (a.brand ?? "").toUpperCase().startsWith("TOYOTA"))).toBe(true);
  });

  it("'FORD' retorna apenas Ford-TCPP03 (Ranger)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, brand: "FORD" });
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Ranger");
  });

  it("'VOLKSWAGEN' retorna Volkswagen-TCPP04 (Amarok)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, brand: "VOLKSWAGEN" });
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Amarok");
  });

  it("marca inexistente retorna lista vazia", () => {
    expect(applyFilters(dataset, { ...defaultFilters, brand: "BMW" })).toHaveLength(0);
  });

  it("valor '' (Todas) retorna todos os registros", () => {
    expect(applyFilters(dataset, { ...defaultFilters, brand: "" })).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro por CNPJ", () => {
  it("CNPJ '11111111000111' (sem máscara) retorna 2 registros", () => {
    const result = applyFilters(dataset, { ...defaultFilters, cnpj: "11.111.111/0001-11" });
    expect(result).toHaveLength(2); // active_id 1 e 3
  });

  it("CNPJ parcial '3333' filtra corretamente", () => {
    const result = applyFilters(dataset, { ...defaultFilters, cnpj: "3333" });
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("4");
  });

  it("CNPJ inexistente retorna lista vazia", () => {
    expect(applyFilters(dataset, { ...defaultFilters, cnpj: "99999999999999" })).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro por placa (plateIds)", () => {
  it("plateIds com active_id '1' retorna apenas active_id 1", () => {
    const result = applyFilters(dataset, defaultFilters, new Set(["1"]));
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("1");
  });

  it("plateIds vazio não filtra por placa", () => {
    expect(applyFilters(dataset, defaultFilters, new Set())).toHaveLength(5);
  });

  it("plateIds com múltiplos ids retorna todos correspondentes", () => {
    const result = applyFilters(dataset, defaultFilters, new Set(["1", "3"]));
    expect(result).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtros combinados", () => {
  it("status '1' + brand 'TOYOTA' retorna apenas Toyota-TCPP01 (Corolla, ativo)", () => {
    const result = applyFilters(dataset, { ...defaultFilters, status: "1", brand: "TOYOTA" });
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("1");
    expect(result[0].brand).toBe("Toyota-TCPP01");
  });

  it("status '0' + unitName 'FILIAL RJ' retorna Honda inativo", () => {
    const result = applyFilters(dataset, { ...defaultFilters, status: "0", unitName: "FILIAL RJ" });
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Civic");
  });

  it("valueMin + dateFrom combinados filtram corretamente", () => {
    const result = applyFilters(dataset, { ...defaultFilters, valueMin: "100000", dateFrom: "2024-01-01" });
    expect(result).toHaveLength(1); // Ford Ranger 2024
    expect(result[0].active_id).toBe("3");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CNPJ — maskCnpj
// ─────────────────────────────────────────────────────────────────────────────
describe("maskCnpj — formatação progressiva", () => {
  it("2 dígitos: sem separador", () => {
    expect(maskCnpj("11")).toBe("11");
  });

  it("5 dígitos: ponto após 2°", () => {
    expect(maskCnpj("11111")).toBe("11.111");
  });

  it("8 dígitos: dois pontos", () => {
    expect(maskCnpj("11111111")).toBe("11.111.111");
  });

  it("12 dígitos: dois pontos + barra", () => {
    expect(maskCnpj("111111110001")).toBe("11.111.111/0001");
  });

  it("14 dígitos: máscara completa", () => {
    expect(maskCnpj("11111111000111")).toBe("11.111.111/0001-11");
  });

  it("ignora caracteres não numéricos na entrada", () => {
    expect(maskCnpj("11.111.111/0001-11")).toBe("11.111.111/0001-11");
  });

  it("trunca em 14 dígitos", () => {
    expect(maskCnpj("111111110001119999")).toBe("11.111.111/0001-11");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CNPJ — validateCnpj
// ─────────────────────────────────────────────────────────────────────────────
describe("validateCnpj — checksum", () => {
  it("CNPJ válido — 11.222.333/0001-81", () => {
    expect(validateCnpj("11222333000181")).toBe(true);
  });

  it("CNPJ válido com máscara", () => {
    expect(validateCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("CNPJ inválido — dígito verificador errado", () => {
    expect(validateCnpj("11.222.333/0001-82")).toBe(false);
  });

  it("CNPJ inválido — todos os dígitos iguais (00000000000000)", () => {
    expect(validateCnpj("00000000000000")).toBe(false);
  });

  it("CNPJ inválido — menos de 14 dígitos", () => {
    expect(validateCnpj("1122233300018")).toBe(false);
  });

  it("CNPJ inválido — string vazia", () => {
    expect(validateCnpj("")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CNPJ — filtro por dígitos (includes)
// ─────────────────────────────────────────────────────────────────────────────
describe("FilterPanel — filtro por CNPJ (digits includes)", () => {
  it("CNPJ completo com máscara retorna 2 registros", () => {
    const result = applyFilters(dataset, { ...defaultFilters, cnpj: "11111111000111" });
    expect(result).toHaveLength(2);
  });

  it("dígitos parciais '3333' filtram corretamente", () => {
    const result = applyFilters(dataset, { ...defaultFilters, cnpj: "33333333000133".slice(0, 8) });
    expect(result).toHaveLength(1);
    expect(result[0].active_id).toBe("4");
  });

  it("CNPJ inexistente retorna lista vazia", () => {
    expect(applyFilters(dataset, { ...defaultFilters, cnpj: "99999999999999" })).toHaveLength(0);
  });

  it("cnpj '' retorna todos os registros", () => {
    expect(applyFilters(dataset, { ...defaultFilters, cnpj: "" })).toHaveLength(5);
  });
});
