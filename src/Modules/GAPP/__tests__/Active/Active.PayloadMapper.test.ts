import { mapActiveToApi, mapVehicleToApi } from "../../Active/Component/PayloadMapper/PayloadMapper";
import { ActiveFormValues, VehicleFormValues } from "../../Active/Interfaces/Interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// mapActiveToApi
// ─────────────────────────────────────────────────────────────────────────────
describe("mapActiveToApi", () => {

  const baseActive: ActiveFormValues = {
    active_id: 1,
    brand: "Toyota",
    model: "Corolla",
    number_nf: 12345,
    value_purchase: 90000,
    date_purchase: "2024-01-15",
    is_vehicle: true,
    status_active: 1,
    units_id_fk: 2,
    used_in: 3,
    id_active_class_fk: 1,
    list_items: { list: ["Extintor", "Estepe"] },
    place_purchase: {
      store: "Loja X",
      city: "São Paulo",
      state: "SP",
      zip_code: "01310-100",
    },
  };

  it("deve retornar list_items como objeto", () => {
    const result = mapActiveToApi(baseActive);
    expect(typeof result.list_items).toBe("object");
    expect(result.list_items).toEqual({ list: ["Extintor", "Estepe"] });
  });

  it("deve retornar place_purchase como objeto", () => {
    const result = mapActiveToApi(baseActive);
    expect(typeof result.place_purchase).toBe("object");
    expect((result.place_purchase as any).city).toBe("São Paulo");
  });

  it("deve converter is_vehicle true → 1", () => {
    const result = mapActiveToApi({ ...baseActive, is_vehicle: true });
    expect(result.is_vehicle).toBe(1);
  });

  it("deve converter is_vehicle false → 0", () => {
    const result = mapActiveToApi({ ...baseActive, is_vehicle: false });
    expect(result.is_vehicle).toBe(0);
  });

  it("deve usar list_items vazio quando não informado", () => {
    const result = mapActiveToApi({ ...baseActive, list_items: undefined });
    expect(result.list_items).toEqual({ list: [] });
  });

  it("deve usar place_purchase vazio quando não informado", () => {
    const result = mapActiveToApi({ ...baseActive, place_purchase: undefined });
    expect(result.place_purchase).toEqual({});
  });

  it("deve manter os demais campos intactos", () => {
    const result = mapActiveToApi(baseActive);
    expect(result.brand).toBe("Toyota");
    expect(result.model).toBe("Corolla");
    expect(result.active_id).toBe(1);
    expect(result.value_purchase).toBe(90000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mapVehicleToApi
// ─────────────────────────────────────────────────────────────────────────────
describe("mapVehicleToApi", () => {

  const baseVehicle: VehicleFormValues = {
    license_plates: "ABC-1234",
    year: 2022,
    year_model: 2022,
    chassi: "9BWZZZ377VT004251",
    color: "Prata",
    renavam: "00123456789",
    power: 132,
    shielding: true,
    fuel_type_id_fk: 1,
  };

  it("deve converter shielding true → 1", () => {
    const result = mapVehicleToApi({ ...baseVehicle, shielding: true });
    expect(result.shielding).toBe(1);
  });

  it("deve converter shielding false → 0", () => {
    const result = mapVehicleToApi({ ...baseVehicle, shielding: false });
    expect(result.shielding).toBe(0);
  });

  it("deve manter os demais campos intactos", () => {
    const result = mapVehicleToApi(baseVehicle);
    expect(result.license_plates).toBe("ABC-1234");
    expect(result.chassi).toBe("9BWZZZ377VT004251");
    expect(result.year).toBe(2022);
  });
});
