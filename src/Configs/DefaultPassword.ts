export const formChangePassword = (onPassword: (e: any) => void,onConfirm: (e: any) => void,password:string,confirm:string) => [
    {
        attributes: { className: 'row col-10 my-2' },
        item: {
            label: 'Nova senha',
            mandatory: true,
            captureValue: {
                type: 'password',
                placeholder: '******',
                name: 'senha',
                className: 'form-control',
                required: true,
                id: 'passwordUserInput',
                onChange: onPassword,
                value:password
            },
        },
    },
    {
        attributes: { className: 'row col-10 my-2' },
        item: {
            label: 'Confirmar senha',
            mandatory: true,
            captureValue: {
                type: 'password',
                placeholder: '******',
                name: 'confirmarSenha',
                className: 'form-control',
                required: true,
                id: 'passwordUserInputConfirm',
                onChange: onConfirm,
                value:confirm
            },
        },
    }
];