export const listPathEPP = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home' },
    { page: '/GIPP/EPP/sales', children: 'Vendas', icon: 'fa-solid fa-credit-card' },
    { page: '/GIPP/EPP/sales', children: 'Produção', icon: 'fa-solid fa-layer-group' },
    { page: '/GIPP/EPP/sales', children: 'Cadastro', icon: 'fa-solid fa-plus' },
    {
        page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
            localStorage.removeItem("tokenGIPP");
            localStorage.removeItem("codUserGIPP");
            localStorage.removeItem("num_store");
            localStorage.removeItem("store");
        }
    }
];