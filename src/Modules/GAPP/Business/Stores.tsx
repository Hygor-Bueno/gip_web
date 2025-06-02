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
   
    const { setLoading, setTitleHead } = useMyContext();

    const connectionBusinessGeneric = async (
        status: "0" | "1",
        setData: (data: any) => void
    ) => {
        setLoading(true);
        const response = await new Connection("18");
        const data: any = await response.get(`&status_store=${status}`, 'GAPP/Store.php');
        setData(data.data);
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
        <div className="d-flex w-100 flex-grow-1 overflow-hidden">
            <NavBar list={listPathGAPP} />
            <div className="d-flex h-100 w-100">
                <div className={`d-flex flex-column col-12 p-2`}>
                    <Form
                        handleFunction={[
                            (value: string) => setData(x => ({ ...x, cnpj: value })),
                            (value: string) => setData(x => ({ ...x, name: value })),
                            (value: string) => setData(x => ({ ...x, street: value })),
                            (value: string) => setData(x => ({ ...x, district: value })),
                            (value: string) => setData(x => ({ ...x, city: value })),
                            (value: string) => setData(x => ({ ...x, state: value })),
                            (value: string) => setData(x => ({ ...x, number: value })),
                            (value: string) => setData(x => ({ ...x, zip_code: value })),
                            (value: string) => setData(x => ({ ...x, complement: value })),
                            (value: number) => setData(x => ({ ...x, store_visible: value })),
                        ]}
                        resetDataStore={resetStore}
                        resetForm={resetForm}
                        data={data}
                        setData={setData}
                    />
                    <div className='col-12 overflow-auto h-75'>
                        {dataStore.length > 0 &&
                            <TableComponent
                                maxSelection={1}
                                list={convertForTable(dataStore,
                                    {
                                        ocultColumns: ["store_id","status_store"],
                                        customTags:{
                                            cnpj:"CNPJ",
                                            name:"Nome",
                                            street:"Rua",
                                            district:"Bairro",
                                            city:"Cidade",
                                            state:"Estado",
                                            number:"Número",
                                            zip_code:"CEP",
                                            complement:"Complemento"
                                        }
                                    }
                                )}
                                onConfirmList={(e) => console.log(e)}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Stores;