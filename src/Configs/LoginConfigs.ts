export const fieldsetsData = [
    {
        attributes: { id: 'personal-info', className: 'row  col-12 my-2', },
        item: {
            label: 'Login',
            mandatory: true,
            captureValue: {
                autoComplete:"username",
                type: 'text',
                placeholder: 'Usuário',
                name: 'login',
                className: 'form-control',
                required: false,
                id: 'loginUserInput'
            },
        },

        legend: {
            text: 'Bem vindo(a)!',
            style: 'my-2 h5 d-flex aligm-items-center justify-content-center'
        }
    },

    {
        attributes: { id: 'contact-info', className: 'row col-12 my-2' },
        item: {
            label: 'Senha',
            mandatory: true,
            captureValue: {
                autoComplete:"current-password",
                type: 'password',
                placeholder: '******',
                name: 'senha',
                className: 'form-control',
                required: false,
                id: 'passwordUserInput'
            },
        },
    }
];