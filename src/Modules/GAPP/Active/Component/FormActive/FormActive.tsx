import React, { useEffect, useState } from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { ActiveFormValues, VehicleFormValues } from "./FormActiveInterface";
import { formActive, formVehicle } from "./FormActiveSchema";
import { useConnection } from "../../../../../Context/ConnContext";


export default function FormActive(props?: any): JSX.Element {
    const [activeValues, setActiveValues] = useState<ActiveFormValues>({
        brand: '',
        model: '',
        is_vehicle: true,
    });
    const [vehicleValues, setVehicleValues] = useState<VehicleFormValues>({
        license_plates: '',
    });

    const { fetchData } = useConnection();

    useEffect(() => {
        if (!props?.apiData) return;
        const { active, vehicle } = props.apiData;
        setActiveValues(active);
        setVehicleValues(vehicle);
    }, [props?.apiData]);

    async function sendActive() {
        try {
            const req: any = await fetchData({ method: "POST", params: mapFormToApi(activeValues, vehicleValues), pathFile: 'GAPP_V2/Active.php', urlComplement: `&v2=1&smart=ON` })
            if (req.error) throw new Error(req.message);
            console.log(req);
        } catch (error: any) {
            console.error(error.message);
        }
        console.log(mapFormToApi(activeValues, vehicleValues));
    }

    function onChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) {
        const { name, type, value, checked, files } = e.target as any;

        const fieldValue =
            type === 'checkbox'
                ? checked
                : type === 'file'
                    ? files?.[0] ?? null
                    : value;

        if (name in activeValues) {
            setActiveValues(prev => ({ ...prev, [name]: fieldValue }));
        }

        if (name in vehicleValues) {
            setVehicleValues(prev => ({ ...prev, [name]: fieldValue }));
        }
    }


    return (
        <div className="position-absolute top-0 start-0 vw-100 vh-100 bg-dark bg-opacity-25 d-flex flex-column align-items-center justify-content-center">
            <div className="bg-white container h-75 w-75 overflow-auto p-2">
                <h1 className="w-100 bg-secondary text-white p-2">Formulário de Ativo:</h1>
                <CustomForm
                    fieldsets={formActive(
                        activeValues,
                        [],
                        [],
                        [],
                        onChange
                    )}
                    notButton={false}
                    className="row overflow-auto col-12 "
                />
                {activeValues.is_vehicle && (
                    <React.Fragment>
                        <h1 className="w-100 bg-secondary text-white mt-4 p-2">Formulário de Veículo:</h1>
                        <CustomForm
                            fieldsets={formVehicle(
                                vehicleValues,
                                [],
                                onChange
                            )}
                            notButton={false}
                            className="row overflow-auto col-12 "
                        />
                    </React.Fragment>
                )}
            </div>
            <button type="button" title="Alterar ativo" className="btn btn-success m-2" onClick={sendActive}>Enviar</button>
        </div>
    )
}


// mapper para enviar ao backend (garante tipos corretos)
export function mapFormToApi(active: ActiveFormValues, vehicle: VehicleFormValues) {
    // photo: se File, envie como multipart/form-data separadamente; aqui colocamos null ou nome
    const activePayload: any = {
        active_id: active.active_id ? Number(active.active_id) : null,
        brand: active.brand || null,
        model: active.model || null,
        number_nf: active.number_nf ? Number(active.number_nf) : null,
        date_purchase: active.date_purchase || null,
        place_purchase: active.place_purchase ? tryParseJson(active.place_purchase) : null,
        value_purchase: active.value_purchase !== undefined && active.value_purchase !== '' ? Number(active.value_purchase) : null,
        photo: typeof active.photo === 'string' ? active.photo : null, // se File, trate à parte
        change_date: active.change_date || null,
        list_items: active.list_items ? tryParseJson(active.list_items) : null,
        used_in: active.used_in ? Number(active.used_in) : null,
        is_vehicle: active.is_vehicle ? 1 : 0,
        status_active: active.status_active !== undefined && active.status_active !== '' ? Number(active.status_active) : null,
        units_id_fk: active.units_id_fk ? Number(active.units_id_fk) : null,
        id_active_class_fk: active.id_active_class_fk ? Number(active.id_active_class_fk) : null,
        user_id_fk: active.user_id_fk ? Number(active.user_id_fk) : null,
        work_group_fk: active.work_group_fk ? Number(active.work_group_fk) : null,
    };

    const vehiclePayload: any = {
        license_plates: vehicle.license_plates || null,
        year: vehicle.year ? Number(vehicle.year) : null,
        year_model: vehicle.year_model ? Number(vehicle.year_model) : null,
        chassi: vehicle.chassi || null,
        color: vehicle.color || null,
        renavam: vehicle.renavam || null,
        fuel_type: vehicle.fuel_type || null,
        power: vehicle.power !== undefined && vehicle.power !== '' ? Number(vehicle.power) : null,
        cylinder: vehicle.cylinder !== undefined && vehicle.cylinder !== '' ? Number(vehicle.cylinder) : null,
        capacity: vehicle.capacity ? Number(vehicle.capacity) : null,
        fipe_table: vehicle.fipe_table !== undefined && vehicle.fipe_table !== '' ? Number(vehicle.fipe_table) : null,
        last_revision_date: vehicle.last_revision_date || null,
        last_revision_km: vehicle.last_revision_km ? Number(vehicle.last_revision_km) : null,
        next_revision_date: vehicle.next_revision_date || null,
        next_revision_km: vehicle.next_revision_km ? Number(vehicle.next_revision_km) : null,
        directed_by: vehicle.directed_by ? Number(vehicle.directed_by) : null,
        shielding: vehicle.shielding ? 1 : 0,
        fuel_type_id_fk: vehicle.fuel_type_id_fk ? Number(vehicle.fuel_type_id_fk) : null,
    };

    return {
        active: activePayload,
        vehicle: vehiclePayload
    };
}

function tryParseJson(str: any) {
    if (!str) return null;
    if (typeof str === 'object') return str;
    try {
        return JSON.parse(str);
    } catch {
        // se o usuário não forneceu JSON, podemos retornar string bruta
        return str;
    }
}