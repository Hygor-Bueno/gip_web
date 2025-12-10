export const listPath = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home', },
    { page: '/GIPP/GTPP', children: 'Tarefas', icon: 'fa fa-pencil', },
    { page: '/GIPP/GTPP/create/theme', children: 'Temas', icon: 'fa fa-table-cells-large', },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
        }
    }
];

export const listPathEPP = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home', },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
        }
    }
];


export const listPathCFPP = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home', },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
        }
    }
];



export const fieldsetsRegister = (
    optionsCompay: [{ value: string, label: string }],
    onCompany: (id: number) => void,
    optionsDepartament: [{ value: string, label: string }],
    onDepartament:(id: number) => void,
    optionsStore: [{ value: string, label: string }]
) => [
        {
            attributes: { id: '', className: 'w-100', },
            item: {
                label: 'Digite o nome da tarefa',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: 'Digite a tarefa',
                    name: 'description',
                    className: 'form-control',
                    required: true,
                    id: ''
                },
            },
        }, {
            attributes: { id: '', className: 'w-100', },
            item: {
                label: 'Data Inicial',
                mandatory: true,
                captureValue: {
                    type: 'date',
                    placeholder: '',
                    name: 'initial_date',
                    className: 'form-control',
                    required: true,
                    id: ''
                },
            },
        }, {
            attributes: { id: '', className: 'w-100', },
            item: {
                label: 'Data Final',
                mandatory: true,
                captureValue: {
                    type: 'date',
                    placeholder: '',
                    name: 'final_date',
                    className: 'form-control',
                    required: true,
                    id: ''
                },
            },
        }, {
            attributes: { id: '', className: 'w-100', },
            item: {
                label: 'Prioridade',
                mandatory: true,
                captureValue: {
                    type: 'select',
                    placeholder: '',
                    name: 'priority',
                    className: 'form-control',
                    required: true,
                    id: '',
                    options: [
                        { value: '', label: 'Selecione' },
                        { value: '0', label: 'Baixa' },
                        { value: '1', label: 'Média' },
                        { value: '2', label: 'Alta' },
                    ]
                },
            },
        }, {
            attributes: { className: 'w-100', },
            item: {
                label: 'Companhias',
                mandatory: true,
                captureValue: {
                    type: 'select',
                    onChange: (e: any) => { onCompany(parseInt(e.target.value)) },
                    placeholder: '',
                    name: 'company_id',
                    className: 'form-control',
                    required: true,
                    id: '',
                    options: optionsCompay
                },
            }
        }, {
            attributes: { className: 'w-100', },
            item: {
                label: 'Lojas',
                mandatory: true,
                captureValue: {
                    type: 'select',
                    onChange: (e: any) => { onDepartament(parseInt(e.target.value)) },
                    placeholder: '',
                    name: 'shop_id',
                    className: 'form-control',
                    required: true,
                    id: '',
                    options: optionsDepartament
                },
            }
        }, {
            attributes: { className: 'w-100', },
            item: {
                label: 'Departamentos',
                mandatory: true,
                captureValue: {
                    type: 'select',
                    placeholder: '',
                    name: 'depart_id',
                    className: 'form-control',
                    required: true,
                    id: '',
                    options: optionsStore
                },
            }
        }
    ];

// Filtro de busca aonde vamos mesclar as informações para os campos ter mais facilidade.
export const fildsetsFilters = (
    onFilterSearch: (value: string) => void,
    onFilterPriority: (value: string) => void,
    optionsFilterPriority: {value: string, label: string}[],
    onFilterDateInitial: (value: string) => void,
    onFilterDateInitialFinal: (value: string) => void,
    onFilterDateFinal: (value: string) => void,
    onFilterDateFinalFinal: (value: string) => void,
    onFilterHandlerItemUser: (value: number) => void,
    optionsStatus: {value: string, label: string}[]
) => [
    {
        attributes: { 
            className: 'w-100', 
        },
        item: {
            label: 'Filtrar por',
            mandatory: false,
            captureValue: {
                type: 'text',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>{
                    onFilterSearch((e.target.value));
                },
                placeholder: 'Digite a tarefa',
                name: 'description',
                className: 'form-control',
                required: false,
                id: '',
                'area-label': 'Campo de filtro por tarefa',
            },
        }
    },
    {
        attributes: { 
            className: 'w-100', 
        },
        item: {
            label: 'Filtrar por prioridade',
            mandatory: false,
            captureValue: {
                type: 'select',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => { onFilterPriority(e.target.value) },
                placeholder: '',
                name: 'priority',
                className: 'form-control',
                required: false,
                id: '',
                options: optionsFilterPriority
            },
        }
    },
    {
        attributes: { 
            className: 'w-100', 
        },
        item: {
            label: 'Filtrar por data inicial',
            mandatory: false,
            captureValue: [
                {
                    type: 'date',
                    placeholder: '',
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onFilterDateInitial(e.target.value),
                    name: 'initial_date',
                    className: 'form-control',
                    required: false,
                    id: ''
                },
                {
                    type: 'date',
                    placeholder: '',
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onFilterDateInitialFinal(e.target.value),
                    name: 'initial_date',
                    className: 'form-control',
                    required: false,
                    id: ''
                }
            ],
        },
    },
    {
        attributes: { 
            className: 'w-100', 
        },
        item: {
            label: 'Filtrar por data final',
            mandatory: false,
            captureValue: [
                {
                    type: 'date',
                    placeholder: '',
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onFilterDateFinal(e.target.value),
                    name: 'final_date',
                    className: 'form-control',
                    required: false,
                    id: ''
                },
                {
                    type: 'date',
                    placeholder: '',
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onFilterDateFinalFinal(e.target.value),
                    name: 'final_date',
                    className: 'form-control',
                    required: false,
                    id: ''
                }
            ],
        },
    },
    {
        attributes: { 
            className: 'w-100', 
        },
        item: {
            label: 'Filtrar por',
            mandatory: false,
            captureValue: {
                type: 'select',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => onFilterHandlerItemUser(parseInt(e.target.value)),
                placeholder: '',
                name: 'priority',
                className: 'form-control',
                required: false,
                id: '',
                options: optionsStatus
            },
        }
    },
];