import React, { useEffect, useMemo, useState } from 'react';
import { CustomButton } from './CustomButton';
import { useMyContext } from '../Context/MainContext';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../Context/ConnContext';
import ProductTour, { TourStep } from './ProductTour';
const iconGTPP = require("../Assets/Image/GTTP_icon.png");
const iconCFPP = require("../Assets/Image/CFPP_icon.png");
const iconGAPP = require("../Assets/Image/GAPP_icon.jpg");
// const iconGEPP = require("../Assets/Image/GEPP_icon.webp");

const MODULE_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
    '3': {
        title: 'GTPP — Gerenciador de Tarefas',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aqui o usuário cria, acompanha e fecha tarefas com subtarefas, comentários e quadro Kanban em tempo real. Lorem ipsum dolor sit amet.',
    },
    '19': {
        title: 'CFPP — Configurações',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Centro de configurações do sistema: permissões, departamentos, parâmetros gerais. Lorem ipsum dolor sit amet.',
    },
    '15': {
        title: 'GAPP — Gestão de Ativos',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cadastro e movimentação de ativos, infrações, despesas de loja, controle financeiro. Lorem ipsum dolor sit amet.',
    },
};

const NAV_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
    '/GIPP': {
        title: 'Menu — Home',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Retorna para a tela inicial com a grade de módulos disponíveis para o seu usuário.',
    },
    '/GIPP/configuration/profile': {
        title: 'Menu — Perfil',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Edite seus dados pessoais, foto de perfil e preferências de conta.',
    },
    '/': {
        title: 'Menu — Sair',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Encerra a sessão atual com segurança, removendo o token armazenado.',
    },
};

export default function Home(): JSX.Element {
    const { setTitleHead, userLog } = useMyContext();
    const { fetchData } = useConnection();
    const [accessList, setAccessList] = useState<any>([]);
    const [tourOpen, setTourOpen] = useState<boolean>(false);

    React.useEffect(() => {
        setTitleHead({ title: 'Home - GIPP', simpleTitle: "Home", icon: 'fa fa-home' });
    }, []);

    useEffect(() => {
        (async () => {
            if (userLog.id) {
                const req: any = await fetchData({ method: 'GET', params: null, pathFile: 'CCPP/ApplicationAccessFunction.php', urlComplement: `&gipp_web=1&user_id=${userLog.id}` });
                req.data && setAccessList(req.data);
            }
        })();
    }, [userLog]);

    const listPath = [
        { page: '/GIPP', children: 'Home', icon: 'fa fa-home' },
        { page: '/GIPP/configuration/profile', children: 'Perfil', icon: 'fa fa-user' },
        {
            page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
                localStorage.removeItem("tokenGIPP");
                localStorage.removeItem("codUserGIPP");
            }
        }
    ];

    const openNavbar = () => {
        const toggle = document.querySelector<HTMLButtonElement>('[data-tour="navbar-toggle"]');
        const collapse = document.querySelector('#basic-navbar-nav');
        const isOpen = collapse?.classList.contains('show');
        if (toggle && !isOpen) toggle.click();
    };

    const tourSteps: TourStep[] = useMemo(() => {
        const steps: TourStep[] = [
            {
                selector: '[data-tour="navbar-toggle"]',
                title: 'Menu de Navegação',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aqui você expande o menu lateral com as opções principais do GIPP: voltar à Home, perfil e sair. Use sempre que precisar trocar de contexto.',
                placement: 'right',
            },
            ...listPath.map((item): TourStep => {
                const meta = NAV_DESCRIPTIONS[item.page] ?? { title: `Menu — ${item.children}`, body: 'Lorem ipsum dolor sit amet.' };
                return {
                    selector: `[data-tour="nav-link-${item.page}"]`,
                    title: meta.title,
                    body: meta.body,
                    placement: 'right',
                    setup: openNavbar,
                };
            }),
            ...((accessList || []) as Array<{ application_id: string }>).map((item): TourStep | null => {
                const meta = MODULE_DESCRIPTIONS[item.application_id];
                if (!meta) return null;
                return {
                    selector: `[data-tour="module-${item.application_id}"]`,
                    title: meta.title,
                    body: meta.body,
                    placement: 'bottom',
                };
            }).filter((s): s is TourStep => s !== null),
        ];
        return steps;
    }, [accessList]);

    return (
        <div className='d-flex flex-row w-100 h-100 container-fluid p-0 m-0'>
            <NavBar list={listPath} />
            <section className='p-2 flex-grow-1 position-relative'>
                <div className='d-flex justify-content-end align-items-center mb-2'>
                    <button
                        type='button'
                        className='gipp-tour-trigger'
                        onClick={() => setTourOpen(true)}
                        title='Apresentação dos módulos'
                    >
                        <i className='fa-solid fa-circle-info' />
                        Apresentação
                    </button>
                </div>
                <div className='d-flex flex-wrap'>
                    {accessList.length > 0 && accessList.map((item: any) => (
                        <RenderModule key={item.application_id} cod={item.application_id} />
                    ))}
                </div>
            </section>

            <ProductTour
                open={tourOpen}
                onClose={() => setTourOpen(false)}
                steps={tourSteps}
            />
        </div>
    );
}

function RenderModule({ cod }: { cod: string }) {
    const [item, setItem] = useState<{ path: string, icon: any }>({ path: '', icon: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const value: { path: string, icon: any } = { path: '', icon: '' };
        switch (cod) {
            case '3':
                value.icon = iconGTPP;
                value.path = '/GIPP/GTPP';
                break;
            case '19':
                value.icon = iconCFPP;
                value.path = '/GIPP/CFPP';
                break;
            case '15':
                value.icon = iconGAPP;
                value.path = '/GIPP/GAPP';
                break;
            default:
                break;
        }
        setItem(value);
    }, [cod]);

    return (
        item.path ?
        <CustomButton
            onClick={() => navigate(item.path)}
            className='btn mx-2 col-4 col-sm-3 col-md-2 col-lg-1 p-0 m-0 shadow-lg'
            data-tour={`module-${cod}`}
        >
            <img className="rounded w-100" src={item.icon} alt="Logo Peg Pese" />
        </CustomButton>
        :
        <React.Fragment />
    );
}
