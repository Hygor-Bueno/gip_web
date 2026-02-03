import { ActiveFormValues, PlaceAddress, VehicleFormValues } from "./FormActiveInterface";
import { ActiveFormData } from "./FormActiveTypes";

export const buildActiveFieldsets = (data?: ActiveFormData, isVehicle: boolean = false) => {
    const baseFields = [
        {
            legend: {
                text: 'Informações do Ativo',
                style: 'my-3 h5'
            },
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Marca',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    name: 'brand',
                    className: 'form-control',
                    placeholder: 'Ex: Volkswagen',
                    value: data?.brand ?? ''
                }
            }
        },
        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Modelo',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    name: 'model',
                    className: 'form-control',
                    placeholder: 'Ex: Jetta Highline',
                    value: data?.model ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Nota Fiscal',
                captureValue: {
                    type: 'text',
                    name: 'number_nf',
                    className: 'form-control',
                    placeholder: 'Número da NF',
                    value: data?.number_nf ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Data da Compra',
                captureValue: {
                    type: 'date',
                    name: 'date_purchase',
                    className: 'form-control',
                    value: data?.date_purchase ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Valor da Compra',
                captureValue: {
                    type: 'number',
                    step: '0.01',
                    name: 'value_purchase',
                    className: 'form-control',
                    placeholder: 'R$ 0,00',
                    value: data?.value_purchase ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Local da Compra',
                captureValue: {
                    type: 'text',
                    name: 'place_purchase',
                    className: 'form-control',
                    placeholder: 'Local da compra',
                    value: data?.place_purchase ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Foto',
                captureValue: {
                    type: 'text',
                    name: 'photo',
                    className: 'form-control',
                    placeholder: 'URL da foto',
                    value: data?.photo ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Data de Alteração',
                captureValue: {
                    type: 'date',
                    name: 'change_date',
                    className: 'form-control',
                    value: data?.change_date ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Status',
                captureValue: {
                    type: 'select',
                    name: 'status_active',
                    className: 'form-select',
                    value: data?.status_active ?? '',
                    options: [
                        { value: '1', label: 'Ativo' },
                        { value: '0', label: 'Inativo' }
                    ]
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Unidade',
                captureValue: {
                    type: 'number',
                    name: 'units_id_fk',
                    className: 'form-control',
                    placeholder: 'ID da Unidade',
                    value: data?.units_id_fk ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Classe do Ativo',
                captureValue: {
                    type: 'number',
                    name: 'id_active_class_fk',
                    className: 'form-control',
                    placeholder: 'ID da Classe',
                    value: data?.id_active_class_fk ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Usuário Responsável',
                captureValue: {
                    type: 'number',
                    name: 'user_id_fk',
                    className: 'form-control',
                    placeholder: 'ID do Usuário',
                    value: data?.user_id_fk ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Grupo de Trabalho',
                captureValue: {
                    type: 'number',
                    name: 'work_group_fk',
                    className: 'form-control',
                    placeholder: 'ID do Grupo',
                    value: data?.work_group_fk ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'É Veículo?',
                captureValue: {
                    type: 'select',
                    name: 'is_vehicle',
                    className: 'form-select',
                    value: data?.is_vehicle ?? '0',
                    options: [
                        { value: '1', label: 'Sim' },
                        { value: '0', label: 'Não' }
                    ]
                }
            }
        }
    ];

    const vehicleFields = [
        {
            legend: {
                text: 'Informações do Veículo',
                style: 'my-3 h5'
            },
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Placa',
                captureValue: {
                    type: 'text',
                    name: 'license_plates',
                    className: 'form-control',
                    placeholder: 'AAA-0000',
                    value: data?.license_plates ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Ano',
                captureValue: {
                    type: 'number',
                    name: 'year',
                    className: 'form-control',
                    placeholder: '2024',
                    value: data?.year ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Ano do Modelo',
                captureValue: {
                    type: 'number',
                    name: 'year_model',
                    className: 'form-control',
                    placeholder: '2024',
                    value: data?.year_model ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Chassi',
                captureValue: {
                    type: 'text',
                    name: 'chassi',
                    className: 'form-control',
                    placeholder: 'Número do chassi',
                    value: data?.chassi ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Cor',
                captureValue: {
                    type: 'text',
                    name: 'color',
                    className: 'form-control',
                    placeholder: 'Cor do veículo',
                    value: data?.color ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Renavam',
                captureValue: {
                    type: 'text',
                    name: 'renavam',
                    className: 'form-control',
                    placeholder: 'Número do Renavam',
                    value: data?.renavam ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Tipo de Combustível',
                captureValue: {
                    type: 'text',
                    name: 'fuel_type',
                    className: 'form-control',
                    placeholder: 'Gasolina, Diesel, etc.',
                    value: data?.fuel_type ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Potência (cv)',
                captureValue: {
                    type: 'number',
                    step: '0.01',
                    name: 'power',
                    className: 'form-control',
                    placeholder: 'Potência em cv',
                    value: data?.power ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Cilindrada',
                captureValue: {
                    type: 'number',
                    step: '0.01',
                    name: 'cylinder',
                    className: 'form-control',
                    placeholder: 'Cilindrada',
                    value: data?.cylinder ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Capacidade',
                captureValue: {
                    type: 'number',
                    name: 'capacity',
                    className: 'form-control',
                    placeholder: 'Capacidade',
                    value: data?.capacity ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Tabela FIPE',
                captureValue: {
                    type: 'number',
                    step: '0.01',
                    name: 'fipe_table',
                    className: 'form-control',
                    placeholder: 'Valor da tabela FIPE',
                    value: data?.fipe_table ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Última Revisão (Data)',
                captureValue: {
                    type: 'date',
                    name: 'last_revision_date',
                    className: 'form-control',
                    value: data?.last_revision_date ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Última Revisão (KM)',
                captureValue: {
                    type: 'number',
                    name: 'last_revision_km',
                    className: 'form-control',
                    placeholder: 'KM da última revisão',
                    value: data?.last_revision_km ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Próxima Revisão (Data)',
                captureValue: {
                    type: 'date',
                    name: 'next_revision_date',
                    className: 'form-control',
                    value: data?.next_revision_date ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Próxima Revisão (KM)',
                captureValue: {
                    type: 'number',
                    name: 'next_revision_km',
                    className: 'form-control',
                    placeholder: 'KM da próxima revisão',
                    value: data?.next_revision_km ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Direcionado por',
                captureValue: {
                    type: 'number',
                    name: 'directed_by',
                    className: 'form-control',
                    placeholder: 'ID do responsável',
                    value: data?.directed_by ?? ''
                }
            }
        },

        {
            attributes: {
                className: 'row col-12 col-md-6'
            },
            item: {
                label: 'Blindado',
                captureValue: {
                    type: 'select',
                    name: 'shielding',
                    className: 'form-select',
                    value: data?.shielding ?? '0',
                    options: [
                        { value: '1', label: 'Sim' },
                        { value: '0', label: 'Não' }
                    ]
                }
            }
        },

        {
            attributes: {
                className: 'row col-12'
            },
            item: {
                label: 'Tipo de Combustível (ID)',
                captureValue: {
                    type: 'number',
                    name: 'fuel_type_id_fk',
                    className: 'form-control',
                    placeholder: 'ID do tipo de combustível',
                    value: data?.fuel_type_id_fk ?? ''
                }
            }
        }
    ];
    return !isVehicle ? [...baseFields, ...vehicleFields] : baseFields;
};


// form config generators (compatible com CustomForm.fieldsets)
export const formActive = (
    values: ActiveFormValues,
    unitList: { label: string; value: string }[] = [],
    classList: { label: string; value: string }[] = [],
    userList: { label: string; value: string }[] = [],
    onChange: (e: React.ChangeEvent<any>) => void

) => [
        // active_id (hidden or number)
        {

            attributes: { className: 'd-none' },
            item: {
                label: '',
                captureValue: {
                    type: 'number',
                    name: 'active_id',
                    value: values.active_id ?? '',
                    onChange,
                }
            }
        },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Marca', captureValue: { type: 'text', name: 'brand', className: 'form-control', value: values.brand || '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Modelo', captureValue: { type: 'text', name: 'model', className: 'form-control', value: values.model || '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'NF', captureValue: { type: 'number', name: 'number_nf', className: 'form-control', value: values.number_nf ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Data Compra', captureValue: { type: 'date', name: 'date_purchase', className: 'form-control', value: values.date_purchase ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-2' }, item: { label: 'Valor', captureValue: { type: 'number', step: '0.01', name: 'value_purchase', className: 'form-control', value: values.value_purchase ?? '', onChange } } },
        // photo (file or URL)
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Foto (arquivo ou URL)', captureValue: { type: 'file', name: 'photo', className: 'form-control', onChange } } },

        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Data alteração', captureValue: { type: 'date', name: 'change_date', className: 'form-control', value: values.change_date ?? '', onChange } } },

        // list_items (JSON) -> textarea
        //{ attributes: { className: 'my-2 col-12' }, item: { label: 'Lista de itens (JSON)', captureValue: { type: 'textarea', name: 'list_items', className: 'form-control', value: values.list_items ?? '', onChange, placeholder: '[{"name":"Cabo","qty":1}]' } } },
        // { 
        //     attributes: { className: 'my-2 col-12' }, 
        //     item: { 
        //         label: 'itens Adicionais', 
        //         captureValue: { 
        //         type: 'textarea', 
        //         name: 'list_items', 
        //         className: 'form-control', 
        //         // @ts-ignore
        //         value: JSON.stringify(values.list_items?.list[0] ?? [], null, 2), // stringify bonito
        //         onChange,
        //         placeholder: '[{"name":"Cabo","qty":1}]'
        //         } 
        //     } 
        // },

        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Usado em (id)', captureValue: { type: 'number', name: 'used_in', className: 'form-control', value: values.used_in ?? '', onChange } } },

        // is_vehicle checkbox
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'É veículo?', captureValue: { type: 'checkbox', name: 'is_vehicle', className: 'form-check-input', checked: !!values.is_vehicle, onChange } } },

        // status_active as select
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Status', captureValue: { type: 'select', name: 'status_active', className: 'form-control', options: [{ label: 'Ativo', value: '1' }, { label: 'Inativo', value: '0' }], value: values.status_active ?? '', onChange } } },

        // units, class, user, workgroup selects (lists passed from API)
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Unidade', captureValue: { type: 'select', name: 'units_id_fk', className: 'form-control', options: unitList, value: values.units_id_fk ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Classe do ativo', captureValue: { type: 'select', name: 'id_active_class_fk', className: 'form-control', options: classList, value: values.id_active_class_fk ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Responsável (usuário)', captureValue: { type: 'select', name: 'user_id_fk', className: 'form-control', options: userList, value: values.user_id_fk ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Grupo de trabalho', captureValue: { type: 'number', name: 'work_group_fk', className: 'form-control', value: values.work_group_fk ?? '', onChange } } },
    ];

export const formAddress = (
    values: PlaceAddress,
    onChange: (e: React.ChangeEvent<any>) => void
) => [
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cidade', captureValue:{ type: 'text', name: "place_purchase.city", className: "form-control", value: values.place_purchase?.city ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Complemento', captureValue:{ type: 'text', name: "place_purchase.complement", className: "form-control", value: values.place_purchase?.complement ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Bairro', captureValue:{ type: 'text', name: "place_purchase.neighborhood", className: "form-control", value: values.place_purchase?.neighborhood ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Numero', captureValue:{ type: 'text', name: "place_purchase.number", className: "form-control", value: values.place_purchase?.number ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Loja', captureValue:{ type: 'text', name: "place_purchase.store", className: "form-control", value: values.place_purchase?.store ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Lougradouro', captureValue:{ type: 'text', name: "place_purchase.public_place", className: "form-control", value: values.place_purchase?.public_place ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Estado', captureValue:{ type: 'text', name: "place_purchase.state", className: "form-control", value: values.place_purchase?.state ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'CEP', captureValue:{ type: 'text', name: "place_purchase.zip_code", className: "form-control", value: values.place_purchase?.zip_code ?? '', onChange } } },
];

export const formVehicle = (
    values: VehicleFormValues,
    fuelTypeList: { label: string; value: string }[] = [],
    onChange: (e: React.ChangeEvent<any>) => void
) => [
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Placa', captureValue: { type: 'text', name: 'license_plates', className: 'form-control', value: values.license_plates ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Ano', captureValue: { type: 'number', name: 'year', className: 'form-control', value: values.year ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Ano Modelo', captureValue: { type: 'number', name: 'year_model', className: 'form-control', value: values.year_model ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Chassi', captureValue: { type: 'text', name: 'chassi', className: 'form-control', value: values.chassi ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cor', captureValue: { type: 'text', name: 'color', className: 'form-control', value: values.color ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Renavam', captureValue: { type: 'text', name: 'renavam', className: 'form-control', value: values.renavam ?? '', onChange } } },
        { attributes: { className: 'my-2 col-12 col-md-4' }, item: { label: 'Combustível (texto)', captureValue: { type: 'text', name: 'fuel_type', className: 'form-control', value: values.fuel_type ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Potência', captureValue: { type: 'number', step: '0.01', name: 'power', className: 'form-control', value: values.power ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cilindrada', captureValue: { type: 'number', step: '0.01', name: 'cylinder', className: 'form-control', value: values.cylinder ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Capacidade', captureValue: { type: 'number', name: 'capacity', className: 'form-control', value: values.capacity ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Tabela FIPE', captureValue: { type: 'number', step: '0.01', name: 'fipe_table', className: 'form-control', value: values.fipe_table ?? '', onChange } } },

        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Última revisão (data)', captureValue: { type: 'date', name: 'last_revision_date', className: 'form-control', value: values.last_revision_date ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Última revisão (km)', captureValue: { type: 'number', name: 'last_revision_km', className: 'form-control', value: values.last_revision_km ?? '', onChange } } },

        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Próxima revisão (data)', captureValue: { type: 'date', name: 'next_revision_date', className: 'form-control', value: values.next_revision_date ?? '', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Próxima revisão (km)', captureValue: { type: 'number', name: 'next_revision_km', className: 'form-control', value: values.next_revision_km ?? '', onChange } } },

        { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Direcionado por (id)', captureValue: { type: 'number', name: 'directed_by', className: 'form-control', value: values.directed_by ?? '', onChange } } },

        // shielding checkbox and fuel type id select
        { attributes: { className: 'my-2 col-3' }, item: { label: 'Blindagem?', captureValue: { type: 'checkbox', name: 'shielding', checked: !!values.shielding, className: 'form-check-input', onChange } } },
        { attributes: { className: 'my-2 col-6 col-md-4' }, item: { label: 'Combustível (id)', captureValue: { type: 'select', name: 'fuel_type_id_fk', className: 'form-control', options: fuelTypeList, value: values.fuel_type_id_fk ?? '', onChange } } },
    ];
