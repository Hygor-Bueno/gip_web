import React, { useEffect, useState } from "react";
import { convertForTable, fetchNodeDataFull, handleNotification } from "../../../Util/Util";
import TableComponent from "../../../Components/CustomTable";
import DetailsTimeRecords from "./DetailsTimesRecords";
import { useCfppContext } from "../Context/CfppContex";

const customTags = {
    registration: "Matrícula",
    collaborator: "Colaborador",
    month_salary: "Sal. mensal",
    branch_desc: "Filial",
    total_hours: "H. totais",
    normal_hour: "H. normal",
    extra_hour: "H. extra",
    night_hour: "H. noturna",
    normal_payment: "H. Normal R$",
    extra_hour_payment: "H. Extra R$",
    night_bonus_payment: "Noturno R$",
    total_payment: "Total R$",
    cod_work_schedule_fk: "Cód. Jornada"
}

export default function Calculation() {
    const [payments, setPayments] = useState<any[]>([]);
    const [journeyCode, setJourneyCode] = useState<any[]>([]);
    const [controller, setController] = useState<0 | 1 | 2 | 3>(0);
    const { tokenCFPP, loadTokenCFPP } = useCfppContext();

    useEffect(() => {
        (async () => {
            await loadPayments();
        })();
    }, [tokenCFPP, journeyCode]);

    async function loadPayments() {
        try {
            if (tokenCFPP) {
                const reqPayment: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/TR/payment`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqPayment && reqPayment.error) throw new Error(reqPayment.message);
                if (reqPayment.data) setPayments(reqPayment.data);
            }
        } catch (error: any) {
            if (error.message.includes('Invalid or expired token')) {
                sessionStorage.removeItem('tokenCFPP');
                await loadTokenCFPP();
            }
            console.error(error);
        }
    }
    async function insertRegister() {
        let data;
        try {
            const params = {
                codWorkSchedules: journeyCode
            }
            data = await fetchNodeDataFull({
                method: 'POST',
                params: params,
                pathFile: '/api/GIPP/POST/payments',
                port: "5000",
            }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
            if (data.error) throw new Error(data.message);
            setJourneyCode([]);
            setController(0);
            handleNotification('Sucesso', data.message || 'Sucesso!', "success");
            await loadPayments();
        } catch (error) {
            console.error(error);
        } finally {
            return data
        }
    }

    return (
        <React.Fragment>
            <div className="flex-grow-1 overflow-hidden">
                {controller == 1 && <ControllerRegister changeController={changeController} onClose={() => {
                    setJourneyCode([]);
                    setController(0);
                }} />}
                {controller == 3 && <DetailsTimeRecords onClose={() => { setJourneyCode([]); setController(0) }} journeyCode={journeyCode[0]} />}
                {
                    (controller == 2 || journeyCode.length > 1) &&
                    <div className="d-flex align-items-center justify-content-center bg-dark bg-opacity-25 position-absolute z-1 start-0 top-0 h-100 w-100  overflow-hidden">
                        <div className="d-flex flex-column bg-white p-2 rounded col-10 h-75">
                            <h1>Deseja encerrar as marcações selecionadas? </h1>
                            <div className="flex-grow-1 overflow-auto">
                                <TableComponent
                                    hiddenButton={true}
                                    list={
                                        convertForTable(
                                            payments.filter(payment => journeyCode.includes(payment["cod_work_schedule_fk"])), {
                                            ocultColumns: ['cod_work_schedule_fk', 'month_salary', 'total_hours', 'normal_hour', 'extra_hour', 'night_hour', 'registration'],
                                            customTags
                                        }
                                        )
                                    }
                                    onConfirmList={(items: any) => {
                                        if (items.length > 0) {
                                            console.log(items);
                                        }
                                    }}
                                />
                            </div>
                            <div className="d-flex justify-content-around p-2">
                                <button onClick={async () => {
                                    if (window.confirm("Deseje realmente encerrar as marcações?")) {
                                        await insertRegister();
                                    }
                                }
                                } type="button" className="btn btn-success">Finalizar</button>
                                <button onClick={() => {
                                    setController(0); setJourneyCode([])
                                }} type="button" className="btn btn-danger">Fechar</button>
                            </div>
                        </div>
                    </div>
                }
                <h1>Página para calcular a Hora!</h1>
                <div className="my-4 h-75">
                    {payments.length > 0 &&
                        <TableComponent
                            list={convertForTable(payments, {
                                customTags
                            })}
                            onConfirmList={(items: any) => {
                                if (items.length > 0) {
                                    setJourneyCode(items.map((item: any) => item["cod_work_schedule_fk"]["value"]));
                                    changeController(items.length > 1 ? 2 : 1);
                                }
                            }}
                        />
                    }
                </div>
            </div>
        </React.Fragment>
    )
    function changeController(value: 1 | 2 | 3) {
        setController(value);
    }
}

function ControllerRegister({ changeController, onClose }: { changeController: (value: 2 | 3) => void, onClose: () => void }) {
    return (
        <div className="d-flex align-items-center justify-content-center bg-dark bg-opacity-25 position-absolute z-1 start-0 top-0 h-100 w-100  overflow-hidden">
            <div className="d-flex flex-column bg-white p-2 rounded">
                <div id="controllerRegister" className="d-flex flex-column align-items-center  ">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <h1>O que você deseja Fazer?</h1>
                        <button type="button" onClick={()=>onClose()} className="btn btn-danger">X</button>
                    </div>
                    <div className="d-flex m-4 gap-2">
                        <button type="button" onClick={() => changeController(2)} className="btn btn-secondary">Encerrar marcação</button>
                        <button type="button" onClick={() => changeController(3)} className="btn btn-secondary">Ajustar Marcação</button>
                    </div>
                </div>
            </div>
        </div >
    )
}

