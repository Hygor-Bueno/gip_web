import { buildOptions } from "../../BuildFunction/BuildFunction";

describe("buildOptions", () => {
    it("deve retornar todas as listas vazias quando apiData for undefined", () => {
        const result = buildOptions(undefined);

        expect(result).toEqual({
            company: [],
            departament: [],
            unit: [],
            driver: [],
            fuel: [],
        });
    });

    it("deve montar corretamente as opções de departamento", () => {
        const apiData = {
            departament: [
                {
                    dep_id: 10,
                    fantasy_name: "Fantasia",
                    unit_name: "Unidade 1",
                    dep_name: "Departamento X"
                },
            ],
        };

        const result = buildOptions(apiData);

        expect(result.departament).toEqual([
            {
                label: "Fantasia > Unidade 1 > Departamento X",
                value: "10",
            }
        ]);
    });

    it("deve montar corretamente as opções de unit, driver e fuel", () => {
        const apiData = {
            unit: [{ unit_id: 5, unit_name: "Unidade Central" }],
            driver: [{driver_id: 7, name: "João"}],
            fuelType: [{id_fuel_type: 3, description: "Gasolina"}]
        };

        const result = buildOptions(apiData);

        expect(result.unit).toEqual([{label: "Unidade Central", value: "5"}]);
        expect(result.driver).toEqual([{label: "João", value: "7"}]);
        expect(result.fuel).toEqual([{label: "Gasolina", value: "3"}]);
    });

    it("deve retornar arrays vazios para listas que não existirem no apiData", () => {
        const apiData = {
        company: [{ comp_id: 1, corporate_name: "Empresa A" }],
        // departament, unit, driver, fuelType não existem
        };

        const result = buildOptions(apiData);

        expect(result.company.length).toBe(1);
        expect(result.departament).toEqual([]);
        expect(result.unit).toEqual([]);
        expect(result.driver).toEqual([]);
        expect(result.fuel).toEqual([]);
    });
});