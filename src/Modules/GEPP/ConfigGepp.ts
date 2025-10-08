export const listPathGEPP = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home' },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
        }
    }
];