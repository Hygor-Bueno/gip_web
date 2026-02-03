import React, { useEffect, useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import { ActiveData, ActiveVehicleData } from "../Hooks/ActiveHook";
import { convertForTable } from "../../../../Util/Util";
import { customTagsActive, customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import FormActive from "./FormActive/FormActive";


const ActiveTable: React.FC = () => {
    const [data, setData] = useState<[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [vehicleData, setVehicleData] = useState<any>({});
    const [activeData, setActiveData] = useState<any>({});
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const req = await ActiveData();
                if (req["error"]) throw new Error(req.message);
                setData(req.data || []);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSelect = (item: any) => {
        setSelected(item);
        setOpenModal(true);
    };

    useEffect(() => {
        if (!selected) return;
        const loadVehicleData = async () => {
            try {
                const req = await ActiveVehicleData(selected[0].active_id.value);
                if (req["error"]) throw new Error(req.message);
                setVehicleData(req.data[0]);
            } catch (error) {
                console.error("Erro ao buscar dados do veículo", error);
            }
        };
        const loadActiveData = async () => {
            console.log(data.filter((item: any) => item.active_id === selected[0].active_id.value)[0]);
            setActiveData(data.filter((item: any) => item.active_id === selected[0].active_id.value)[0]);
        };
        loadVehicleData();
        loadActiveData();
    }, [selected]);

    if (loading) return <div>Carregando...</div>;
    if (!data || data.length === 0) return <div>Nenhum dado encontrado</div>;
    return (
        <div className="p-2">
            <CustomTable
                list={convertForTable(data, {
                    ocultColumns: listColumnsOcult,
                    customTags: customTagsActive,
                    customValue: customValueActive
                })}
                onConfirmList={handleSelect}
                maxSelection={1}
            />

            {openModal && selected && (
                <FormActive apiData={{ active: activeData, vehicle: vehicleData }} />
            )}
        </div>
    );
};

export default ActiveTable;