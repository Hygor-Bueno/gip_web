import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../Context/WsContext';
import './Clpp.css';
import { useMyContext } from '../../Context/MainContext';
import User from '../../Class/User';
import CardUser from './Components/CardUser';
import ChatWindow from './Chat/ChatWindow';
import Contacts from './Components/Contacts';
import soundFile from '../../Assets/Sounds/notify_CLPP.mp3';
// import soundFile from "../../../Assets/Sounds/notify_CLPP.mp3";
export default function Clpp(): JSX.Element {
    const [openChat, setOpenChat] = React.useState<boolean>(false)
    const [isConverse, setIsConverse] = React.useState<boolean>(true);
    const [detailsChat, setDetailsChat] = React.useState<boolean>(false);
    const [chat, setChat] = React.useState<boolean>(false);
    const { userLog } = useMyContext();
    const { ws, contactList, changeListContact, idReceived, setIdReceived, closeChat, hasNewMessage, setHasNewMessage, contNotify } = useWebSocket();
    const [blink, setBlink] = useState(false);
    const [audio] = useState(new Audio(soundFile));

    useEffect(() => {
        // Solicitar permissão para notificações
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permissão para notificações concedida');
                }
            });
        }
    }, []);

    useEffect(() => {
        if (hasNewMessage) {
            // Reproduzir o áudio
            // audio.play().catch((error) => {
            //     console.error('Erro ao reproduzir o som:', error);
            // });;

            setBlink(true);
            const timer = setInterval(() => {
                setBlink((prev) => !prev);
            }, 1000); // Alterna a cada 500ms

            setTimeout(() => {
                clearInterval(timer);
                setBlink(false);
                setHasNewMessage(false);
            }, 6000); // Pisca por 3 segundos
        }
    }, [hasNewMessage, audio]);


    return (
        <div id='moduleCLPP' className={`${openChat ? 'cardContactBtn' : null}`}>
            {
                openChat &&
                <div className='bg-white p-2 rounded d-flex flex-column shadow'>
                    <header className='d-flex flex-column align-items-center'>
                        <div className='d-flex justify-content-between align-items-center bg-light w-100 rounded p-2'>
                            <div>
                                <i className={`fa-solid fa-comments`}></i> Chat Log Peg Pese - CLPP
                            </div>
                            <i onClick={() => setDetailsChat(!detailsChat)} className={`btn text-primary fa-solid fa-circle-info`}></i>
                        </div>
                        {detailsChat && <CardUser openMessage={openMessage} {...userLog} name={userLog.name} />}

                    </header>

                    <section className='d-flex justify-content-between h-100 overflow-hidden'>
                        {
                            chat ?
                                <ChatWindow idReceived={idReceived} onClose={() => {
                                    setChat(false);
                                    closeChat();
                                }} />
                                :
                                <Contacts setIsConverse={() => setIsConverse(!isConverse)} isConverse={isConverse} contactList={contactList} openMessage={openMessage} />
                        }
                    </section>
                </div>
            }
            {
                contNotify > 0 ?
                    <span className='bg-danger position-absolute top-0 end-0 h6 text-white p-1 rounded-circle'>
                        {contNotify.toString().padStart(2, '0')}
                    </span>
                    :
                    <React.Fragment />
            }
            <button title="Abrir chat" className={`btn fa-solid my-2 ${blink ? 'opacity-25' : 'opacity-100'} ${openChat ? 'fa-xmark' : 'fa-comments'}`} onClick={async () => {
                setOpenChat(!openChat);
                closeChat();
                setChat(false);
            }}>
            </button>
        </div>
    );

    async function openMessage(user: User) {
        await ws.current.informPreview(user.id.toString());
        changeListContact(user);
        setChat(true);
        setIdReceived(user.id);
    }
}