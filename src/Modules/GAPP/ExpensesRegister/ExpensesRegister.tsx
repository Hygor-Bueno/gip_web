import React, { useState, useEffect } from "react";
import TableComponent from "../../../Components/CustomTable";
import { convertForTable, convertTime, maskMoney, sortListByKey } from "../../../Util/Util";
import { useConnection } from "../../../Context/ConnContext";
import CustomForm from "../../../Components/CustomForm";
import { customTagsExpense, formExpense, minWidthsExpense } from "./Configuration/ConfigExpensesRegister";
import { IExpensesItem } from "./Interfaces/InterfaceExpensesRegister";
import { useMyContext } from "../../../Context/MainContext";

interface IFormExpenses { date_start: string, date_end: string, license_plates: string, unit_id: string, exp_type_id_fk: string }
const restartForm:IFormExpenses = { date_end: '', date_start: '', license_plates: '', unit_id: '', exp_type_id_fk: '' };
export default function ExpensesRegister(): JSX.Element {

    const { fetchData } = useConnection();
    const [page, setPage] = useState<number>(1);
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
                    await loadUnits();
                    await loadExpensesType();
                } catch (error) {
                    console.error(error)
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
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoading(false);
                }
            }
        )();
    }, [page, urlComplement]);

    async function loadExpenses() {
        try {
            const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/FiltredExpenses.php", urlComplement: `&dashGAPP=1&page_number=${page}${urlComplement ? urlComplement : ''}` });
            if (req.error) throw new Error(req.message);
            setData(req.data.map((item: IExpensesItem): IExpensesItem => maskExpenses(item)));
        } catch (error) {
            console.log(error);
        }
    }

    async function loadUnits() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP/Units.php", urlComplement: `&all=1` });
        if (req.error) throw new Error(req.message);
        setUnitis(sortListByKey(req.data.map((item: any) => { return { label: `${item.fantasy_name} - ${item.unit_name}`, value: item.unit_id } }), "label"));
    }
    async function loadExpensesType() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/ExpensesType.php", urlComplement: `&dashGAPP=1` });
        if (req.error) throw new Error(req.message);
        console.log(req);
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
    }

    function changePage(isSum: boolean) {
        let newPage: number = page;
        newPage = isSum ? newPage + 1 : newPage - 1;
        if (newPage > 0) {
            setPage(newPage);
        }
    }

    async function handleSubmit() {
        let result: string = '';
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
    // <i class="fa-solid fa-magnifying-glass"></i> ||| <i class="fa-solid fa-eraser"></i>

    return (
        <div className="d-flex flex-column align-items-center justify-content-between overflow-hidden text-white w-100" >
            <div className="container">
                <CustomForm notButton={false} className='row' fieldsets={formExpense(units,formData, expensesType, handleChange)} />
                <div className="d-flex gap-2">
                    <button onClick={handleSubmit} className="btn btn-success fa-solid fa-magnifying-glass my-2" type="button" />
                    <button onClick={()=>setFormData(restartForm)} className="btn btn-danger fa-solid fa-eraser my-2" type="button" />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center h-100 w-100 overflow-auto p-2">
                {
                    data.length > 0 &&
                    <TableComponent
                        list={convertForTable(data, {
                            customTags: customTagsExpense,
                            ocultColumns: ["exp_type_id_fk", "vehicle_id", "unit_id"],
                            minWidths: minWidthsExpense
                        })}
                        onConfirmList={(event: any) => console.log(event)}
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