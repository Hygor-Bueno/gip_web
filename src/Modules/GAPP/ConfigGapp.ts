export const listPathGAPP = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home' },
    { page: '/GIPP/GAPP/Infraction', children: 'Infrações', icon: 'fa-solid fa-triangle-exclamation' },
    { page: '/GIPP/GAPP/Stores', children: 'Lojas', icon: 'fa fa-shop' },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
        }
    }
];