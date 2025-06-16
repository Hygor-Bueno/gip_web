export const formExpense = (
    unitList:{label:string,value:string}[],
    expensesTypeList:{label:string,value:string}[]
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
                // value: data.name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target),
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
                // value: data.name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target),
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
                // value: data.name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.name,e.target.value),
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
                className: 'form-control',
                options: unitList
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
                options: expensesTypeList
            },
        },
    },
];
/*
    :expen_id,
    :date_start,
    :date_end,
    :hour,
    :description,
    :discount,
    :total_value,
    :exp_type_id_fk,
    :vehicle_id,
    :license_plates,
    :unit_name,
    :status_expen,
    :page_number
*/
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