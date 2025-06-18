export const formExpense = (
    unitList:{label:string,value:string}[],
    values:{ date_start: string, date_end: string, license_plates: string, unit_id: string, exp_type_id_fk: string },
    expensesTypeList:{label:string,value:string}[],
        onAction: (element: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) => [
    {
        attributes: { className: 'col-12 col-sm-4 col-md-3 col-xl-2' },
        item: {
            label: 'Data Inicial:',
            captureValue: {
                type: 'date',
                placeholder: 'Digite a empresa..',
                name: 'date_start',
                className: 'form-control',
                value: values.date_start,
                onChange: onAction,
            }
        }
    },
    {
        attributes: { className: 'col-12 col-sm-4 col-md-3 col-xl-2' },
        item: {
            label: 'Data Final:',
            captureValue: {
                type: 'date',
                placeholder: 'Digite a empresa..',
                name: 'date_end',
                className: 'form-control',
                value: values.date_end,
                onChange: onAction,
            }
        }
    },
    {
        attributes: { className: 'col-12 col-sm-3 col-md-2 col-xl-1' },
        item: {
            label: 'Placa:',
            captureValue: {
                type: 'text',
                placeholder: 'ABC1D23',
                name: 'license_plates',
                className: 'form-control',
                value: values.license_plates,
                onChange: onAction,
            }
        }
    },
    {
        attributes: { className: 'col-12 col-sm-4 col-xl-2' },
        item: {
            label: 'Unidades:',
            captureValue: {
                type: 'select',
                name: 'unit_id',
                value: values.unit_id,
                className: 'form-control',
                options: unitList,
                onChange: onAction,
            },
        },
    },
    {
        attributes: { className: 'col-12 col-sm-4 col-md-3 col-xl-2' },
        item: {
            label: 'Despesas:',
            captureValue: {
                type: 'select',
                name: 'exp_type_id_fk',
                className: 'form-control',
                options: expensesTypeList,
                value: values.exp_type_id_fk,
                onChange: onAction,
            },
        },
    },
];

export const customTagsExpense = {
    expen_id: "Cód",
    date: "data",
    hour: "horas",
    description: "Descrição",
    description_type: "Tipo",
    discount: "Descontos",
    total_value: "Valor Total",
    license_plates: "Placa",
    unit_name: "Unidade",
    status_expen: "Status"
}

export const minWidthsExpense = {
    expen_id: "100px",
    date: "100px",
    hour: "100px",
    description: "500px",
    description_type: "100px",
    discount: "100px",
    total_value: "130px",
    license_plates: "100px",
    unit_name: "100px",
    status_expen: "Status"
}