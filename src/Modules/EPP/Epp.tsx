import React from 'react';
import NavBar from '../../Components/NavBar';
import { listPathEPP } from './ConfigEPP';

type Props = {}

const Epp = (props: Props) => {
  return (
    <div className='d-flex w-100 flex-grow-1 overflow-hidden'>
        <NavBar list={listPathEPP} />
        <div className="d-flex flex-column align-items-center justify-content-center overflow-auto text-white w-100" >
            <h1 className="display-6">Bem vindo(a) ao EPP (Encomendas PegPese)</h1>
            <i>Navegue pelo menu lateral.</i>
        </div>
    </div>
  )
}


export default Epp;