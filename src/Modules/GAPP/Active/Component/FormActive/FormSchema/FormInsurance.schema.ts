import React from "react";
import { Insurance } from "../../../Interfaces/Interfaces";

export const formInsurance = (
    values: Partial<Insurance>,
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void       
) => [
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'CEP de risco', captureValue: { type: 'text', name: 'risk_cep', className: 'form-control', value: values.risk_cep ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Danos materiais', captureValue: { type: 'text', name: 'property_damage', className: 'form-control', value: values.property_damage ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Danos corporais', captureValue: { type: 'text', name: 'bodily_damages', className: 'form-control', value: values.bodily_damages ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Danos morais', captureValue: { type: 'text', name: 'moral_damages', className: 'form-control', value: values.moral_damages ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Vidros', captureValue: { type: 'text', name: 'glasses', className: 'form-control', value: values.glasses ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Assistência 24hrs', captureValue: { type: 'text', name: 'assist_24hrs', className: 'form-control', value: values.assist_24hrs ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'KM reboque', captureValue: { type: 'text', name: 'km_Trailer', className: 'form-control', value: values.km_Trailer ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Seguradora', captureValue: { type: 'text', name: 'ins_id_fk', className: 'form-control', value: values.ins_id_fk ?? '', onChange } } }, 
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cobertura', captureValue: { type: 'text', name: 'cov_id_fk', className: 'form-control', value: values.cov_id_fk ?? '', onChange } } }, 
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Utilização', captureValue: { type: 'text', name: 'util_id_fk', className: 'form-control', value: values.util_id_fk ?? '', onChange } } }, 
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Veículo', captureValue: { type: 'text', name: 'vehicle_id_fk', className: 'form-control', value: values.vehicle_id_fk ?? '', onChange } } }, 
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Status do Seguro', captureValue: { type: 'text', name: 'status_insurance', className: 'form-control', value: values.status_insurance ?? '', onChange } } }, 
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'N° da proposta', captureValue: { type: 'text', name: 'proposal_number', className: 'form-control', value: values.proposal_number ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'N° da apólice', captureValue: { type: 'text', name: 'policy_number', className: 'form-control', value: values.policy_number ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Data de inicio', captureValue: { type: 'date', name: 'date_init', className: 'form-control', value: values.date_init ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Data final', captureValue: { type: 'date', name: 'date_final', className: 'form-control', value: values.date_final ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Valor do IOF', captureValue: { type: 'text', name: 'IOF_value', className: 'form-control', value: values.IOF_value ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Valor do seguro', captureValue: { type: 'text', name: 'insurance_value', className: 'form-control', value: values.insurance_value ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Valor da franquia', captureValue: { type: 'text', name: 'deductible_value', className: 'form-control', value: values.deductible_value ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Forma de pagamento', captureValue: { type: 'text', name: 'form_payment', className: 'form-control', value: values.form_payment ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Fator de ajuste', captureValue: { type: 'text', name: 'adjustment_factor', className: 'form-control', value: values.adjustment_factor ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Carroceria', captureValue: { type: 'text', name: 'bodywork', className: 'form-control', value: values.bodywork ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Equipamento', captureValue: { type: 'text', name: 'equipament', className: 'form-control', value: values.equipament ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Blindagem', captureValue: { type: 'text', name: 'shielding', className: 'form-control', value: values.shielding ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Carro reserva', captureValue: { type: 'text', name: 'backup_car', className: 'form-control', value: values.backup_car ?? '', onChange } } },
];