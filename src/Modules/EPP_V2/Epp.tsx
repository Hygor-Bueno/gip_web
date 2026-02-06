import React, { useEffect, useMemo, useState } from "react";
import Register from "./Register/Register";
import NavBar from "../../Components/NavBar";
import { listPathEPP } from "./Navigation/Navigation";
import CustomTable from "../../Components/CustomTable";
import { getAllEppOrder } from "./Adapters/Adapters";
import { convertForTable } from "../../Util/Util";
import { listColumnsOcult, renamedColumns } from "./Configuration/Configuration";


interface EppTableData {
    order: any;
}

export default function EppMain() {
    const [data, setData] = useState<[]>([]);
    const [modalData, setModalData] = useState<EppTableData | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAllData = async () => {
          setLoading(true);
          try {
            const [
              orderRes
            ] = await Promise.all([
              getAllEppOrder()
            ]);
    
            if (orderRes.error) throw new Error(orderRes.message);
    
            setData(orderRes.data || []);

            setModalData({
              order: {}
            });

          } catch (error) {
            console.error("Erro ao carregar dados:", error);
          } finally {
            setLoading(false);
          }
        };
    
        loadAllData();
      }, []);

      function handleClickTable(select: any) {
        console.log(select);
        setOpenModal(true);
      }

     const tableList = useMemo(() => convertForTable(data, {
        ocultColumns: listColumnsOcult,
        customTags: renamedColumns
      }), [data]);

    if (loading) return <div>Carregando...</div>;
    if (!data.length) return <div>Nenhum dado encontrado</div>;

    return (
        <React.Fragment>
            <NavBar list={listPathEPP} />
            <section className="w-100">
                <header className="w-100 p-2 d-flex align-items-center justify-content-between">
                    <div className="">
                        <label>Código do pedido</label>
                        <input type="number" name="" id="" className="form-control"/>
                    </div>
                    <button className="btn color-gipp" onClick={() => setOpenModal(true)}>
                        <i className="fa fa-solid fa-plus text-white"></i>
                    </button>
                </header>
                <section className="mt-2 border border-gray p-2">
                    {openModal && <div>
                        <Register setOpenRegister={setOpenModal} />
                    </div>}
                    <div className="table-epp-default">
                        <CustomTable 
                            list={tableList}
                            onConfirmList={handleClickTable}
                            maxSelection={1}
                        />
                    </div>
                </section>
            </section>
        </React.Fragment>
    )
}