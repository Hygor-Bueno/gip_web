/**
 * Testa a montagem completa dos payloads de POST para cada módulo de despesas:
 * - Abastecimento (Fuel)
 * - Manutenção (Maintenance)
 * - Multas (Fines)
 * - Sinistro (Sinister)
 * - Seguro (Insurance)
 *
 * Valida que cada payload contém os campos obrigatórios, os valores corretos
 * e nenhum campo nulo/undefined desnecessário — conforme comportamento esperado
 * pela API GAPP referenciada no projeto legado.
 */
export {};

import { Expense, FuelData, MaintenanceData, FinesData, SinisterData, PartItem } from "../Active/Component/Releases/Interfaces";
import { Insurance } from "../Active/Interfaces/Interfaces";
import { defaultExpense, defaultFuel, defaultMaintenance, defaultFines, defaultSinister, defaultInsurance } from "../Active/Component/Releases/defaultValues";

// ─── helpers que espelham a lógica de Releases.tsx ───────────────────────────

function buildFuelPayload(expense: Expense, fuel: FuelData) {
  return { ...expense, exp_type_id_fk: 1, ...fuel, gappProcedure: 1 };
}

function buildMaintenancePayload(maintenance: MaintenanceData, expenId: string) {
  return { ...maintenance, expen_id_fk: expenId };
}

function buildFinesPayload(fines: FinesData, expenId: string, driverId: string) {
  return { ...fines, expen_id_fk: expenId, offending_driver: driverId };
}

function buildSinisterPayload(sinister: SinisterData, expenId: string, driverId: string, insFk: string) {
  return { ...sinister, expen_id_fk: expenId, offending_driver: driverId, id_insurance_fk: insFk };
}

function buildInsurancePostPayload(insurance: Partial<Insurance>, vehicleId: string) {
  return { ...insurance, vehicle_id_fk: vehicleId };
}

function buildInsuranceExpensePayload(expense: Expense, insuranceValue: string) {
  return {
    ...expense,
    exp_type_id_fk: "5",
    total_value: insuranceValue,
    description: "Adição/Renovação do seguro",
  };
}

function addPart(prev: MaintenanceData, part: PartItem): MaintenanceData {
  const updated = [...(prev.list_parts?.list || []), part];
  return {
    ...prev,
    list_parts: { list: updated },
    value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUEL — ABASTECIMENTO
// ─────────────────────────────────────────────────────────────────────────────
describe("POST Fuel — payload de abastecimento", () => {
  const expense: Expense = {
    ...defaultExpense("10", "3"),
    date: "2024-07-01", hour: "08:00", local: "Posto Shell",
    total_value: "320.50", driver_id_fk: "5",
  };

  const fuel: FuelData = {
    ...defaultFuel,
    fuel_type_id_fk: "2",
    liter_qtd: "54",
    liter_value: "5.93",
    km_day: "48500",
  };

  const payload = buildFuelPayload(expense, fuel);

  it("deve conter exp_type_id_fk = 1 (abastecimento)", () => {
    expect(payload.exp_type_id_fk).toBe(1);
  });

  it("deve conter gappProcedure = 1", () => {
    expect(payload.gappProcedure).toBe(1);
  });

  it("deve conter active_id_fk correto", () => {
    expect(payload.active_id_fk).toBe("10");
  });

  it("deve conter user_id_fk correto", () => {
    expect(payload.user_id_fk).toBe("3");
  });

  it("deve conter fuel_type_id_fk", () => {
    expect(payload.fuel_type_id_fk).toBe("2");
  });

  it("deve conter liter_qtd", () => {
    expect(payload.liter_qtd).toBe("54");
  });

  it("deve conter liter_value", () => {
    expect(payload.liter_value).toBe("5.93");
  });

  it("deve conter km_day", () => {
    expect(payload.km_day).toBe("48500");
  });

  it("deve conter total_value da despesa", () => {
    expect(payload.total_value).toBe("320.50");
  });

  it("não deve conter campos undefined como valor", () => {
    const values = Object.values(payload);
    expect(values.some(v => v === undefined)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE — MANUTENÇÃO
// ─────────────────────────────────────────────────────────────────────────────
describe("POST Maintenance — payload de manutenção", () => {
  let maintenance = { ...defaultMaintenance, technician: "Mecânica Central", service_value: "850.00", km_day: "52000", warranty: 6 };
  maintenance = addPart(maintenance, { description: "Filtro de óleo",  quantity: "1", value: "45.00" });
  maintenance = addPart(maintenance, { description: "Pastilha de freio", quantity: "4", value: "28.50" });

  const payload = buildMaintenancePayload(maintenance, "123");

  it("deve conter expen_id_fk = '123'", () => {
    expect(payload.expen_id_fk).toBe("123");
  });

  it("deve conter technician", () => {
    expect(payload.technician).toBe("Mecânica Central");
  });

  it("deve conter service_value", () => {
    expect(payload.service_value).toBe("850.00");
  });

  it("deve conter km_day", () => {
    expect(payload.km_day).toBe("52000");
  });

  it("deve conter warranty = 6", () => {
    expect(payload.warranty).toBe(6);
  });

  it("deve conter list_parts com 2 peças", () => {
    expect(payload.list_parts.list).toHaveLength(2);
  });

  it("deve conter value_parts calculado corretamente (45 + 4*28.50 = 159)", () => {
    expect(Number(payload.value_parts)).toBeCloseTo(159, 1);
  });

  it("deve conter descrição correta das peças", () => {
    expect(payload.list_parts.list[0].description).toBe("Filtro de óleo");
    expect(payload.list_parts.list[1].description).toBe("Pastilha de freio");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FINES — MULTAS
// ─────────────────────────────────────────────────────────────────────────────
describe("POST Fines — payload de multas", () => {
  const fines: FinesData = {
    ...defaultFines,
    points: "5",
    infraction: "Excesso de velocidade",
    article_ctb: "Art. 218, I",
    ait: "AA12345678",
    gravity: "grave",
    offending_driver_date: "2024-06-15",
  };

  const payload = buildFinesPayload(fines, "456", "9");

  it("deve conter expen_id_fk = '456'", () => {
    expect(payload.expen_id_fk).toBe("456");
  });

  it("deve conter offending_driver = '9' (motorista da despesa)", () => {
    expect(payload.offending_driver).toBe("9");
  });

  it("deve conter points", () => {
    expect(payload.points).toBe("5");
  });

  it("deve conter infraction", () => {
    expect(payload.infraction).toBe("Excesso de velocidade");
  });

  it("deve conter article_ctb", () => {
    expect(payload.article_ctb).toBe("Art. 218, I");
  });

  it("deve conter ait", () => {
    expect(payload.ait).toBe("AA12345678");
  });

  it("deve conter gravity", () => {
    expect(payload.gravity).toBe("grave");
  });

  it("deve conter offending_driver_date", () => {
    expect(payload.offending_driver_date).toBe("2024-06-15");
  });

  it("deve manter infraction_id_fk = '4' (default)", () => {
    expect(payload.infraction_id_fk).toBe("4");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SINISTER — SINISTRO
// ─────────────────────────────────────────────────────────────────────────────
describe("POST Sinister — payload de sinistro", () => {
  const sinister: SinisterData = {
    ...defaultSinister,
    bo_number: "2024/SP/00123",
    guilty: "1",
    bo_receipt_date: "2024-05-10",
    bo_shipping_date: "2024-05-12",
    damage_type_id_fk: "2",
    observation: "Colisão traseira em semáforo",
  };

  const payload = buildSinisterPayload(sinister, "789", "7", "15");

  it("deve conter expen_id_fk = '789'", () => {
    expect(payload.expen_id_fk).toBe("789");
  });

  it("deve conter offending_driver = '7'", () => {
    expect(payload.offending_driver).toBe("7");
  });

  it("deve conter id_insurance_fk = '15'", () => {
    expect(payload.id_insurance_fk).toBe("15");
  });

  it("deve conter bo_number", () => {
    expect(payload.bo_number).toBe("2024/SP/00123");
  });

  it("deve conter guilty = '1'", () => {
    expect(payload.guilty).toBe("1");
  });

  it("deve conter bo_receipt_date", () => {
    expect(payload.bo_receipt_date).toBe("2024-05-10");
  });

  it("deve conter bo_shipping_date", () => {
    expect(payload.bo_shipping_date).toBe("2024-05-12");
  });

  it("deve conter damage_type_id_fk", () => {
    expect(payload.damage_type_id_fk).toBe("2");
  });

  it("deve conter observation", () => {
    expect(payload.observation).toBe("Colisão traseira em semáforo");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INSURANCE — SEGURO
// ─────────────────────────────────────────────────────────────────────────────
describe("POST Insurance — payload de seguro (registro)", () => {
  const insurance: Partial<Insurance> = {
    ...defaultInsurance,
    insurance_value: "3600.00",
    risk_cep: "01310-100",
    ins_id_fk: "2",
    cov_id_fk: "1",
    util_id_fk: "3",
    date_init: "2024-01-01",
    date_final: "2025-01-01",
    property_damage: 100000,
    moral_damages: 50000,
    bodily_damages: 80000,
    glasses: "Sim",
    assist_24hrs: "Sim",
    km_Trailer: "150",
    status_insurance: "1",
    franchise_list: { list: [{ description: "Para-brisa", value: "900" }] },
  };

  const insPayload = buildInsurancePostPayload(insurance, "42");
  const expPayload = buildInsuranceExpensePayload(
    { ...defaultExpense("10", "3"), date: "2024-01-01", hour: "09:00" },
    insurance.insurance_value!
  );

  it("insurance POST — deve conter vehicle_id_fk = '42'", () => {
    expect(insPayload.vehicle_id_fk).toBe("42");
  });

  it("insurance POST — deve conter insurance_value", () => {
    expect(insPayload.insurance_value).toBe("3600.00");
  });

  it("insurance POST — deve conter ins_id_fk (seguradora)", () => {
    expect(insPayload.ins_id_fk).toBe("2");
  });

  it("insurance POST — deve conter cov_id_fk (cobertura)", () => {
    expect(insPayload.cov_id_fk).toBe("1");
  });

  it("insurance POST — deve conter util_id_fk (utilização)", () => {
    expect(insPayload.util_id_fk).toBe("3");
  });

  it("insurance POST — deve conter status_insurance = '1'", () => {
    expect(insPayload.status_insurance).toBe("1");
  });

  it("insurance POST — deve conter franchise_list com 1 item", () => {
    expect(insPayload.franchise_list?.list).toHaveLength(1);
    expect(insPayload.franchise_list?.list[0].description).toBe("Para-brisa");
  });

  it("insurance POST — deve conter datas de vigência", () => {
    expect(insPayload.date_init).toBe("2024-01-01");
    expect(insPayload.date_final).toBe("2025-01-01");
  });

  it("expense POST (seguro) — deve conter exp_type_id_fk = '5'", () => {
    expect(expPayload.exp_type_id_fk).toBe("5");
  });

  it("expense POST (seguro) — deve conter total_value = insurance_value", () => {
    expect(expPayload.total_value).toBe("3600.00");
  });

  it("expense POST (seguro) — deve conter description 'Adição/Renovação do seguro'", () => {
    expect(expPayload.description).toBe("Adição/Renovação do seguro");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INSURANCE — validações de campos obrigatórios antes do submit
// ─────────────────────────────────────────────────────────────────────────────
describe("Insurance — validação de campos obrigatórios", () => {
  function validateInsurance(ins: Partial<Insurance>): string | null {
    if (!ins.insurance_value) return "Informe o valor do seguro.";
    if (!ins.util_id_fk)     return "Selecione a utilização.";
    if (!ins.ins_id_fk)      return "Selecione a seguradora.";
    if (!ins.cov_id_fk)      return "Selecione a cobertura.";
    return null;
  }

  it("deve passar quando todos os campos obrigatórios estão preenchidos", () => {
    expect(validateInsurance({ insurance_value: "3600", util_id_fk: "1", ins_id_fk: "2", cov_id_fk: "3" })).toBeNull();
  });

  it("deve retornar erro quando insurance_value está vazio", () => {
    expect(validateInsurance({ util_id_fk: "1", ins_id_fk: "2", cov_id_fk: "3" })).toMatch(/valor do seguro/i);
  });

  it("deve retornar erro quando util_id_fk está vazio", () => {
    expect(validateInsurance({ insurance_value: "3600", ins_id_fk: "2", cov_id_fk: "3" })).toMatch(/utilização/i);
  });

  it("deve retornar erro quando ins_id_fk está vazio", () => {
    expect(validateInsurance({ insurance_value: "3600", util_id_fk: "1", cov_id_fk: "3" })).toMatch(/seguradora/i);
  });

  it("deve retornar erro quando cov_id_fk está vazio", () => {
    expect(validateInsurance({ insurance_value: "3600", util_id_fk: "1", ins_id_fk: "2" })).toMatch(/cobertura/i);
  });
});
