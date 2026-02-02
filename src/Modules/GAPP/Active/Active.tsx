import React from 'react';
import { listPathGAPP } from '../ConfigGapp';
import NavBar from '../../../Components/NavBar';
import ActiveTable from './Component/ActiveTable';

const Active: React.FC = () => {
    return (
        <React.Fragment>
            <NavBar list={listPathGAPP} />
            <ActiveTable />
        </React.Fragment>
    )
}

export default Active;