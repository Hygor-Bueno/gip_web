import React, { useEffect, useState } from 'react';
import { listPath } from '../GTPP/mock/configurationfile';
import NavBar from '../../Components/NavBar';
import CustomNavbar from './Components/CustomNavbar';
import { navItems } from './Data/configs';
import { useMyContext } from '../../Context/MainContext';
import TimeRecords from './Components/TimeRecords';
import Calculation from './Components/Calculation';
import { CfppProvider } from './Context/CfppContex';
import ReportsCFPP from './Components/ReportsCFPP';

export default function Cfpp() {
    const { setTitleHead } = useMyContext();
    const [refNav, setRefNav] = useState<string>('register');
    useEffect(() => {
        setTitleHead({
            title: "Controle de Folgas Peg Pese - CFPP",
            simpleTitle: "CFPP",
            icon: "fa-solid fa-calendar-days",
        });
    }, []);


    return (
        <CfppProvider>
            <div className='d-flex flex-row w-100 h-100 container-fluid p-0 m-0'>
                <NavBar list={listPath} />
                <section className='d-none d-sm-flex flex-column overflow-hidden h-100 w-100 p-2'>
                    <CustomNavbar items={navItems(setRefNav)} />
                    {refNav.includes('register') && <TimeRecords />}
                    {refNav.includes('payments') && <Calculation />}
                    {refNav.includes('reports') && <ReportsCFPP />}
                </section>
                <section className='d-flex d-sm-none align-items-center justify-content-center'>
                    <h1 className='w-75'>Ops! Não é possível acesso via mobile</h1>
                </section>
            </div>
        </CfppProvider>
    );
}
