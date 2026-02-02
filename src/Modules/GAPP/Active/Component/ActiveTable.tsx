import React, { useEffect, useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import { ActiveData, ActiveVehicleData } from "../Hooks/ActiveHook";
import { convertForTable } from "../../../../Util/Util";
import {  customTagsActive,  customValueActive, listColumnsOcult } from "../ConfigurationTable/ConfigurationTable";
import ActiveFormSimple from "./CustomForm/CustomForm";

const ActiveTable: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [vehicleData, setVehicleData] = useState<any>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const req = await ActiveData();
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
                setVehicleData(req.data || []);
            } catch (error) {
                console.error("Erro ao buscar dados do veículo", error);
            }
        };

        loadVehicleData();
    }, [selected]);

    const handleReload = () => {
        setLoading(true);

        ActiveData().then(req => {
            setData(req.data || []);
            setLoading(false);
        });
    };

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
                <div className="modal-backdrop bg-light p-3">
                    <ActiveFormSimple 
                        selectedItem={selected[0]}
                        onClose={() => setOpenModal(false)} 
                        vehicleData={vehicleData}
                        onSaveSuccess={handleReload} 
                    />
                </div>
            )}
        </div>
    );
};


export default ActiveTable;