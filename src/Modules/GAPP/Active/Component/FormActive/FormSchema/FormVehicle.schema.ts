import { Schema, VehicleFormValues } from "../../../Interfaces/Interfaces";

/**
 * Define o formulário de dados do veículo quando o ativo é do tipo veículo.
 * Em termos de negócio, centraliza as informações necessárias para identificar,
 * classificar e controlar a manutenção de um veículo dentro do sistema.
 */
export const formVehicle = (
    values: VehicleFormValues,
    fuelTypeList: Schema[] = [],
    driver: Schema[] = [],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) => [
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Placa', captureValue: { type: 'text', name: 'license_plates', className: 'form-control', value: values.license_plates ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Ano', captureValue: { type: 'number', name: 'year', className: 'form-control', value: values.year ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Ano Modelo', captureValue: { type: 'number', name: 'year_model', className: 'form-control', value: values.year_model ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Chassi', captureValue: { type: 'text', name: 'chassi', className: 'form-control', value: values.chassi ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cor', captureValue: { type: 'text', name: 'color', className: 'form-control', value: values.color ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Renavam', captureValue: { type: 'text', name: 'renavam', className: 'form-control', value: values.renavam ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Potência', captureValue: { type: 'number', step: '0.01', name: 'power', className: 'form-control', value: values.power ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cilindrada', captureValue: { type: 'number', step: '0.01', name: 'cylinder', className: 'form-control', value: values.cylinder ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Capacidade', captureValue: { type: 'number', name: 'capacity', className: 'form-control', value: values.capacity ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Tabela FIPE', captureValue: { type: 'number', step: '0.01', name: 'fipe_table', className: 'form-control', value: values.fipe_table ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Última revisão (data)', captureValue: { type: 'date', name: 'last_revision_date', className: 'form-control', value: values.last_revision_date ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Próxima revisão (data)', captureValue: { type: 'date', name: 'next_revision_date', className: 'form-control', value: values.next_revision_date ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Última revisão (km)', captureValue: { type: 'number', name: 'last_revision_km', className: 'form-control', value: values.last_revision_km ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Próxima revisão (km)', captureValue: { type: 'number', name: 'next_revision_km', className: 'form-control', value: values.next_revision_km ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Motorista', captureValue: { type: 'select', name: 'directed_by', className: 'form-control', options: driver, value: values.directed_by ?? '', onChange } } },
        // { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Motorista', captureValue: { type: 'number', name: 'directed_by', className: 'form-control', value: values.directed_by ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Combustível (texto)', captureValue: { type: 'text', name: 'fuel_type', className: 'form-control', value: values.fuel_type ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Tem Blindagem?', captureValue: { type: 'select', name: 'shielding', className: 'form-control', options: [{ label: 'Sim', value: 1 }, { label: 'Não', value: 0 }], value: values.shielding ? '1' : '0', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Combustível (id)', captureValue: { type: 'select', name: 'fuel_type_id_fk', className: 'form-control', options: fuelTypeList, value: values.fuel_type_id_fk ?? '', onChange } } },
    ];