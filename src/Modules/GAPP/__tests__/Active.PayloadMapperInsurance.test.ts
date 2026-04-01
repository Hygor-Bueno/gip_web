import { mapFormToApi } from "../Active/Component/PayloadMapper/PayloadMapperInsurance";
import { ActiveFormValues, Insurance, VehicleFormValues } from "../Active/Interfaces/Interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// mapFormToApi (Insurance)
// ─────────────────────────────────────────────────────────────────────────────
describe("mapFormToApi — Insurance", () => {

  const baseActive: ActiveFormValues   = { brand: "Toyota", model: "Corolla" };
  const baseVehicle: VehicleFormValues = { license_plates: "ABC-1234" };

  const baseInsurance: Partial<Insurance> = {
    id_insurance:    1,
    risk_cep:        "01310-100",
    insurance_value: "5000.00",
    property_damage: 100000,
    moral_damages:   50000,
    bodily_damages:  80000,
    glasses:         "Sim",
    assist_24hrs:    "Sim",
    km_Trailer:      "100",
    ins_id_fk:       "3",
    cov_id_fk:       "2",
    util_id_fk:      "1",
    status_insurance:"1",
    vehicle_id_fk:   "10",
  };

  it("deve retornar payload flat (sem nesting de 'insurance')", () => {
    const result = mapFormToApi(baseActive, baseVehicle, baseInsurance);
    expect(result).not.toHaveProperty("insurance");
  });

  it("deve incluir id_insurance no payload", () => {
    const result = mapFormToApi(baseActive, baseVehicle, baseInsurance);
    expect(result.id_insurance).toBe(1);
  });

  it("deve incluir risk_cep no payload", () => {
    const result = mapFormToApi(baseActive, baseVehicle, baseInsurance);
    expect(result.risk_cep).toBe("01310-100");
  });

  it("deve incluir insurance_value no payload", () => {
    const result = mapFormToApi(baseActive, baseVehicle, baseInsurance);
    expect(result.insurance_value).toBe("5000.00");
  });

  it("deve retornar objeto vazio quando insurance não informado", () => {
    const result = mapFormToApi(baseActive, baseVehicle, undefined);
    expect(result).toEqual({});
  });

  it("deve manter todos os campos do seguro no payload", () => {
    const result = mapFormToApi(baseActive, baseVehicle, baseInsurance);
    expect(result.property_damage).toBe(100000);
    expect(result.moral_damages).toBe(50000);
    expect(result.glasses).toBe("Sim");
    expect(result.status_insurance).toBe("1");
    expect(result.vehicle_id_fk).toBe("10");
  });
});
