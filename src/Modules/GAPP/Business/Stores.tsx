import React, { useState, useEffect } from 'react';
import Form from './Component/Form/Form';
import NavBar from '../../../Components/NavBar';
import { Connection } from '../../../Connection/Connection';
import { IFormData, IFormGender } from './Interfaces/IFormGender';
import { useMyContext } from '../../../Context/MainContext';
import { listPathGAPP } from '../ConfigGapp';
import CustomTable from '../../../Components/CustomTable';
import { convertForTable, handleNotification } from '../../../Util/Util';
import { iPropsInputCheckButton } from '../../../Interface/iGTPP';
import { InputCheckButton } from '../../../Components/CustomButton';
import { useConnection } from '../../../Context/ConnContext';

const initialForms: IFormGender = {
    cnpj: "",
    name: "",
    street: "",
    district: "",
    city: "",
    state: "",
    number: "",
    zip_code: "",
    complement: "",
    status_store: 1
};
export default function Stores(): JSX.Element {
    const [data, setData] = useState<IFormGender>(initialForms);
    const [dataStore, setDataStore] = useState<IFormData[]>([]);
    const [openMenu, setOpenMenu] = useState<any>(true);
    const [openForm, setOpenForm] = useState<any>(true);
    const [openTrash, setOpenTrash] = useState<any>(false);
    const [openModal, setOpenModal] = useState<any>(false);
    const { setLoading, setTitleHead } = useMyContext();
    const { fetchData } = useConnection();

    const listButtonInputs: iPropsInputCheckButton[] = [
        { inputId: `gapp_check_store_form`, nameButton: "Exibir/Ocultar Menu", onAction: async (event: boolean) => setOpenMenu(!event), labelIconConditional: ["fa-solid fa-eye", "fa-solid fa-eye-slash"] },
        { inputId: `gapp_exp_ret_form`, nameButton: "Exibir/Ocultar formulário", onAction: (event) => setOpenForm(!event), labelIconConditional: ["fa-solid fa-chevron-down", "fa-solid fa-chevron-up"] },
        { inputId: `gapp_check_store_table`, nameButton: "Itens excluídos", onAction: async (event: boolean) => setOpenTrash(event), labelIcon: "fa-solid fa-trash", highlight: true },
    ];

    async function connectionBusinessGeneric(status: "0" | "1") {
        try {
            setLoading(true);
            const response: any = await fetchData({method:"GET", params: null, pathFile: "GAPP/Store.php", urlComplement: `&status_store=${status}`, exception: ["no data"]});
            if (response.error) throw new Error(response.message);
            setDataStore(response.data);
        } catch (error: any) {
            setDataStore([]);
            handleNotification("Erro!", error.message, "danger");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        setTitleHead({
            title: "Cadastrar Empresas - GAPP",
            simpleTitle: "GAPP - Empresas",
            icon: "fa fa-shop",
        });
        connectionBusinessGeneric(openTrash ? "0" : "1");
    }, [openTrash]);

    function resetStore() {
        setDataStore([]);
        connectionBusinessGeneric("1");
    }

    return (
        <React.Fragment>
            {openMenu && <NavBar list={listPathGAPP} />}
            <ControlItem item={data} isOpent={openModal} onClean={() => setData(initialForms)} onClose={() => setOpenModal(false)} onReloadList={async ()=> await connectionBusinessGeneric(openTrash ? "0" : "1")}/>
            <div className="d-flex flex-column overflow-hidden w-100" style={{ height: 'calc(100vh - 50px)' }}>
                <div className="p-2 d-flex flex-column h-100">
                    <div className='d-flex justify-content-end w-100 gap-2'>
                        {listButtonInputs.map((button, index) => <InputCheckButton key={`btn_header_table_gapp_${index}`} {...button} />)}
                    </div>
                    <div className="container">
                        {openForm &&
                            <Form
                                handleFunction={[
                                    (value: string) => setData((x) => ({ ...x, cnpj: value })),
                                    (value: string) => setData((x) => ({ ...x, name: value })),
                                    (value: string) => setData((x) => ({ ...x, street: value })),
                                    (value: string) => setData((x) => ({ ...x, district: value })),
                                    (value: string) => setData((x) => ({ ...x, city: value })),
                                    (value: string) => setData((x) => ({ ...x, state: value })),
                                    (value: string) => setData((x) => ({ ...x, number: value })),
                                    (value: string) => setData((x) => ({ ...x, zip_code: value })),
                                    (value: string) => setData((x) => ({ ...x, complement: value })),
                                    (value: number) => setData((x) => ({ ...x, store_visible: value })),
                                ]}
                                resetDataStore={resetStore}
                                resetForm={() => setData(initialForms)}
                                data={data}
                                setData={setData}
                            />}
                    </div>
                    <div className="d-sm-flex flex-column py-2 w-100 overflow-auto">
                        {dataStore.length > 0 && (
                            <CustomTable
                                maxSelection={1}
                                list={convertForTable(dataStore, {
                                    ocultColumns: ["store_id", "status_store"],
                                    customTags: {
                                        cnpj: "CNPJ",
                                        name: "Nome",
                                        street: "Rua",
                                        district: "Bairro",
                                        city: "Cidade",
                                        state: "Estado",
                                        number: "Número",
                                        zip_code: "CEP",
                                        complement: "Complemento",
                                    },
                                })}
                                onConfirmList={(e) => {
                                    setOpenModal(true);
                                    let response: any = {};
                                    Object.keys(e[0]).forEach((item) => {
                                        response[item] = e[0][item].value;
                                    });
                                    setData(response);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

interface IPropsControlItem {
    isOpent: boolean;
    onClose: () => void;
    onClean: () => void;
    onReloadList:()=> Promise<void>;
    item: IFormData;
}
function ControlItem(props: IPropsControlItem): JSX.Element {
    const { setLoading } = useMyContext();
    const { fetchData } = useConnection();

    async function changeStatusStore() {
        try {
            setLoading(true);
            const payload: IFormData = { ...props.item };
            payload.status_store = payload.status_store == 1 ? 0 : 1;
            const result: any = await fetchData({method:"PUT", params: payload, pathFile: "GAPP/Store.php", urlComplement: '', exception: ["no data"]});
            if (result.error) throw new Error(result.message);
            props.onClean();
            props.onClose();
            await props.onReloadList();
        } catch (error: any) {
            handleNotification("Erro", error.toString(), "danger");
        } finally {
            setLoading(false);
        }
    };
    return (
        props.isOpent ?
            <div className='d-flex align-items-center justify-content-center position-absolute bg-dark bg-opacity-25 top-0 start-0 w-100 h-100 z-3 overflow-hidden p-4'>
                <div className='bg-white p-2 rounded mh-100 mw-100 overflow-auto'>
                    <div className='d-flex align-items-center gap-4'>
                        <h1>O que deseja fazer ?</h1>
                        <button onClick={() => { props.onClose(); props.onClean() }} type='button' className='btn btn-danger fa-solid fa-xmark' title='Fechar Janela' />
                    </div>
                    <div className='d-flex alin-items-center justify-content-around w-100 mt-4'>
                        {props.item.status_store == 1 && <button onClick={props.onClose} type='button' className='btn btn-secondary' title='Alterar item'>Editar</button>}
                        <button onClick={async () => await changeStatusStore()} type='button' className='btn btn-secondary' title='Inativar item'>{props.item.status_store == 1 ? "Inativa" : "Ativar"}</button>
                    </div>
                </div>
            </div>
            :
            <React.Fragment />
    )
}