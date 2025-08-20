import { useEffect, useState } from "react";
import { fieldsetsCSDS } from "./CSDSConfig"
import CustomForm from "./CustomForm"
import { useConnection } from "../Context/ConnContext";
import { useMyContext } from "../Context/MainContext";

export default function FiltersSearchUser(props: { onAction: (value: string) => void }) {
    const [company, setCompany] = useState<any[]>([]);
    const [store, setStore] = useState<any[]>([]);
    const [departament, setDepartament] = useState<any[]>([]);
    const [subdepartament, setSubdepartament] = useState<any[]>([]);
    const [employeeName, setEmployeeName] = useState<string>('');
    const [selecteds, setSelecteds] = useState<{ pCompanyId?: number; pShopId?: number; pDepartmentId?: number; pSubDepartmentId?: number }>({});
    const { fetchData } = useConnection();
    const { setLoading } = useMyContext();

    useEffect(() => {
        loadCompany();
    }, []);

    function convertDataForOptionSelect(data: any[], label: string, value: string): [{ value: string, label: string }] {
        let result: [{ value: string, label: string }] = [{ value: "", label: "" }];
        data.forEach((item: any) => {
            result.push({ value: item[value], label: item[label] });
        })
        return result;
    }

    function clearLists() {
        setStore([]);
        setDepartament([]);
        setSubdepartament([]);
    }

    async function loadCompany() {
        try {
            setLoading(true);
            const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Company.php" });
            if (req.data) setCompany(req.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    async function loadStore(idCompany: number) {
        try {
            setLoading(true);
            clearLists();
            changeSelecteds(idCompany, "pCompanyId");
            const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Shop.php", urlComplement: `&company_id=${idCompany}` });
            if (req.error) throw new Error(req.message);
            setStore(req.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    async function loadDepartament(idStore: number) {
        try {
            setLoading(true);
            setDepartament([]);
            setSubdepartament([]);
            changeSelecteds(idStore, "pShopId");
            if (idStore) {
                const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Department.php", urlComplement: `&shop_id=${idStore}` });
                if (req.error) throw new Error(req.message);
                setDepartament(req.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    function changeSelecteds(value: number, key: "pCompanyId" | "pShopId" | "pDepartmentId" | "pSubDepartmentId") {
        const newValue = selecteds;
        newValue[key] = isNaN(value) ? undefined : value;;
        setSelecteds(newValue);
    }
    async function loadSubdepartament(idDepartament: number) {
        try {
            setLoading(true);
            setSubdepartament([]);
            changeSelecteds(idDepartament, "pDepartmentId");
            if (idDepartament) {
                const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/SubDepartment.php", urlComplement: `&company_id=${selecteds.pCompanyId}&shop_id=${selecteds.pShopId}&department_id=${idDepartament}` });
                if (req.error) throw new Error(req.message);
                setSubdepartament(req.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    function clearForm() {
        clearLists();
        setEmployeeName("");
        setSelecteds({});
    }
    function buildQueryString(params: { pCompanyId?: number; pShopId?: number; pDepartmentId?: number; pSubDepartmentId?: number }): string {
        let response = Object.entries(params)
            .filter(([_, value]) => value !== undefined) // Filtra apenas os valores definidos
            .map(([key, value]) => `&${key}=${value}`) // Formata no padrão desejado
            .join(""); // Junta tudo em uma única string
        if (employeeName) response += `&pEmployeeName=${employeeName}`;
        return response
    }
    return (
        <div className="d-flex flex-column col-12 p-2 bg-white">
            <CustomForm notButton={false} className="m-0 row w-100 bg-white" fieldsets={
                fieldsetsCSDS(
                    convertDataForOptionSelect(company, "description", "id"),
                    loadStore,
                    convertDataForOptionSelect(store, "description", "id"),
                    loadDepartament,
                    convertDataForOptionSelect(departament, "description", "id"),
                    loadSubdepartament,
                    convertDataForOptionSelect(subdepartament, "description", "id"),
                    (subDepartamentId: number) => { changeSelecteds(subDepartamentId, "pSubDepartmentId"); },
                    employeeName,
                    setEmployeeName,
                    selecteds.pCompanyId?.toString() || ""
                )
            } />
            <div className="d-flex align-items-center gap-2">
                <button onClick={() => props.onAction(buildQueryString(selecteds))} className="btn btn-success my-2" type="button">Buscar</button>
                <button onClick={() => {
                    clearForm(); 
                    props.onAction("");
                }} className="btn btn-danger my-2" type="button">Limpar</button>
            </div>
        </div>
    );
}