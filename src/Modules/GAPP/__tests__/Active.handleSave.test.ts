import { Active, ActiveFormValues, Insurance, VehicleFormValues } from "../Active/Interfaces/Interfaces";

/**
 * Testa a lógica de handleSave do ActiveTable isolada como função pura.
 * O handleSave é responsável por atualizar a lista e o modalData em memória
 * após um PUT bem-sucedido — sem recarregar da API.
 */

// Extrai a lógica pura do handleSave para ser testável independentemente
function applyActiveSave(
  data: Active[],
  active: Partial<ActiveFormValues>
): Active[] {
  return data.map((item) =>
    String(item.active_id) === String(active.active_id)
      ? { ...item, ...active } as Active
      : item
  );
}

function applyModalSave(
  prev: { vehicle?: Partial<VehicleFormValues>; insurance?: Insurance } | null,
  vehicle?: Partial<VehicleFormValues>,
  insurance?: Partial<Insurance>
) {
  if (!prev) return null;
  return {
    ...prev,
    ...(vehicle   && { vehicle }),
    ...(insurance && { insurance: insurance as Insurance }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
const makeActive = (overrides: Partial<Active> = {}): Active => ({
  active_id:        "1",
  brand:            "Toyota",
  model:            "Corolla",
  number_nf:        "12345",
  status_active:    "1",
  change_date:      "2024-01-01",
  list_items:       { list: [] },
  used_in:          "1",
  date_purchase:    "2024-01-01",
  place_purchase:   {},
  value_purchase:   "90000",
  is_vehicle:       1,
  units_id_fk:      "1",
  id_active_class_fk: "1",
  user_id_fk:       "1",
  work_group_fk:    "1",
  unit_id:          1,
  unit_number:      1,
  address:          "",
  unit_name:        "Unidade SP",
  cnpj:             "",
  status_unit:      1,
  comp_id_fk:       1,
  id_active_class:  "1",
  desc_active_class: "",
  status_active_class: "",
  active_type_id_fk: "",
  user_id:          "1",
  name:             "Jonatas",
  access_code:      "",
  driver:           "",
  status_user:      "",
  sub_dep_id_fk:    "",
  level_id_fk:      "",
  group_id:         1,
  group_name:       "",
  status_work_group: 1,
  dep_id_fk:        1,
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe("handleSave — atualização em memória do Active", () => {

  it("deve atualizar o item correto na lista pelo active_id", () => {
    const data = [makeActive({ active_id: "1", brand: "Toyota" }), makeActive({ active_id: "2", brand: "Honda" })];
    const result = applyActiveSave(data, { active_id: 1, brand: "Volkswagen" });
    expect(result[0].brand).toBe("Volkswagen");
    expect(result[1].brand).toBe("Honda");
  });

  it("não deve alterar itens com active_id diferente", () => {
    const data = [makeActive({ active_id: "1" }), makeActive({ active_id: "2", model: "Civic" })];
    const result = applyActiveSave(data, { active_id: 1, brand: "Fiat" });
    expect(result[1].model).toBe("Civic");
  });

  it("deve preservar campos não alterados do item atualizado", () => {
    const data = [makeActive({ active_id: "1", brand: "Toyota", model: "Corolla" })];
    const result = applyActiveSave(data, { active_id: 1, brand: "Honda" });
    expect(result[0].model).toBe("Corolla");
  });

  it("deve comparar active_id como string mesmo quando recebe número", () => {
    const data = [makeActive({ active_id: "10" })];
    const result = applyActiveSave(data, { active_id: 10, brand: "Fiat" });
    expect(result[0].brand).toBe("Fiat");
  });

  it("não deve alterar nada quando active_id não existe na lista", () => {
    const data = [makeActive({ active_id: "1", brand: "Toyota" })];
    const result = applyActiveSave(data, { active_id: 99, brand: "Fiat" });
    expect(result[0].brand).toBe("Toyota");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("handleSave — atualização em memória do modalData", () => {

  const prevModal = {
    vehicle:   { license_plates: "ABC-1234", year: 2022 } as Partial<VehicleFormValues>,
    insurance: { risk_cep: "01310-100" } as Insurance,
  };

  it("deve atualizar vehicle no modalData", () => {
    const result = applyModalSave(prevModal, { license_plates: "XYZ-9999" });
    expect((result?.vehicle as Partial<VehicleFormValues>)?.license_plates).toBe("XYZ-9999");
  });

  it("deve atualizar insurance no modalData", () => {
    const result = applyModalSave(prevModal, undefined, { risk_cep: "09999-000" } as Insurance);
    expect(result?.insurance?.risk_cep).toBe("09999-000");
  });

  it("deve preservar vehicle quando só insurance é atualizado", () => {
    const result = applyModalSave(prevModal, undefined, { risk_cep: "09999-000" } as Insurance);
    expect((result?.vehicle as Partial<VehicleFormValues>)?.license_plates).toBe("ABC-1234");
  });

  it("deve preservar insurance quando só vehicle é atualizado", () => {
    const result = applyModalSave(prevModal, { license_plates: "XYZ-9999" });
    expect(result?.insurance?.risk_cep).toBe("01310-100");
  });

  it("deve retornar null quando prev é null", () => {
    expect(applyModalSave(null, { license_plates: "XYZ" })).toBeNull();
  });

  it("deve atualizar vehicle e insurance simultaneamente", () => {
    const result = applyModalSave(
      prevModal,
      { license_plates: "NEW-0001" },
      { risk_cep: "00000-000" } as Insurance
    );
    expect((result?.vehicle as Partial<VehicleFormValues>)?.license_plates).toBe("NEW-0001");
    expect(result?.insurance?.risk_cep).toBe("00000-000");
  });
});
