import React, { useCallback, useEffect, useMemo, useState } from "react";
import Register from "./Register/Register";
import NavBar from "../../Components/NavBar";
import { listPathEPP } from "./Navigation/Navigation";
import CustomTable from "../../Components/CustomTable";
import { getAllEppOrder } from "./Adapters/Adapters";
import { convertForTable } from "../../Util/Util";
import { listColumnsOcult, renamedColumns } from "./Configuration/Configuration";
import { tItemTable } from "../../types/types";


interface EppTableData {
    order: any;
}

export default function EppMain() {
    const [data, setData] = useState<[]>([]);

    const [selected, setSelected] = useState<tItemTable[]>([]);

    const [modalData, setModalData] = useState<EppTableData | null>(null);
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
              order: orderRes.data || []
            });

          } catch (error) {
            console.error("Erro ao carregar dados:", error);
          } finally {
            setLoading(false);
          }
        };
    
        loadAllData();
      }, []);

     const handleSelect = useCallback(async (item: tItemTable[]) => {
      setSelected(item);
      if(!item || !item[0]?.idOrder?.value) return;
      try {
         setModalData((prev) => prev ? {...prev} : null);
      } catch (error) {
        console.error("Erro ao buscar dados");
      }
     }, [])

     const tableList = useMemo(() => convertForTable(data, {
        ocultColumns: listColumnsOcult,
        customTags: renamedColumns
      }), [data]);

    if (loading) return <div>Carregando...</div>;
    if (!data.length) return <div>Nenhum dado encontrado</div>;

    return (
        <React.Fragment>
            <NavBar list={listPathEPP} />
            <section className="d-flex flex-row w-100 h-100 overflow-hidden">
                <section className="d-flex align-items-center overflow-hidden p-2">
                    <Register apiData={modalData} />
                    <div className="flex-grow-1 h-100 overflow-auto">
                        <CustomTable 
                            list={tableList}
                            onConfirmList={handleSelect}
                            maxSelection={1}
                        />
                    </div>
                </section>
            </section>
        </React.Fragment>
    )
}