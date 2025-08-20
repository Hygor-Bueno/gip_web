import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../../Context/MainContext';
import { convertForTable, convertTime, fetchNodeDataFull, getCurrentDate, handleNotification } from '../../../Util/Util';
import RegisterValidator from '../Class/RegisterValidator';
import SearchUserCFPP from './SearchUserCFPP';
import TableComponent from '../../../Components/CustomTable';
import ListRegister from './ListRegister';
import DetailsTimeRecords from './DetailsTimesRecords';
import { useCfppContext } from '../Context/CfppContex';

export default function TimeRecords() {
    const [listRegister, setListRegister] = useState<{ id_record_type_fk: string; times: string }[]>([]);
    const [date, setDate] = useState<string>('');
    const [hour, setHour] = useState<string>('');
    const [typeRecord, setTypeRecord] = useState<string>('');
    const [timeRecords, setTimeRecords] = useState<any[]>([]);
    const [recordType, setRecordType] = useState<any[]>([]);
    const [openSelectEmployee, setOpenSelectEmployee] = useState<boolean>(false);
    const [onDetailsTimesRecords, setOnDetailsTimesRecords] = useState<string>('');
    const { tokenCFPP, loadTokenCFPP } = useCfppContext();
    const [employee, setEmployee] = useState<{ EmployeeID: string, EmployeeName: string, CostCenterDescription: string, BranchName: string, BranchCode: string }>({ EmployeeID: '', EmployeeName: '', CostCenterDescription: '', BranchName: '', BranchCode: '' });
    const { setLoading } = useMyContext();
    const list: { classItem: string, textLabel: string, textValue: string, disabled: boolean, typeInput: string, onAction?: (value: any) => void, max?: string }[] = [
        { classItem: 'col-2 d-flex flex-column justify-content-end', textLabel: 'Matrícula', textValue: employee.EmployeeID, disabled: true, typeInput: 'text' },
        { classItem: 'col-3 d-flex flex-column justify-content-end', textLabel: 'Nome', textValue: employee.EmployeeName, disabled: true, typeInput: 'text' },
        { classItem: 'col-2 d-flex flex-column justify-content-end', textLabel: 'C.C.', textValue: employee.CostCenterDescription, disabled: true, typeInput: 'text' },
        { classItem: 'col-3 d-flex flex-column justify-content-end', textLabel: 'Filial', textValue: employee.BranchName, disabled: true, typeInput: 'text' },
        { classItem: 'col-2 d-flex flex-column justify-content-end', textLabel: 'Data', textValue: date, disabled: false, typeInput: 'date', max: getCurrentDate(), onAction: (element: React.ChangeEvent<HTMLInputElement>) => setDate(element.target.value) },
        { classItem: 'col-2 d-flex flex-column justify-content-end', textLabel: 'Hora', textValue: hour, disabled: false, typeInput: 'time', onAction: (element: React.ChangeEvent<HTMLInputElement>) => setHour(element.target.value) },
    ];
    useEffect(() => {
        (async () => {
            await loadTimeRecords();
            await loadRecordType();
        })();
    }, [tokenCFPP]);

    async function loadRecordType() {
        try {
            if (tokenCFPP) {
                const reqRecordType: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/TR/recordType`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqRecordType && reqRecordType.error) throw new Error(reqRecordType.message);
                reqRecordType.data && setRecordType(reqRecordType.data);
            }
        } catch (error: any) {
            if (error.message.includes('Invalid or expired token')) {
                sessionStorage.removeItem('tokenCFPP');
                await loadTokenCFPP();
            }
            console.error(error);
        }
    }

    async function loadTimeRecords() {
        try {
            if (tokenCFPP) {
                const reqTimeRecords: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/TR/timeRecords`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqTimeRecords && reqTimeRecords.error) throw new Error(reqTimeRecords.message);
                reqTimeRecords.data && setTimeRecords(reqTimeRecords.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function insertRegister(typeRecord: string, times: string) {
        let data;
        try {
            const params = {
                employee_id: employee.EmployeeID,
                id_record_type_fk: typeRecord,
                branch_time_record: employee.BranchCode,
                times: times
            }
            data = await fetchNodeDataFull({
                method: 'POST',
                params: params,
                pathFile: '/api/GIPP/POST/TR',
                port: "5000",
            }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
            if (data.error) throw new Error(data.message);
        } catch (error) {
            console.error(error);
        } finally {
            return data
        }
    }
    function handlerSelectEmployee(value?: any) {
        value && handlerEmployee(value);
        setOpenSelectEmployee(!openSelectEmployee);
    }

    function handlerEmployee(objects: any[]) {
        objects.forEach(object => {
            setEmployee({
                EmployeeID: object.EmployeeID.value,
                EmployeeName: object.EmployeeName.value,
                CostCenterDescription: object.CostCenterDescription.value,
                BranchName: object.BranchName.value,
                BranchCode: object.BranchCode.value
            });
        })
    }

    function handleAddItem() {
        try {
            const item = {
                id_record_type_fk: typeRecord,
                times: `${date} ${hour}`
            }
            if (!typeRecord || !date || !hour) throw new Error('O campo data, hora e lançameto precisam ser preenchidos!');
            RegisterValidator.isValidToAdd(listRegister, item);
            setListRegister(prevList => [...prevList, item]);
        } catch (error: any) {
            handleNotification("Atenção!", error.message, "danger");
        }
    }

    async function register() {
        try {
            setLoading(true);
            let list: {
                id_record_type_fk: string;
                times: string;
            }[] = [];
            if (listRegister.length > 0) {
                list = listRegister;
            } else {
                if (!typeRecord || !date || !hour) throw new Error('O campo data, hora e lançameto precisam ser preenchidos!');
                list = [{ id_record_type_fk: typeRecord, times: `${date} ${hour}` }];
            }
            for await (const element of list) {
                const data = await insertRegister(element.id_record_type_fk, element.times);
                if (data?.error) throw new Error(data.message);
            }
            await loadTimeRecords();
            cleanAll();
        } catch (error:any) {
            handleNotification('Falha!',error.message.toString(),'danger');
        } finally {
            setLoading(false);
        }
    }

    function cleanAll() {
        setListRegister([]);
        setDate('');
        setHour('');
        setTypeRecord('');
        setEmployee({ EmployeeID: '', EmployeeName: '', CostCenterDescription: '', BranchName: '', BranchCode: '' });
    }

    return (
        <React.Fragment>
            <div>
                {
                    openSelectEmployee &&
                    <div style={{ zIndex: '1' }} className='position-absolute d-flex flex-column justify-content-between h-100 w-100 top-0 start-0 bg-white py-2 overflow-hidden'>
                        <SearchUserCFPP onCallBack={handlerSelectEmployee} tokenCFPP={tokenCFPP} />
                    </div>
                }
                <button type='button' title='Selecionar Colaborador' onClick={() => handlerSelectEmployee()} className='btn btn-light fa-solid fa-square-plus mx-2' />
                <div className='row ps-2 w-100'>
                    {
                        list.map((item, index) => <ItemSeachCFPP key={`ItemSeachCFPP_${index}`} {...item} />)
                    }
                    {
                        onDetailsTimesRecords != '' && <DetailsTimeRecords journeyCode={onDetailsTimesRecords} onClose={async () => {setOnDetailsTimesRecords(''); await loadTimeRecords()}} />
                    }
                    <div className='col-3'>
                        <label className='form-check-label'>Tipo de lançamento:</label>
                        <select value={typeRecord} onChange={(element: React.ChangeEvent<HTMLSelectElement>) => setTypeRecord(element.target.value)} id='id_record_type_fk' className='form-control'>
                            <option value='' hidden></option>
                            {recordType.map(record => <option key={`op_${record.id_record_type}`} value={record.id_record_type}>{record.description}</option>)}
                        </select>
                    </div>
                    <div className='d-flex col-1 align-items-end'>
                        <button type='button' className='btn btn-primary me-2' onClick={async () => {
                            handleAddItem();
                        }}>+</button>
                    </div>
                    <div className='d-flex col-2 align-items-end gap-2'>
                        <button type='button' className='btn btn-success' onClick={async () => await register()}>Registrar</button>
                        <button type='button' className='btn btn-danger' onClick={() => { cleanAll() }}>Limpar</button>
                    </div>
                </div>
                <div className='container-fluid my-2'>
                    <ListRegister listRegister={listRegister} setListRegister={setListRegister} />
                </div>
            </div>
            <div className='w-100 overflow-auto'>
                {
                    timeRecords.length > 0 &&
                    <TableComponent
                        maxSelection={1}
                        list={convertForTable(timeRecords, { ocultColumns: ['totalPages'] })}
                        onConfirmList={(item) => { setOnDetailsTimesRecords(item[0]['Jornada']['value']); }}
                    />
                }
            </div>
        </React.Fragment>
    )
}

function ItemSeachCFPP(props: { classItem: string, textLabel: string, textValue: string, disabled: boolean, typeInput: string, onAction?: (value: any) => void, max?: string }) {
    return (
        <div className={props.classItem}>
            <label className='form-check-label'>{props.textLabel}:</label>
            <input onChange={(e: any) => {
                if (props.onAction) {
                    props.onAction(e);
                }
            }} value={props.textValue} max={props.max} disabled={props.disabled} type={props.typeInput} className='form-control' />
        </div>
    )
}