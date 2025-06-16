import React, { useState, useEffect } from "react";
import TableComponent from "../../../Components/CustomTable";
import { convertForTable, convertTime, maskMoney, sortListByKey } from "../../../Util/Util";
import { useConnection } from "../../../Context/ConnContext";
import CustomForm from "../../../Components/CustomForm";
import { customTagsExpense, formExpense, minWidthsExpense } from "./Configuration/ConfigExpensesRegister";
import { IExpensesItem } from "./Interfaces/InterfaceExpensesRegister";


export default function ExpensesRegister(): JSX.Element {

    const { fetchData } = useConnection();
    const [data, setData] = useState<[]>([]);
    const [units, setUnitis] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
    const [expensesType, setExpensesType] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
    useEffect(() => {
        (
            async () => {
                try {
                    await loadExpenses();
                    await loadUnits();
                    await loadExpensesType();
                } catch (error) {
                    console.error(error)
                }
            }
        )();
    }, []);

    async function loadExpenses() {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/FiltredExpenses.php", urlComplement: `&dashGAPP=1` });
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

    return (
        <div className="d-flex flex-column align-items-center overflow-hidden text-white w-100" >
            <div className="container">
                <CustomForm notButton={false} className='row' fieldsets={formExpense(units,expensesType)} />
            </div>
            <div className="d-flex flex-column align-items-center w-100 overflow-auto p-2">
                {data.length > 0 &&
                    <TableComponent
                        list={convertForTable(data, {
                            customTags: customTagsExpense,
                            ocultColumns: ["exp_type_id_fk", "vehicle_id", "unit_id"],
                            minWidths: minWidthsExpense
                        })}
                        onConfirmList={(event: any) => console.log(event)}
                    />}
            </div>
        </div>
    );
}