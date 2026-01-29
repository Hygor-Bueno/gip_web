import React, { useState, useEffect } from 'react';
import { ActiveDepartamentData, ActiveDriverData, ActiveTypeFuelData, ActiveUnitsData } from '../../Hooks/ActiveHook';
import { ActiveFields } from './Active/ActiveFields';

interface ActiveFormSimpleProps {
    selectedItem: any;
    onClose: () => void;
    onSaveSuccess: () => void;
    vehicleData: any;
}

const ActiveFormSimple: React.FC<ActiveFormSimpleProps> = ({ selectedItem, onClose, onSaveSuccess, vehicleData }) => {
    const [units, setUnits] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [TypeFuel, setTypeFuel] = useState<any>([]);
    const [driver, setDriver] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('geral');
    const [formData, setFormData] = useState({
        active_id: '',
        brand: '',
        model: '',
        number_nf: '',
        status_active: '1',
        date_purchase: '',
        value_purchase: '',
        unit_number: '',
        dep_id: '',
        is_vehicle: 1
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [unitsReq, depReq, driverReq, fuelReq] = await Promise.all([
                    ActiveUnitsData(),
                    ActiveDepartamentData(),
                    ActiveDriverData(),
                    ActiveTypeFuelData()
                ]);
                setDriver(driverReq.data || driverReq)
                setUnits(unitsReq.data || unitsReq);
                setDepartments(depReq.data || depReq);
                setTypeFuel(fuelReq.data || fuelReq);
            } catch (error) {
                console.error("Erro ao carregar dados", error);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (selectedItem) {
            setFormData({
                active_id: selectedItem.active_id?.value || '',
                brand: selectedItem.brand?.value || '',
                model: selectedItem.model?.value || '',
                number_nf: selectedItem.number_nf?.value || '',
                status_active: selectedItem.status_active?.value || '1',
                date_purchase: selectedItem.date_purchase?.value || '',
                value_purchase: selectedItem.value_purchase?.value || '',
                unit_number: selectedItem.unit_number?.value || '',
                dep_id: selectedItem.dep_id_fk?.value || '',
                is_vehicle: Number(selectedItem.is_vehicle?.value) || 0,
            });
        }
    }, [selectedItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="card shadow-lg border-0">
            <div className="card-body">
                <form onSubmit={(e) => { e.preventDefault(); console.log(formData); }}>
                    <ActiveFields
                        formData={formData} 
                        handleChange={handleChange} 
                        units={units} 
                        departments={departments} 
                    />
                    <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary px-5 fw-bold">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActiveFormSimple;