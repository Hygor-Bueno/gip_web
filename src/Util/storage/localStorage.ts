import { fetchDataFull } from "../api/http";

export async function loadLocalStorage(user: any) {
    try {
        const response = await fetchDataFull({
            method: 'GET',
            params: null,
            pathFile: "CCPP/Employee.php",
            urlComplement: `&id=${user.id}&all_data`,
        });

        if (response.error) throw new Error(response.message);

        localStorage.setItem("num_store", response.data[0]?.number_shop ?? "");
        localStorage.setItem("store", response.data[0]?.shop ?? "");

    } catch (e: any) {
        console.error(e.toString());
    }
}

export function cleanLocalStorage() {
    localStorage.removeItem("tokenGIPP");
    localStorage.removeItem("codUserGIPP");
}