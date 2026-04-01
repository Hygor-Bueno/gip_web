import { buildOptions, buildOptionsInsurance } from "../Active/Component/BuildFunction/BuildFunction";
import { FormActiveProps } from "../Active/Interfaces/Interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// buildOptions
// ─────────────────────────────────────────────────────────────────────────────
describe("buildOptions", () => {

  const apiData: FormActiveProps["apiData"] = {
    company: [
      { comp_id: 1, corporate_name: "Empresa Alpha", fantasy_name: "Alpha", status_comp: 1 },
      { comp_id: 2, corporate_name: "Empresa Beta",  fantasy_name: "Beta",  status_comp: 1 },
    ],
    unit: [
      { unit_id: 10, unit_name: "Unidade SP", unit_number: 1, cnpj: "00.000.000/0001-00", status_unit: 1, comp_id: 1, comp_id_fk: 1, corporate_name: "Alpha", fantasy_name: "Alpha", status_comp: 1, address: { city: "SP", state: "SP", store: "", number: "", zip_code: "", complement: "", neighborhood: "", public_place: "" } },
    ],
    departament: [
      { dep_id: 5, dep_name: "TI", fantasy_name: "Alpha", unit_name: "Unidade SP", status_dep: 1, unit_id_fk: 10, unit_id: 10, unit_number: 1, address: "", cnpj: "", status_unit: 1, comp_id_fk: 1, comp_id: 1, corporate_name: "Alpha", status_comp: 1 },
    ],
    driver: [
      { driver_id: 3, name: "João Silva", rg: "", cpf: "", cnh: "", category: "", validity_cnh: "", status_driver: 1, user_id_fk: "", sub_dep_id_fk: "", level_id_fk: "", user_id: "", access_code: "", driver: "", status_user: "", level_id: "", level_name: "", level_pages: { level: [] }, status_level: "", group_id_fk: "" },
    ],
    fuelType: [
      { id_fuel_type: 1, description: "Gasolina" },
      { id_fuel_type: 2, description: "Etanol"   },
    ],
  };

  it("deve mapear company para { label: corporate_name, value: comp_id }", () => {
    const result = buildOptions(apiData);
    expect(result.company).toEqual([
      { label: "Empresa Alpha", value: "1" },
      { label: "Empresa Beta",  value: "2" },
    ]);
  });

  it("deve mapear unit para { label: unit_name, value: unit_id }", () => {
    const result = buildOptions(apiData);
    expect(result.unit).toEqual([{ label: "Unidade SP", value: "10" }]);
  });

  it("deve mapear departament com label composto (fantasy > unit > dep)", () => {
    const result = buildOptions(apiData);
    expect(result.departament[0].label).toBe("Alpha > Unidade SP > TI");
    expect(result.departament[0].value).toBe("5");
  });

  it("deve mapear driver para { label: name, value: driver_id }", () => {
    const result = buildOptions(apiData);
    expect(result.driver).toEqual([{ label: "João Silva", value: "3" }]);
  });

  it("deve mapear fuelType para { label: description, value: id_fuel_type }", () => {
    const result = buildOptions(apiData);
    expect(result.fuel).toEqual([
      { label: "Gasolina", value: "1" },
      { label: "Etanol",   value: "2" },
    ]);
  });

  it("deve retornar arrays vazios quando apiData é undefined", () => {
    const result = buildOptions(undefined);
    expect(result.company).toEqual([]);
    expect(result.unit).toEqual([]);
    expect(result.departament).toEqual([]);
    expect(result.driver).toEqual([]);
    expect(result.fuel).toEqual([]);
  });

  it("deve retornar arrays vazios quando listas individuais estão ausentes", () => {
    const result = buildOptions({});
    expect(result.company).toEqual([]);
    expect(result.fuel).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildOptionsInsurance
// ─────────────────────────────────────────────────────────────────────────────
describe("buildOptionsInsurance", () => {

  it("deve mapear franchise_list para { label: description, value: value }", () => {
    const result = buildOptionsInsurance({
      insurance: {
        franchise_list: {
          list: [
            { description: "Para-brisa", value: "800"  },
            { description: "Vidro lat.",  value: "300"  },
          ],
        },
      } as any,
    });
    expect(result.franchise_list).toEqual([
      { label: "Para-brisa", value: "800" },
      { label: "Vidro lat.",  value: "300" },
    ]);
  });

  it("deve retornar franchise_list vazio quando insurance não tem a lista", () => {
    const result = buildOptionsInsurance({ insurance: {} as any });
    expect(result.franchise_list).toEqual([]);
  });

  it("deve retornar franchise_list vazio quando apiData é undefined", () => {
    const result = buildOptionsInsurance(undefined);
    expect(result.franchise_list).toEqual([]);
  });
});
