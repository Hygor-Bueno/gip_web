import React, { useState, useEffect } from 'react';
import { listPathGAPP } from '../ConfigGapp';
import NavBar from '../../../Components/NavBar';
import ActiveTable from './Component/ActiveTable';

const MOBILE_BP = 640;

const Active: React.FC = () => {
    const [navHidden, setNavHidden] = useState(false);

    // Restore nav automatically when the viewport grows beyond the mobile breakpoint
    useEffect(() => {
        const mq = window.matchMedia(`(min-width: ${MOBILE_BP + 1}px)`);
        const onResize = (e: MediaQueryListEvent) => { if (e.matches) setNavHidden(false); };
        mq.addEventListener("change", onResize);
        return () => mq.removeEventListener("change", onResize);
    }, []);

    return (
        <React.Fragment>
            {!navHidden && <NavBar list={listPathGAPP} />}
            <ActiveTable
                onToggleNav={() => setNavHidden(h => !h)}
                navHidden={navHidden}
            />
        </React.Fragment>
    );
};

export default Active;