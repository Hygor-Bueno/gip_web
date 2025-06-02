export const formSearchUserCFPP = ({
    name,
    branchCode,
    costCenterCode,
    status,
    branch,
    costCenter,
    onAction
}: {
    name: string,
    branchCode: string,
    costCenterCode: string,
    status: string,
    branch: [{ label: string, value: string }],
    costCenter: [{ label: string, value: string }],
    onAction: (element: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}) => [
        {
            attributes: { className: 'form-group col-3' },
            item: {
                label: 'Nome',
                captureValue: {
                    type: 'text',
                    value: name,
                    placeholder: 'Nome do colaborador',
                    name: 'name',
                    className: 'form-control',
                    onChange: onAction,
                },
            }
        },
        {
            attributes: { className: 'form-group col-2' },
            item: {
                label: 'Filiais',
                captureValue: {
                    type: 'select',
                    value: branchCode,
                    onChange: onAction,
                    placeholder: '',
                    name: 'branchCode',
                    className: 'form-control',
                    id: '',
                    options: branch
                },
            }
        },
        {
            attributes: { className: 'form-group col-2' },
            item: {
                label: 'Centro de Custo (C.C)',
                captureValue: {
                    type: 'select',
                    value: costCenterCode,
                    onChange: onAction,
                    placeholder: '',
                    name: 'costCenterCode',
                    className: 'form-control',
                    id: '',
                    options: costCenter
                },
            }
        },
        {
            attributes: { className: 'form-group col-1' },
            item: {
                label: 'Status',
                captureValue: {
                    type: 'select',
                    value: status,
                    onChange: onAction,
                    placeholder: '',
                    name: 'status',
                    className: 'form-control',
                    id: '',
                    options: [{ label: 'Ativo', value: "A" }, { label: 'Inativo', value: "I" }]
                },
            }
        }
    ];