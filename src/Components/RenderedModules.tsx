import React from 'react';
import Clpp from '../Modules/CLPP/Clpp';
type Props = {
    children: JSX.Element; // Tipo para o children
}
export default function RenderedModules(props: Props): JSX.Element {
    return (
        <div className='d-flex flex-row w-100 h-100 overflow-hidden'>
            {props.children}
            <Clpp />
        </div>
    );
}
