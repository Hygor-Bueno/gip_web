import React, { useEffect, useState } from "react";
import { useConnection } from "../Context/ConnContext";
import FiltersSearchUser from "./FiltersSearchUser";
import { useMyContext } from "../Context/MainContext";
import CustomTable from "./CustomTable";
import { tItemTable } from "../types/types";
import User from "../Class/User";

export default function SearchUser(props: { onClose?: (value: any) => void, selectedItems?: tItemTable[], keyField?: string, maxSelection?: number,  selectionList?: tItemTable[],  selectionKey?: string }) {
    const [page, setPage] = useState<number>(1);
    const [limitPage, setLimitPage] = useState<number>(1);
    const [params, setParams] = useState<string>('');
    const [list, setList] = useState<tItemTable[]>([]);
    const { setLoading, ctlSearchUser, setCtlSearchUser, appIdSearchUser } = useMyContext();

    const { fetchData } = useConnection();

    useEffect(() => {
        (async () => {
            await recoverList(params);
        })();
    }, [page, params, appIdSearchUser]);


    async function recoverList(value?: string) {
        try {
            setLoading(true);
            let newUrlComplement = `&pPage=${page}`
            if (value) {
                newUrlComplement += value;
            }
            if (appIdSearchUser) {
                newUrlComplement += `&pApplicationAccess=${appIdSearchUser}`
            }
            const req: any = await fetchData({ method: 'GET', params: null, pathFile: 'CCPP/Employee.php', urlComplement: newUrlComplement });
            if (req["error"]) throw new Error(req["message"]);
            setList(convertForTable(req["data"]));
            setLimitPage(req["limitPage"]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    }
    function convertForTable(array: any[]): tItemTable[] {
        return array.map(element => ({
            employee_id: maskUserSeach(element["employee_id"], "", false, true),
            employee_photo: maskUserSeach(element["employee_photo"], "#", true),
            employee_name: maskUserSeach(element["employee_name"], "Nome", false, false, "150px"),
            company_name: maskUserSeach(element["company_name"], "Comp.", false, false, "150px"),
            store_name: maskUserSeach(element["store_name"], "Loja", false, false, "150px"),
            departament_name: maskUserSeach(element["departament_name"], "Depto", false, false, "150px"),
            sub_dep_name: maskUserSeach(element["sub_dep_name"], "Cargo", false, false, "150px"),
        }));
    }

    function maskUserSeach(value: string, tag: string, isImage?: boolean, ocultColumn?: boolean, minWidth?: string): {
        tag: string;
        value: string;
        isImage?: boolean;
        ocultColumn?: boolean;
        minWidth?: string;
    } {
        return {
            tag,
            value,
            isImage,
            ocultColumn,
            minWidth
        };
    }

    return (
        ctlSearchUser
            ?
            <div style={{ zIndex: "2" }} className="d-flex align-items-center justify-content-center bg-dark bg-opacity-50 position-absolute top-0 start-0 w-100 h-100">
                <div className="d-flex flex-column justify-content-between bg-dark bg-gradient p-2 rounded w-100 h-100">
                    <header>
                        <div>
                            <h1 className="text-white">Colaboradores:</h1>
                        </div>
                        <FiltersSearchUser onAction={(e: string) => {
                            setParams(e);
                            setPage(1);
                        }} />
                    </header>
                    <section className="bg-white flex-grow-1 overflow-auto">
                        {(list.length > 0) ?
                                            <CustomTable 
                                                list={list} 
                                                onConfirmList={closeCustomTable} 
                                                selectedItems={props.selectedItems} 
                                                maxSelection={props.maxSelection} 
                                                selectionList={props.selectionList} 
                                                selectionKey={props.selectionKey}
                                            />
                                        : <React.Fragment />}
                    </section>
                    <footer className="d-flex align-items-center justify-content-around text-white py-2">
                        <button onClick={() => navPage(false)} className="btn btn-light fa-solid fa-backward" type="button"></button>
                        {`( ${page.toString().padStart(2, '0')} / ${limitPage.toString().padStart(2, '0')} )`}
                        <button onClick={() => navPage(true)} className="btn btn-light fa-solid fa-forward" type="button"></button>
                    </footer>
                </div>
            </div>
            :
            <React.Fragment />
    );

    function closeCustomTable(items: tItemTable[]) {
        let listUser: User[] = [];
        items.forEach(async (item: tItemTable) => {
            const user = new User({
                id: parseInt(item.employee_id.value),
                name: item.employee_name.value,
                photo: item.employee_photo.value,
                company: item.company_name.value,
                departament: item.departament_name.value,
                shop: item.store_name.value,
                sub: item.sub_dep_name.value
            });
            listUser.push(user);
        })
        setCtlSearchUser(false);
        if (props.onClose) props.onClose(listUser);
    }

    function navPage(isNext: boolean) {
        // Verifica se haverá uma adição ou subtração em relação a página atual.
        const newPage = isNext ? page + 1 : page - 1;
        //Faz o controle do limite da página.
        if (newPage <= limitPage && newPage >= 1) {
            setPage(newPage);
        }
    }
}