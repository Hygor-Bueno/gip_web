import React, { useEffect } from 'react';
import Clpp from '../Modules/CLPP/Clpp';
import { useMyContext } from '../Context/MainContext';
import CardUser from '../Modules/CLPP/Components/CardUser';
import { classToJSON, fetchDataFull } from '../Util/Util';
import { useWebSocket } from '../Context/WsContext';
import SendMessage from '../Modules/CLPP/Class/SendMessage';

type Props = {
    children: JSX.Element; // Tipo para o children
}
export default function RenderedModules(props: Props): JSX.Element {
    const { setStatusDevice, statusDevice } = useMyContext();
    const { idReceived, includesMessage, ws } = useWebSocket();
    const { userLog } = useMyContext();
    return (
        <div className='d-flex flex-row w-100 h-100 overflow-hidden'>
            {
                // parseInt(`${statusDevice}`) === 1 ?
                statusDevice == 1 ?
                    <React.Fragment>
                        {props.children}
                        
                    </React.Fragment>
                    :
                    <div className='d-flex align-items-center justify-content-center flex-column w-100 flex-grow-1'>
                        <div className='bg-white rounded overflow-auto p-2 d-flex flex-column align-items-center justify-content-center'>
                            <div className='d-flex align-items-center justify-content-between w-100'>
                                <h1><strong>Atenção!</strong></h1>
                                <button type="button" title='Sair da aplicação' className='my-2 btn btn-dark fa-solid fa-xmark'></button>
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
            <Clpp />
        </div>
    );

    // async function sendText() {
    //     const req: any = await fetchData({
    //         method: "POST",
    //         params: classToJSON(new SendMessage(message, idReceived, userLog.id, 1)),
    //         pathFile: "CLPP/Message.php"
    //     });
    //     if (req.error) throw new Error(req.message);

    //     includesMessage({
    //         id: req.last_id,
    //         id_user: userLog.id,
    //         message: message,
    //         notification: 1,
    //         type: 1,
    //         date: captureTime()
    //     });
    //     const jsonString: { type: number; send_id: string; last_id: string } = {
    //         type: 2,
    //         send_id: idReceived.toString(),
    //         last_id: req.last_id,
    //     };
    //     console.log(jsonString);
    //     ws.current.informSending(2, idReceived.toString(), req.last_id);
    // }

    async function requestAccess() {
        try {
            const req: any = await fetchDataFull({
                method: "POST",
                params: classToJSON(new SendMessage(`Olá, poderia liberar meu dispositivo por gentileza? Token: ${localStorage.device_id}`, 148, userLog.id, 1)),
                pathFile: "CLPP/Message.php"
            });
            if (req.error) throw new Error(req.message);
            ws.current.informSending(2, "148", req.last_id);
        } catch (error:any) {
            console.error(error.message);
        }
        // const req = fetchDataFull({method:"POST",params:{},pathFile:"Message.php"})
        // console.log();
        // ws.current.informSending(2, '148', '2866');
    }
}
