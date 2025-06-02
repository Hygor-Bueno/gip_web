
import React from 'react';
import { useMyContext } from '../Context/MainContext';
import { ReactNotifications } from 'react-notifications-component';
import SessionTimer from './SessionTimer';
import { useConnection } from '../Context/ConnContext';

type Props = {
  children: JSX.Element; // Tipo para o children
}
export default function RenderPage(props: Props): JSX.Element {
  const { titleHead, token } = useMyContext();
  const { isLogged } = useConnection();
  return (
    <div className="App">
      <header className="App-header py-1 d-flex px-2 d-flex justify-content-between ">
        <div className='d-flex flex-row align-items-center'>
          <label className={titleHead.icon}></label>
          <h1 className='mx-2 d-none d-md-block'>{titleHead.title}</h1>
          <h1 className='mx-2 d-md-none'>{titleHead.simpleTitle}</h1>
        </div>
        {isLogged && <SessionTimer expirationDate={token.expiration_date} loggedAt={token.logged_at} />}
      </header>
      <section className='d-flex flex-column align-items-center justify-content-center'>
        {props.children}
      </section>
      <ReactNotifications />
      {/* <footer>
        © Peg Pese Supermercados Importação e Exportação Ltda. Desenvolvido por Hygor Bueno
      </footer> */}
    </div>
  );
}