import React, { useState, useEffect } from "react";
import CustomTable from "../../../Components/CustomTable";
import { convertForTable, convertTime, maskMoney, sortListByKey } from "../../../Util/Util";
import { useConnection } from "../../../Context/ConnContext";
import CustomForm from "../../../Components/CustomForm";
import { customTagsExpense, formExpense, minWidthsExpense } from "./Configuration/ConfigExpensesRegister";
import { IExpensesItem } from "./Interfaces/InterfaceExpensesRegister";
import { useMyContext } from "../../../Context/MainContext";

interface IFormExpenses { date_start: string, date_end: string, license_plates: string, unit_id: string, exp_type_id_fk: string }
const restartForm: IFormExpenses = { date_end: '', date_start: '', license_plates: '', unit_id: '', exp_type_id_fk: '' };
export default function ExpensesRegister(): JSX.Element {

    const { fetchData } = useConnection();
    const [page, setPage] = useState<number>(1);
    const [editExpenses, setEditExpenses] = useState<number>(0);
    const [urlComplement, setUrlComplement] = useState<string>('');
    const [data, setData] = useState<[]>([]);
    const [formData, setFormData] = useState<IFormExpenses>(restartForm);
    const [units, setUnitis] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
    const [expensesType, setExpensesType] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
    const { setLoading } = useMyContext();

    useEffect(() => {
        (
            async () => {
                try {
                    setLoading(true);
                    await loadUnits();
                    await loadExpensesType();
                    handleUrl();
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoading(false);
                }
            }
        )();
    }, []);

    useEffect(() => {
        (
            async () => {
                try {
                    setLoading(true);
                    await loadExpenses();
                } catch (error: any) {
                    console.error(error)
                } finally {
                    setLoading(false);
                }
            }
        )();
    }, [urlComplement]);

    async function loadExpenses() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/FiltredExpenses.php", urlComplement: `${urlComplement ? urlComplement : ''}` });
        if (req.error && req.message.toUpperCase().includes("NO DATA") && page > 1) handleUrl(page - 1);
        if (req.error) throw new Error(req.message);
        setData(req.data.map((item: IExpensesItem): IExpensesItem => maskExpenses(item)));
    }

    async function loadUnits() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP/Units.php", urlComplement: `&all=1` });
        if (req.error) throw new Error(req.message);
        setUnitis(sortListByKey(req.data.map((item: any) => { return { label: `${item.fantasy_name} - ${item.unit_name}`, value: item.unit_id } }), "label"));
    }

    async function loadExpensesType() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/ExpensesType.php", urlComplement: `&dashGAPP=1` });
        if (req.error) throw new Error(req.message);
        setExpensesType(sortListByKey(req.data.map((item: any) => { return { label: item.description_type, value: item.exp_type_id } }), "label"));
    }

    function maskExpenses(item: IExpensesItem): IExpensesItem {
        return {
            expen_id: item.expen_id,
            date: convertTime(item.date, true),
            hour: item.hour,
            description: item.description,
            discount: maskMoney(item.discount),
            total_value: maskMoney(item.total_value),
            exp_type_id_fk: item.exp_type_id_fk,
            description_type: item.description_type,
            vehicle_id: item.vehicle_id,
            license_plates: item.license_plates,
            unit_id: item.unit_id,
            unit_name: item.unit_name
        }
    };

    function changePage(isSum: boolean) {
        let newPage: number = page;
        newPage = isSum ? newPage + 1 : newPage - 1;
        if (newPage > 0) {
            setPage(newPage);
        }
        handleUrl(newPage);
    };

    async function handleUrl(newPage: number = 1) {
        setPage(newPage);
        let result: string = `&dashGAPP=1&page_number=${newPage}`;
        Object.keys(formData).forEach((item) => {
            const key = item as keyof IFormExpenses;
            if (formData[key]) result += `&${key}=${formData[key]}`;
        });
        setUrlComplement(result);
    };

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target;
        setFormData((prevParams: IFormExpenses) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-between overflow-hidden text-white w-100" >
            <div className="container">
                {editExpenses ? <EditExpenses expen_id={editExpenses} onClose={() => setEditExpenses(0)} />:<React.Fragment />}
                <CustomForm
                    onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault(); // ← impede o recarregamento da página
                        handleUrl();
                    }}
                    notButton={false} className='row' fieldsets={formExpense(units, formData, expensesType, handleChange)} />

                <div className="d-flex gap-2">
                    <button onClick={() => handleUrl()} className="btn btn-success fa-solid fa-magnifying-glass my-2" type="button" />
                    <button onClick={() => { setFormData(restartForm); setPage(1) }} className="btn btn-danger fa-solid fa-eraser my-2" type="button" />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center h-100 w-100 overflow-auto p-2">
                {
                    data.length > 0 &&
                    <CustomTable
                        maxSelection={1}
                        list={convertForTable(data, {
                            customTags: customTagsExpense,
                            ocultColumns: ["exp_type_id_fk", "vehicle_id", "unit_id"],
                            minWidths: minWidthsExpense
                        })}
                        onConfirmList={(event: any) => setEditExpenses(event[0].expen_id.value)}
                    />
                }
            </div>
            <div className="d-flex my-2 gap-4">
                <button onClick={() => changePage(false)} type="button" className="btn btn-success fa-solid fa-chevron-left" />
                <strong className="text-dark">{page.toString().padStart(2, '0')}</strong>
                <button onClick={() => changePage(true)} type="button" className="btn btn-danger fa-solid fa-chevron-right" />
            </div>
        </div>
    );
}
interface IEditExpenses { expen_id: number, onClose: () => void }
function EditExpenses(props: IEditExpenses): JSX.Element {
    return (
        <div className="d-flex align-items-center justify-content-center position-absolute start-0 top-0 z-3 vw-100 vh-100 bg-dark bg-opacity-25">
            <div className="bg-white rounded p-2">
                <div className="d-flex justify-content-end w-100">
                    <button className="btn btn-danger" onClick={props.onClose}> X </button>
                </div>
                <p className="text-black">Item: {props.expen_id}</p>
            </div>
        </div>
    );
}