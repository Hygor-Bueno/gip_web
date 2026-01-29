import { fetchDataFull } from "../../../../Util/Util";

export async function ActiveData () {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Active.php",
        urlComplement: "&all=1",
    });
}

export async function ActiveVehicleData(active_id: string) {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Vehicle.php",
        urlComplement: `&active_id_fk=${active_id}`
    });
}

export async function ActiveUnitsData() {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Units.php",
        urlComplement: `&all=1`
    });
}

export async function ActiveDepartamentData() {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Departament.php",
        urlComplement: `&all=1`
    });
}

export async function ActiveDriverData() {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Driver.php",
        urlComplement: `&all=1`
    });
}

export async function ActiveFuelData() {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/Fuel.php",
        urlComplement: `&all=1`
    });
}

export async function ActiveTypeFuelData() {
    return await fetchDataFull({
        method: "GET",
        params: null,
        pathFile: "GAPP/TypeFuel.php",
        urlComplement: `&all=1`
    });
}