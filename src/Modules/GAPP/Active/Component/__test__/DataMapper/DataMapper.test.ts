import { mapFormToApi } from "../../DataMapper/DataMapper";
import { ActiveFormValues, VehicleFormValues } from "../../FormActive/FormInterfaces/FormActiveInterface";

describe("mapFormToApi", () => {
  it("deve converter booleanos para 1 e 0", () => {
    const active: ActiveFormValues = {
      is_vehicle: true,
    };

    const vehicle: VehicleFormValues = {
      shielding: false,
    };

    const result = mapFormToApi(active, vehicle);

    expect(result.active.is_vehicle).toBe(1);
    expect(result.vehicle.shielding).toBe(0);
  });

  it("deve fazer stringify de list_items e place_purchase", () => {
    const active: ActiveFormValues = {
      is_vehicle: true,
      list_items: { list: ["Item 1", "Item 2"] },
      place_purchase: { city: "São Paulo", zip_code: "00000-000" },
    };

    const vehicle: VehicleFormValues = {
      shielding: true,
    };

    const result = mapFormToApi(active, vehicle);

    expect(typeof result.active.list_items).toBe("string");
    expect(typeof result.active.place_purchase).toBe("string");

    expect(JSON.parse(result.active.list_items as string)).toEqual({
      list: ["Item 1", "Item 2"],
    });

    expect(JSON.parse(result.active.place_purchase as string)).toEqual({
      city: "São Paulo",
      zip_code: "00000-000",
    });
  });

  it("deve usar valores padrão quando list_items e place_purchase não existirem", () => {
    const active: ActiveFormValues = {
      is_vehicle: false,
    };

    const vehicle: VehicleFormValues = {
      shielding: false,
    };

    const result = mapFormToApi(active, vehicle);

    expect(JSON.parse(result.active.list_items as string)).toEqual({ list: [] });
    expect(JSON.parse(result.active.place_purchase as string)).toEqual({});
  });

  it("deve preservar os outros campos do active e vehicle", () => {
    const active: ActiveFormValues = {
      is_vehicle: true,
      brand: "Ford",
      model: "Fiesta",
      value_purchase: 10000,
    };

    const vehicle: VehicleFormValues = {
      shielding: true,
      license_plates: "ABC-1234",
      color: "Preto",
    };

    const result = mapFormToApi(active, vehicle);

    expect(result.active.brand).toBe("Ford");
    expect(result.active.model).toBe("Fiesta");
    expect(result.active.value_purchase).toBe(10000);

    expect(result.vehicle.license_plates).toBe("ABC-1234");
    expect(result.vehicle.color).toBe("Preto");
  });

  it("não deve quebrar se campos opcionais estiverem undefined", () => {
    const active: ActiveFormValues = {};
    const vehicle: VehicleFormValues = {};

    const result = mapFormToApi(active, vehicle);

    expect(result.active.is_vehicle).toBe(0);
    expect(result.vehicle.shielding).toBe(0);

    expect(JSON.parse(result.active.list_items as string)).toEqual({ list: [] });
    expect(JSON.parse(result.active.place_purchase as string)).toEqual({});
  });
});
