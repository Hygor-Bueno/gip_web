import React, { useEffect, useState } from 'react';
import { convertForTable, fetchNodeDataFull, objectForString } from '../../../Util/Util';
import CustomForm from '../../../Components/CustomForm';
import TableComponent from '../../../Components/CustomTable';
import { formSearchUserCFPP } from './Configs';

interface SearchUserCFPPProps {
    // children: React.ReactNode;
    tokenCFPP: string;
    onCallBack: (value?: any) => void;
}

export default function SearchUserCFPP({ tokenCFPP, onCallBack }: SearchUserCFPPProps) {
    const [recordType, setRecordType] = useState<[{ id_record_type: number; description: string; status: number }]>([{ id_record_type: 0, description: '', status: 0 }]);
    const [params, setParams] = useState<{ name?: string, branchCode?: string, costCenterCode?: string, status?: string }>({});
    const [branch, setBranch] = useState<[{ label: string, value: string }]>([{ label: '', value: '' }]);
    const [costCenter, setCostCenter] = useState<[{ label: string, value: string }]>([{ label: '', value: '' }]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [limitPage, setLimitPage] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        (async () => {
            await loadRecordType();
            await loadBranch();
            await loadCostCenter();
        })();
    }, [tokenCFPP]);

    useEffect(() => {
        (async () => {
            await loadEmployees(filter);
        })();
    }, [tokenCFPP, page, filter]);

    async function loadEmployees(params?: string) {
        try {
            if (tokenCFPP) {
                const reqEmployee: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/Employees/employees?page=${page}${params ? '&' + params : ''}`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqEmployee && reqEmployee.error) throw new Error(reqEmployee.message);
                reqEmployee.data && setEmployees(reqEmployee.data);
                reqEmployee.data && setLimitPage(reqEmployee.data[0]['TotalPages']);
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function loadRecordType() {
        try {
            if (tokenCFPP) {
                const reqRecordType: { error: boolean; message?: string; data?: [{ id_record_type: number; description: string; status: number }] } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/TR/recordType`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqRecordType && reqRecordType.error) throw new Error(reqRecordType.message);
                
                reqRecordType.data && setRecordType(reqRecordType.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadBranch() {
        try {
            if (tokenCFPP) {
                const reqBranch: { error: boolean; message?: string; data?: any } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/BCC/branch`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqBranch && reqBranch.error) throw new Error(reqBranch.message);
                reqBranch.data &&
                    setBranch(reqBranch.data.map((branch: any) => ({
                        label: branch.BranchName,
                        value: branch.BranchCode,
                    })));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadCostCenter() {
        try {
            if (tokenCFPP) {
                const reqCostCenter: { error: boolean; message?: string; data?: any } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/BCC/costCenter`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP}` });
                if ('message' in reqCostCenter && reqCostCenter.error) throw new Error(reqCostCenter.message);
                reqCostCenter.data
                    &&
                    setCostCenter(reqCostCenter.data.map((costCenter: any) => ({
                        label: costCenter.CostCenterDescription,
                        value: costCenter.CostCenterCode,
                    })));
            }
        } catch (error) {
            console.error(error);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFilter(objectForString(params, '&'));
        setParams({});
        setPage(1);
    };

    function handleChange(element: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = element.target;
        setParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    function changePage(isNext: boolean) {
        if (isNext) {
            page < limitPage ? setPage(page + 1) : setPage(1);
        } else {
            page > 1 && setPage(page - 1);
        }
    }

    return (
        <React.Fragment>
            <div className='m-2'>
                <CustomForm
                    className='d-flex align-items-end gap-2 mx-2'
                    classButton='btn btn-success'
                    titleButton={"Buscar"}
                    onSubmit={handleSubmit}
                    fieldsets={formSearchUserCFPP({
                        name: params.name || "",
                        branchCode: params.branchCode || "",
                        costCenterCode: params.costCenterCode || "",
                        status: params.status || "",
                        branch: branch,
                        costCenter: costCenter,
                        onAction: handleChange
                    })}
                />
            </div>
            <div className='overflow-auto flex-grow-1'>
                {employees.length > 0 &&
                    <TableComponent
                        maxSelection={1}
                        list={convertForTable(employees, {
                            ocultColumns: ["EmployeeAdmiss", "EmployeeDemiss", "TotalPages", "CurrentPage","CompanyCNPJ"],
                            customTags: {
                                EmployeeID: "Matrícula",
                                EmployeeName: "Nome",
                                CostCenterCode: "C.C",
                                CostCenterDescription: "Descrição (C.C)",
                                BranchCode: "Cód. Filial",
                                BranchName: "Filial",
                                CompanyName: "Companhia"
                            },
                            minWidths: { EmployeeID: '100px', CostCenterCode: '100px', BranchCode: '110px' }
                        })}
                        onConfirmList={(items) => onCallBack(items)}
                    />}
            </div>
            <div className='d-flex align-items-center justify-content-center gap-2 my-2'>
                <button type='button' className='btn btn-danger fa-solid fa-backward' onClick={() => { changePage(false) }}> </button>
                <span className='h5'>{page.toString().padStart(2, '0')} / {limitPage.toString().padStart(2, '0')}</span>
                <button type='button' className='btn btn-success fa-solid fa-forward' onClick={() => { changePage(true) }}></button>
            </div>
        </React.Fragment>
    );
}