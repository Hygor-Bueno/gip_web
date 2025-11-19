import React, { useEffect, useState } from 'react';
import { CustomButton } from './CustomButton';
import { useMyContext } from '../Context/MainContext';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../Context/ConnContext';
const iconGTPP = require("../Assets/Image/GTTP_icon.png");
const iconCFPP = require("../Assets/Image/CFPP_icon.png");
const iconGAPP = require("../Assets/Image/GAPP_icon.jpg");
const iconGEPP = require("../Assets/Image/GEPP_icon.webp");

export default function Home(): JSX.Element {
    const { setTitleHead, setLoading, userLog } = useMyContext();
    const { fetchData } = useConnection();
    const [accessList, setAccessList] = useState<any>([]);

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

    return (
        <div className='d-flex flex-row w-100 h-100 container-fluid p-0 m-0'>
            <NavBar list={listPath} />
            <section className='p-2 flex-grow-1'>
                {accessList.length > 0 && accessList.map((item: any) => (
                    <RenderModule key={item.application_id} cod={item.application_id} />
                )
                )}
            </section>
        </div>
    );
}

// RenderModule agora é um componente React válido
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
            case '16':
                value.icon = iconGEPP;
                value.path = '/GIPP/EPP';
            break;
            case '20':
                value.icon = iconGEPP;
                value.path = '/GIPP/GEPP';
                break;
            
            default:
                break;
        }
        setItem(value);
    }, [cod]);

    return (
        item.path ?
        <CustomButton onClick={() => navigate(item.path)} className='btn mx-2 col-4 col-sm-3 col-md-2 col-lg-1 p-0 m-0 shadow-lg'>
            <img className="rounded w-100" src={item.icon} alt="Logo Peg Pese" />
        </CustomButton>
        :
        <React.Fragment />
    );
}