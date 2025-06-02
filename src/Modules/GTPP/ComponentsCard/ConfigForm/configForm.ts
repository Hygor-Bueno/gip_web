export const fieldsetsData = [
    {
        attributes: { id: '', className: 'w-100', },
        item: {
            label: 'Descrição',
            mandatory: true,
            captureValue: {
                type: 'text',
                placeholder: 'Digite a tarefa',
                name: 'description',
                className: 'form-control',
                required: true,
                id: 'description_form'
            },
        },
    },{
        attributes: { id: '', className: 'w-100', },
        item: {
            label: 'Data Inicial',
            mandatory: true,
            captureValue: {
                type: 'date',
                placeholder: '',
                name: 'date_initial',
                className: 'form-control',
                required: true,
                id: 'date_initial'
            },
        },
    },{
        attributes: { id: '', className: 'w-100', },
        item: {
            label: 'Data Final',
            mandatory: true,
            captureValue: {
                type: 'date',
                placeholder: '',
                name: 'date_initial',
                className: 'form-control',
                required: true,
                id: 'date_initial'
            },
        },
    },{
        attributes: { id: '', className: 'w-100', },
        item: {
            label: 'Status',
            mandatory: true,
            captureValue: {
                type: 'select',
                placeholder: '',
                name: 'date_initial',
                className: 'form-control',
                required: true,
                id: 'date_initial',
                options: [
                  {value: '', label: 'selectione'},
                  {value: '1', label: 'Teste'},
                ]
            },
        },
    }
];