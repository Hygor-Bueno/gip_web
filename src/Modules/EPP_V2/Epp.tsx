import React, { useCallback, useEffect, useMemo, useState } from "react";
import Register from "./Register/Register";
import NavBar from "../../Components/NavBar";
import { listPathEPP } from "./Navigation/Navigation";
import CustomTable from "../../Components/CustomTable";
import { getAllEppOrder } from "./Adapters/Adapters";
import { convertForTable2 } from "../../Util/Util";
import { behaviorColumns, columnSizes, listColumnsOcult, renamedColumns } from "./Configuration/Configuration";
import { tItemTable } from "../../types/types";
import { IOrder } from "./Interfaces/IOrder.interface";
import { EppTableData } from "./Interfaces/General.interfaces";

export default function EppMain() {
    const [data, setData] = useState<IOrder[]>([]);
    const [modalData, setModalData] = useState<EppTableData | null>(null);
    const [selected, setSelected] = useState<tItemTable[]>([]);
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

     const tableList = useMemo(() => convertForTable2(data, {
        ocultColumns: listColumnsOcult,
        customTags: renamedColumns,
        customValue: behaviorColumns,
        minWidths: columnSizes
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