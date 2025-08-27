import React, { useEffect } from 'react';
import Clpp from '../Modules/CLPP/Clpp';
import { useMyContext } from '../Context/MainContext';
import CardUser from '../Modules/CLPP/Components/CardUser';
import { classToJSON, cleanLocalStorage, fetchDataFull } from '../Util/Util';
import { useWebSocket } from '../Context/WsContext';
import SendMessage from '../Modules/CLPP/Class/SendMessage';
import { useNavigate } from 'react-router-dom';

type Props = {
    children: JSX.Element; // Tipo para o children
}
export default function RenderedModules(props: Props): JSX.Element {
    const { statusDevice } = useMyContext();
    const {  ws } = useWebSocket();
    const { userLog } = useMyContext();
    const navigate = useNavigate();
    return (
        <div className='d-flex flex-row w-100 h-100 overflow-hidden'>
            {
                /*statusDevice !== 0*/ true ?
                    <React.Fragment>
                        {props.children}
                        <Clpp />
                    </React.Fragment>
                    :
                    <div className='d-flex align-items-center justify-content-center flex-column w-100 flex-grow-1'>
                        <div className='bg-white rounded overflow-auto p-2 d-flex flex-column align-items-center justify-content-center'>
                            <div className='d-flex align-items-center justify-content-between w-100'>
                                <h1><strong>Atenção!</strong></h1>
                                <button onClick={()=>{
                                    cleanLocalStorage();
                                    navigate("/");
                                    }} type="button" title='Sair da aplicação' className='my-2 btn btn-dark fa-solid fa-xmark'></button>
                            </div>
                            <CardUser {...userLog} name={userLog?.name || ""} />
                            <div>
                                <p>Dispositivo não homologado.</p>
                                <p>Clique no botão abaixo para solicitar a liberação.</p>
                            </div>
                            <button onClick={() => requestAccess()} type="button" title='Solicitar liberação' className='my-2 btn btn-success fa-solid fa-check'></button>
                        </div>
                    </div>
            }            
        </div>
    );

    async function requestAccess() {
        try {
            const req: any = await fetchDataFull({
                method: "POST",
                params: classToJSON(new SendMessage(`Automático: Olá, poderia liberar meu dispositivo por gentileza? Token: ${localStorage.device_id}`, 148, userLog.id, 1)),
                pathFile: "CLPP/Message.php"
            });
            if (req.error) throw new Error(req.message);
            ws.current.informSending(2, "148", req.last_id);
        } catch (error:any) {
            console.error(error.message);
        }
    }
}
