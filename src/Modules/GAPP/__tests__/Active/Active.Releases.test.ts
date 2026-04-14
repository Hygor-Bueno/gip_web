/**
 * Testa a lógica de negócio pura do módulo Releases (Lançamento de Despesas).
 * - Valores default
 * - Manipulação da lista de peças (addPart / removePart)
 * - Manipulação da lista de franquias (addFranchiseItem / removeFranchiseItem)
 * - Validação de campos obrigatórios antes do submit
 * - Montagem dos payloads enviados para cada aba
 */
export {};

import { Expense, FuelData, MaintenanceData, FinesData, SinisterData, PartItem } from "../../Active/Component/Releases/Interfaces";
import { Insurance } from "../../Active/Interfaces/Interfaces";
import {
  defaultExpense,
  defaultFuel,
  defaultMaintenance,
  defaultFines,
  defaultSinister,
  defaultInsurance,
} from "../../Active/Component/Releases/defaultValues";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (mirrors the pure logic inside Releases.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function addPart(prev: MaintenanceData, part: PartItem): MaintenanceData {
  const updated = [...(prev.list_parts?.list || []), part];
  return {
    ...prev,
    list_parts:  { list: updated },
    value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
  };
}

function removePart(prev: MaintenanceData, index: number): MaintenanceData {
  const updated = (prev.list_parts?.list || []).filter((_, i) => i !== index);
  return {
    ...prev,
    list_parts:  { list: updated },
    value_parts: String(updated.reduce((s, p) => s + Number(p.quantity) * Number(p.value), 0)),
  };
}

function addFranchiseItem(
  prev: Partial<Insurance>,
  description: string,
  value: string
): Partial<Insurance> {
  return {
    ...prev,
    franchise_list: {
      list: [...(prev.franchise_list?.list || []), { description: description.trim(), value }],
    },
  };
}

function removeFranchiseItem(prev: Partial<Insurance>, index: number): Partial<Insurance> {
  return {
    ...prev,
    franchise_list: {
      list: (prev.franchise_list?.list || []).filter((_, i) => i !== index),
    },
  };
}

function isExpenseHeaderValid(expense: Expense): boolean {
  return Boolean(expense.date && expense.hour && expense.total_value);
}

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

function buildInsuranceExpensePayload(expense: Expense, insuranceValue: string) {
  return {
    ...expense,
    exp_type_id_fk: "5",
    total_value: insuranceValue,
    description: "Adição/Renovação do seguro",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// defaultValues
// ─────────────────────────────────────────────────────────────────────────────
describe("defaultValues — valores iniciais", () => {

  it("defaultExpense deve conter active_id_fk e user_id_fk fornecidos", () => {
    const exp = defaultExpense("42", "7");
    expect(exp.active_id_fk).toBe("42");
    expect(exp.user_id_fk).toBe("7");
  });

  it("defaultExpense deve ter status_expen '1'", () => {
    const exp = defaultExpense("1", "1");
    expect(exp.status_expen).toBe("1");
  });

  it("defaultExpense deve ter description 'Outros'", () => {
    const exp = defaultExpense("1", "1");
    expect(exp.description).toBe("Outros");
  });

  it("defaultMaintenance deve ter list_parts vazia", () => {
    expect(defaultMaintenance.list_parts.list).toHaveLength(0);
  });

  it("defaultMaintenance deve ter warranty 0", () => {
    expect(defaultMaintenance.warranty).toBe(0);
  });

  it("defaultFuel deve ter liter_value '0'", () => {
    expect(defaultFuel.liter_value).toBe("0");
  });

  it("defaultFines deve ter infraction_id_fk '4'", () => {
    expect(defaultFines.infraction_id_fk).toBe("4");
  });

  it("defaultInsurance deve ter status_insurance '1'", () => {
    expect(defaultInsurance.status_insurance).toBe("1");
  });

  it("defaultInsurance deve ter franchise_list vazia", () => {
    expect(defaultInsurance.franchise_list?.list).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addPart / removePart
// ─────────────────────────────────────────────────────────────────────────────
describe("Maintenance — addPart / removePart", () => {

  const baseMaintenance = { ...defaultMaintenance };

  it("addPart deve adicionar a peça à lista", () => {
    const result = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    expect(result.list_parts.list).toHaveLength(1);
    expect(result.list_parts.list[0].description).toBe("Filtro");
  });

  it("addPart deve calcular value_parts corretamente", () => {
    const result = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    expect(result.value_parts).toBe("100");
  });

  it("addPart acumulado — deve somar peças", () => {
    let m = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    m = addPart(m, { description: "Óleo", quantity: "1", value: "80" });
    expect(m.list_parts.list).toHaveLength(2);
    expect(m.value_parts).toBe("180");
  });

  it("removePart deve remover a peça pelo índice", () => {
    let m = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    m = addPart(m, { description: "Óleo",   quantity: "1", value: "80" });
    m = removePart(m, 0);
    expect(m.list_parts.list).toHaveLength(1);
    expect(m.list_parts.list[0].description).toBe("Óleo");
  });

  it("removePart deve recalcular value_parts após remoção", () => {
    let m = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    m = addPart(m, { description: "Óleo",   quantity: "1", value: "80" });
    m = removePart(m, 0); // remove Filtro (100)
    expect(m.value_parts).toBe("80");
  });

  it("removePart em lista vazia não lança erro", () => {
    const result = removePart(baseMaintenance, 0);
    expect(result.list_parts.list).toHaveLength(0);
  });

  it("value_parts deve ser '0' após remover todas as peças", () => {
    let m = addPart(baseMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    m = removePart(m, 0);
    expect(m.value_parts).toBe("0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addFranchiseItem / removeFranchiseItem
// ─────────────────────────────────────────────────────────────────────────────
describe("Insurance — addFranchiseItem / removeFranchiseItem", () => {

  const baseIns = { ...defaultInsurance };

  it("addFranchiseItem deve adicionar item à franchise_list", () => {
    const result = addFranchiseItem(baseIns, "Para-brisa", "800");
    expect(result.franchise_list?.list).toHaveLength(1);
    expect(result.franchise_list?.list[0].description).toBe("Para-brisa");
    expect(result.franchise_list?.list[0].value).toBe("800");
  });

  it("addFranchiseItem deve aparar espaços da descrição", () => {
    const result = addFranchiseItem(baseIns, "  Vidro lateral  ", "500");
    expect(result.franchise_list?.list[0].description).toBe("Vidro lateral");
  });

  it("addFranchiseItem acumulado — deve manter itens anteriores", () => {
    let ins = addFranchiseItem(baseIns, "Para-brisa", "800");
    ins = addFranchiseItem(ins, "Farol", "300");
    expect(ins.franchise_list?.list).toHaveLength(2);
  });

  it("removeFranchiseItem deve remover pelo índice correto", () => {
    let ins = addFranchiseItem(baseIns, "Para-brisa", "800");
    ins = addFranchiseItem(ins, "Farol", "300");
    ins = removeFranchiseItem(ins, 0);
    expect(ins.franchise_list?.list).toHaveLength(1);
    expect(ins.franchise_list?.list[0].description).toBe("Farol");
  });

  it("removeFranchiseItem em lista vazia não lança erro", () => {
    const result = removeFranchiseItem(baseIns, 0);
    expect(result.franchise_list?.list).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validação do cabeçalho de despesa
// ─────────────────────────────────────────────────────────────────────────────
describe("isExpenseHeaderValid — validação antes do submit", () => {

  const validExpense: Expense = {
    date: "2024-06-01", hour: "10:30", local: "", store_id_fk: "",
    description: "Outros", coupon_number: "", total_value: "150.00",
    discount: "", exp_type_id_fk: "", status_expen: "1",
    driver_id_fk: "", active_id_fk: "1", user_id_fk: "5",
  };

  it("deve retornar true quando date, hour e total_value estão preenchidos", () => {
    expect(isExpenseHeaderValid(validExpense)).toBe(true);
  });

  it("deve retornar false quando date está vazio", () => {
    expect(isExpenseHeaderValid({ ...validExpense, date: "" })).toBe(false);
  });

  it("deve retornar false quando hour está vazio", () => {
    expect(isExpenseHeaderValid({ ...validExpense, hour: "" })).toBe(false);
  });

  it("deve retornar false quando total_value está vazio", () => {
    expect(isExpenseHeaderValid({ ...validExpense, total_value: "" })).toBe(false);
  });

  it("deve retornar false quando todos os campos obrigatórios estão vazios", () => {
    expect(isExpenseHeaderValid({ ...validExpense, date: "", hour: "", total_value: "" })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Montagem de payloads
// ─────────────────────────────────────────────────────────────────────────────
describe("buildFuelPayload — abastecimento", () => {

  const expense: Expense = {
    date: "2024-06-01", hour: "10:30", local: "Posto BR", store_id_fk: "2",
    description: "Combustível", coupon_number: "100", total_value: "200.00",
    discount: "0", exp_type_id_fk: "", status_expen: "1",
    driver_id_fk: "3", active_id_fk: "42", user_id_fk: 5,
  };

  const fuel: FuelData = {
    liter_value: "5.89", coupon_number: "100", km_day: "12500",
    liter_qtd: "34", expen_id_fk: "", fuel_type_id_fk: "1",
  };

  it("deve incluir exp_type_id_fk = 1", () => {
    const payload = buildFuelPayload(expense, fuel);
    expect(payload.exp_type_id_fk).toBe(1);
  });

  it("deve incluir gappProcedure = 1", () => {
    const payload = buildFuelPayload(expense, fuel);
    expect(payload.gappProcedure).toBe(1);
  });

  it("deve incluir dados do combustível no payload", () => {
    const payload = buildFuelPayload(expense, fuel);
    expect(payload.liter_qtd).toBe("34");
    expect(payload.fuel_type_id_fk).toBe("1");
    expect(payload.km_day).toBe("12500");
  });

  it("deve incluir dados da despesa no payload", () => {
    const payload = buildFuelPayload(expense, fuel);
    expect(payload.active_id_fk).toBe("42");
    expect(payload.user_id_fk).toBe(5);
  });
});

describe("buildMaintenancePayload — manutenção", () => {

  it("deve incluir expen_id_fk no payload", () => {
    const payload = buildMaintenancePayload(defaultMaintenance, "77");
    expect(payload.expen_id_fk).toBe("77");
  });

  it("deve incluir list_parts no payload", () => {
    let m = addPart(defaultMaintenance, { description: "Filtro", quantity: "2", value: "50" });
    const payload = buildMaintenancePayload(m, "77");
    expect(payload.list_parts.list).toHaveLength(1);
  });

  it("deve preservar todos os campos de manutenção", () => {
    const m: MaintenanceData = { ...defaultMaintenance, technician: "Carlos", service_value: "350" };
    const payload = buildMaintenancePayload(m, "88");
    expect(payload.technician).toBe("Carlos");
    expect(payload.service_value).toBe("350");
  });
});

describe("buildFinesPayload — multas", () => {

  it("deve incluir expen_id_fk e offending_driver no payload", () => {
    const payload = buildFinesPayload(defaultFines, "55", "12");
    expect(payload.expen_id_fk).toBe("55");
    expect(payload.offending_driver).toBe("12");
  });

  it("deve preservar campos de multa", () => {
    const fines: FinesData = { ...defaultFines, points: "7", infraction: "Excesso de velocidade" };
    const payload = buildFinesPayload(fines, "55", "12");
    expect(payload.points).toBe("7");
    expect(payload.infraction).toBe("Excesso de velocidade");
  });
});

describe("buildSinisterPayload — sinistro", () => {

  it("deve incluir expen_id_fk, offending_driver e id_insurance_fk", () => {
    const payload = buildSinisterPayload(defaultSinister, "90", "5", "3");
    expect(payload.expen_id_fk).toBe("90");
    expect(payload.offending_driver).toBe("5");
    expect(payload.id_insurance_fk).toBe("3");
  });

  it("deve preservar campos do sinistro", () => {
    const sinister: SinisterData = { ...defaultSinister, bo_number: "2024/001", guilty: "1" };
    const payload = buildSinisterPayload(sinister, "90", "5", "3");
    expect(payload.bo_number).toBe("2024/001");
    expect(payload.guilty).toBe("1");
  });
});

describe("buildInsuranceExpensePayload — lançamento de seguro", () => {

  const expense: Expense = {
    date: "2024-06-01", hour: "09:00", local: "", store_id_fk: "",
    description: "Outros", coupon_number: "", total_value: "",
    discount: "", exp_type_id_fk: "", status_expen: "1",
    driver_id_fk: "", active_id_fk: "42", user_id_fk: 5,
  };

  it("deve definir exp_type_id_fk = '5'", () => {
    const payload = buildInsuranceExpensePayload(expense, "2400.00");
    expect(payload.exp_type_id_fk).toBe("5");
  });

  it("deve definir total_value como o valor do seguro", () => {
    const payload = buildInsuranceExpensePayload(expense, "2400.00");
    expect(payload.total_value).toBe("2400.00");
  });

  it("deve definir description como 'Adição/Renovação do seguro'", () => {
    const payload = buildInsuranceExpensePayload(expense, "2400.00");
    expect(payload.description).toBe("Adição/Renovação do seguro");
  });

  it("deve preservar active_id_fk e user_id_fk da despesa base", () => {
    const payload = buildInsuranceExpensePayload(expense, "2400.00");
    expect(payload.active_id_fk).toBe("42");
    expect(payload.user_id_fk).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clearForm — reset de estado
// ─────────────────────────────────────────────────────────────────────────────
describe("clearForm — reset de estado após lançamento", () => {

  it("defaultExpense gerado com activeId e userId corretos após clear", () => {
    const fresh = defaultExpense("10", "3");
    expect(fresh.active_id_fk).toBe("10");
    expect(fresh.user_id_fk).toBe("3");
    expect(fresh.date).toBe("");
    expect(fresh.total_value).toBe("");
  });

  it("defaultMaintenance após clear tem list_parts vazia", () => {
    const m = { ...defaultMaintenance };
    const fresh = { ...defaultMaintenance };
    expect(fresh.list_parts.list).toHaveLength(0);
    expect(fresh.value_parts).toBe("");
  });

  it("defaultInsurance após clear tem franchise_list vazia", () => {
    const fresh = { ...defaultInsurance };
    expect(fresh.franchise_list?.list).toHaveLength(0);
  });

  it("defaultInsurance após clear tem status_insurance '1'", () => {
    const fresh = { ...defaultInsurance };
    expect(fresh.status_insurance).toBe("1");
  });
});
