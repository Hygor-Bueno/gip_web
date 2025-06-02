import React, { useState, useEffect } from 'react';
import Form from './Component/Form/Form';
import NavBar from '../../../Components/NavBar';
import { Connection } from '../../../Connection/Connection';
import { IFormData, IFormGender } from './Interfaces/IFormGender';
import { useMyContext } from '../../../Context/MainContext';
import { listPathGAPP } from '../ConfigGapp';
import TableComponent from '../../../Components/CustomTable';
import { convertForTable } from '../../../Util/Util';
const Stores: React.FC = () => {
    const [data, setData] = useState<IFormGender>({
        cnpj: "",
        name: "",
        street: "",
        district: "",
        city: "",
        state: "",
        number: "",
        zip_code: "",
        complement: "",
        status_store: 1,
    });
    const [dataStore, setDataStore] = useState<IFormData[]>([]);
    const [openMenu, setOpenMenu] = useState<any>(true);
    const [openForm, setOpenForm] = useState<any>(true);
    const { setLoading, setTitleHead } = useMyContext();

    const connectionBusinessGeneric = async (
        status: "0" | "1",
        setData: (data: any) => void
    ) => {
        setLoading(true);
        const response = await new Connection("18");
        const data: any = await response.get(`&status_store=${status}`, 'GAPP/Store.php');
        setDataStore(data.data);
        setLoading(false);
    };

    useEffect(() => {
        connectionBusinessGeneric("1", setDataStore);
    }, []);

    useEffect(() => {
        setTitleHead({
            title: "Cadastrar Empresas - GAPP",
            simpleTitle: "GAPP",
            icon: "fa fa-shop",
        });
    }, []);

    function resetStore() {
        setDataStore([]);
        connectionBusinessGeneric("1", setDataStore);
    }
    const resetForm = () => {
        setData({
            cnpj: "",
            name: "",
            street: "",
            district: "",
            city: "",
            state: "",
            number: "",
            zip_code: "",
            complement: "",
            status_store: 1,
        });
    };
    return (
        <React.Fragment>
            {openMenu && <NavBar list={listPathGAPP} />}
            <div className="d-flex flex-column overflow-hidden" style={{ height: 'calc(100vh - 50px)' }}>
                <div className="p-2 d-flex flex-column h-100">
                    <div className="container">
                        <div className='d-flex justify-content-end w-100 gap-3'>
                            <button title={openMenu ? "Ocultar menu" : "Exibir Menu"} onClick={() => setOpenMenu(!openMenu)} className={`btn p-0 d-block d-lg-none`} >
                                <i className={`fa-solid fa-eye${openMenu ? "-slash" : ''}`}></i>
                            </button>
                            <button title={openForm ? "Ocultar menu" : "Exibir Menu"} onClick={() => setOpenForm(!openForm)} className={`btn p-0 d-block d-lg-none`} >
                                <i className={`fa-solid fa-caret${openForm ? "-down" : '-up'}`}></i>
                            </button>
                        </div>
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
                                resetForm={resetForm}
                                data={data}
                                setData={setData}
                            />}
                    </div>

                    <div className="d-sm-flex py-2 w-100 overflow-auto">
                        {dataStore.length > 0 && (
                            <TableComponent
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
export default Stores;