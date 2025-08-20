import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../../Context/MainContext';
import { useCfppContext } from '../Context/CfppContex';
import { convertForTable, fetchNodeDataFull, handleNotification } from '../../../Util/Util';
import CustomForm from '../../../Components/CustomForm';
import TableComponent from '../../../Components/CustomTable';
import { TUrl } from './TypesReportsCFPP';
import { formReports } from './ConfigsReportsCFPP';

const formInitial: TUrl = { pageNumber: 1, pageSize: 10, statusCod: 0, name: '', branch: "", costCenter: '' };
export default function ReportsCFPP(): JSX.Element {
    const [status, setStatus] = useState<any[]>([]);
    const [pageLimit, setPageLimit] = useState<number>(0);
    const [list, setList] = useState<any[]>([]);
    const [urlParam, setUrlParam] = useState<TUrl>(formInitial);
    const { setLoading } = useMyContext();
    const { tokenCFPP, loadTokenCFPP, branch, costCenter } = useCfppContext();
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (tokenCFPP) {
                    const reqStatus: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                        method: 'GET',
                        params: null,
                        pathFile: `/api/GIPP/GET/CFS/status`,
                        port: "5000",
                    }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
                    if ('message' in reqStatus && reqStatus.error) throw new Error(reqStatus.message);
                    if (reqStatus.data) setStatus(reqStatus.data.map(item => { return { label: item.name, value: item.id_status } }));
                }
            } catch (error: any) {
                if (error.message.includes('Invalid or expired token')) {
                    sessionStorage.removeItem('tokenCFPP');
                    await loadTokenCFPP();
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [tokenCFPP]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await reloadList();
            } catch (error: any) {
                if (error.message.includes('Invalid or expired token')) {
                    sessionStorage.removeItem('tokenCFPP');
                    await loadTokenCFPP();
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [tokenCFPP, urlParam['pageNumber']]);

    return (
        <div className="row flex-grow-1 overflow-auto mx-2">
            <div className="col-3 h-100 bg-white p-2 shadow border rounded">
                <div className='d-flex algin-items-center justify-content-between'>
                    <h1><strong>Filtrar marcações</strong></h1>
                    <button type='button' onClick={() => setUrlParam(formInitial)} className='btn btn-danger fas fa-eraser'></button>
                </div>
                <CustomForm
                    classButton="btn btn-success my-4"
                    titleButton="Buscar"
                    onSubmit={handleSubmit}
                    className="row m-0"
                    fieldsets={formReports(changeUrl, urlParam, branch, costCenter, status)}
                />
            </div>
            <div className="col-9 h-100 d-flex flex-column justify-content-between">
                <div className="w-100 overflow-auto">
                    {
                        list.length > 0 &&
                        <TableComponent
                            maxSelection={1}
                            list={convertForTable(list, { ocultColumns: ['totalPages'] })}
                            onConfirmList={(items: any) => {
                                if (items.length > 0) {
                                    console.log(items);
                                }
                            }}
                        />
                    }
                </div>
                <div className='d-flex align-items-center justify-content-center gap-4 my-4'>
                    <button type='button' className='btn btn-danger fa-solid fa-backward' onClick={() => { changePage(false) }}> </button>
                    <span className='h5'>{urlParam['pageNumber'].toString().padStart(2, '0')} / {pageLimit.toString().padStart(2, '0')}</span>
                    <button type='button' className='btn btn-success fa-solid fa-forward' onClick={() => { changePage(true) }}></button>
                </div>
            </div>
        </div>
    );

    function changePage(value: boolean) {
        let newPage = value ? urlParam['pageNumber'] + 1 : urlParam['pageNumber'] - 1;
        if (newPage <= pageLimit && newPage > 0) {
            let newUrlParam = urlParam;
            newUrlParam['pageNumber'] = newPage;
            setUrlParam({ ...newUrlParam });
        }
    }

    function changeUrl(e: any) {
        const { name, value } = e.target;
        setUrlParam(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        try {
            setLoading(true);
            event.preventDefault();
            await reloadList();
            handleNotification("Sucesso!", "Dados encontrados com sucesso", "success");
        } catch (error: any) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    function buildUrl(items: TUrl): string {
        return '?' + (
            //Recupera as craves do objeto Json
            Object.keys(items) as (keyof TUrl)[])
            .filter(key => items[key] !== undefined && items[key] !== null && items[key] !== 0)
            .map(
                //Percorre cada chave do objeto criando um novo array onde cada posição possuí "key=value";
                (key) => `${key}=${items[key]}`
            ).join('&'); // uni as posições do array, trocando a "," por "&"
    }

    async function reloadList() {
        if (tokenCFPP) {
            const reqStatus: { error: boolean; message?: string; data?: any[] } = await fetchNodeDataFull({
                method: 'GET',
                params: null,
                pathFile: `/api/GIPP/GET/TR/trfs`,
                port: "5000",
                urlComplement: buildUrl(urlParam)
            }, { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, compress, br', 'Authorization': `Bearer ${tokenCFPP}` });
            if ('message' in reqStatus && reqStatus.error) throw new Error(reqStatus.message);
            if (reqStatus.data) setList(reqStatus.data);
            if (reqStatus.data && reqStatus.data?.length > 0) setPageLimit(reqStatus.data[0]['totalPages']);
        }
    }
}