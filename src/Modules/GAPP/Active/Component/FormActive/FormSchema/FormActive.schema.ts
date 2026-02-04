import { ActiveFormValues } from "../FormInterfaces/FormActiveInterface";

export const formActive = (
    values: ActiveFormValues,
    unitList: { label: string; value: string }[] = [],
    depList: { label: string, value: string }[] = [],
    classList: { label: string; value: string }[] = [],
    onChange: (e: React.ChangeEvent<any>) => void
) => [
        { attributes: { className: 'd-none' },item: {label: '',captureValue: {type: 'number',name: 'active_id',value: values.active_id ?? '',onChange,}}},
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Marca', captureValue: { type: 'text', name: 'brand', className: 'form-control', value: values.brand || '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Modelo', captureValue: { type: 'text', name: 'model', className: 'form-control', value: values.model || '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'NF', captureValue: { type: 'number', name: 'number_nf', className: 'form-control', value: values.number_nf ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor do ativo', captureValue: { type: 'number', step: '0.01', name: 'value_purchase', className: 'form-control', value: values.value_purchase ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Data Compra', captureValue: { type: 'date', name: 'date_purchase', className: 'form-control', value: values.date_purchase ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Foto (arquivo ou URL)', captureValue: { type: 'file', name: 'photo', className: 'form-control', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Comprado por:', captureValue: { type: 'select', name: 'units_id_fk', className: 'form-control', options: unitList, value: values.units_id_fk ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Disponibilizado para:', captureValue: { type: 'select', name: 'used_in', className: 'form-control', options: depList, value: values.used_in ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Status', captureValue: { type: 'select', name: 'status_active', className: 'form-control', options: [{ label: 'Ativo', value: '1' }, { label: 'Inativo', value: '0' }], value: values.status_active ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Classe do ativo', captureValue: { type: 'select', name: 'id_active_class_fk', className: 'form-control', options: classList, value: values.id_active_class_fk ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'É um veículo?', captureValue: { type: 'select', name: 'is_vehicle', className: 'form-control', options: [{ label: 'Sim', value: '1' }, { label: 'Não', value: '0' }], value: values.is_vehicle ? '1' : '0', onChange } } },
    ];