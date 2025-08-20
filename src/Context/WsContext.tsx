import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useMyContext } from './MainContext';
import WebSocketCLPP from '../Services/Websocket';
import { iSender, iUser, iWebSocketContextType } from '../Interface/iGIPP';
import ContactList from '../Modules/CLPP/Class/ContactList';
import { handleNotification } from '../Util/Util';
import { useConnection } from './ConnContext';
import Contact from '../Class/Contact';


const WebSocketContext = createContext<iWebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    //Variáveis do chat
    const [idReceived, setIdReceived] = React.useState<number>(0);
    const [pageLimit, setPageLimit] = useState<number>(1);
    const [page, setPage] = useState<number>(1);
    const previousScrollHeight = useRef<number>(0);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [listMessage, setListMessage] = useState<{ id: number, id_user: number, message: string, notification: number, type: number, date: string }[]>([]);
    function closeChat() {
        setIdReceived(0);
        setPageLimit(1);
        setPage(1);
        setListMessage([]);
        if (previousScrollHeight.current) previousScrollHeight.current = 0;
    }

    //Variáveis dos contatos
    const [msgLoad, setMsgLoad] = useState<boolean>(true);
    const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
    const [contactList, setContactList] = useState<Contact[]>([]);
    const [sender, setSender] = useState<iSender>({ id: 0 });
    const [contNotify, setContNotify] = useState<number>(0);

    const { setLoading, userLog } = useMyContext();
    const { fetchData } = useConnection();
    const ws = useRef(new WebSocketCLPP(localStorage.getItem("tokenGIPP"), callbackOnMessage));

    useEffect(() => {
        // Abre a coonexão com o websocket.
        (async () => {
            try {
                if (localStorage.tokenGIPP && ws.current && !ws.current.isConnected) {
                    ws.current.connectWebSocket();
                }
            } catch (error: any) {
                handleNotification("Erro no Ws Principal", error.message, "danger");
            }
        })();
        //Carrega a sua lista de contato.
        (async () => {
            if (userLog.id > 0) {
                setLoading(true);
                await buildContactList();
                setLoading(false);
            }
        }
        )();
        return clearChatAll();
    }, [userLog]);
    function clearChatAll() {
        closeChat();
        changeChat();
    }
    // Garante a atualização do callback.
    useEffect(() => {
        ws.current.callbackOnMessage = callbackOnMessage;
    }, [idReceived, listMessage]);

    useEffect(() => {
        const fetchMessages = async () => {
            setMsgLoad(true);
            try {
                if (idReceived) {
                    const req = await loadMessage();
                    if (req.error) throw new Error(req.message);
                    setPageLimit(req.pages);
                    setListMessage(reloadList(req.data.reverse()));
                }
            } catch (error: any) {
                if (!error.message.includes("No data")) console.error(error);
            }
            setMsgLoad(false);
        };

        fetchMessages();
    }, [page, idReceived]);

    function includesMessage(message: { id: number, id_user: number, message: string, notification: number, type: number, date: string }) {
        listMessage.push(message);
        setListMessage([...listMessage]);
        if (messagesContainerRef.current) {
            if (messagesContainerRef.current.scrollTop === 0 && page < pageLimit) {
                previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
            }
        }
    }

    // Verifica quando o usuário rola até o topo
    function handleScroll() {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                if (messagesContainerRef.current.scrollTop === 0 && page < pageLimit) {
                    previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
                    setPage(page + 1);
                }
            }
        }, 250);
    };

    async function loadMessage(): Promise<{ error: boolean, message?: string, data?: any, pages: number }> {
        const listMessage: { error: boolean, message?: string, data?: any, pages: number } = await fetchData({ method: "GET", params: null, pathFile: "CLPP/Message.php", urlComplement: `&pages=${page}&id_user=${userLog.id}&id_send=${idReceived}` })
            || { error: true, message: 'fail', pages: 1 };
        return listMessage;
    }

    function reloadList(pList: any[]): any[] {
        const newList: any = [...listMessage];
        newList.unshift(...pList);
        return newList;
    }

    function changeChat() {
        setIdReceived(0);
        setPage(1);
        setListMessage([]);
    }

    // Função para atualizar contato com base no evento
    function updateContact(contact: Contact) {
        if (contact.yourContact === 0 || contact.notification === undefined) contact.yourContact = 1;
        if (contact.notification === 0 || contact.notification === undefined) {
            contact.notification = 1;
        }
        return contact;
    };

    async function callbackOnMessage(event: any) {
        if (event.objectType === 'notification') {
            if (event.notify && event.user == idReceived) {
                listMessage.forEach((item, index) => {
                    if (item.notification == 1) {
                        listMessage[index].notification = 0;
                    }
                });
                setListMessage([...listMessage]);
            }
        } else if (event.message && !event.error) {
            await receivedMessage(event);
        }
    }

    function changeListContact(id: number) {
        let newList = contactList;
        newList[newList.findIndex((item: iUser) => item.id == id)].notification = 0;
        newList[newList.findIndex((item: iUser) => item.id == id)].yourContact = 1;
        setContactList([...newList]);
        setContNotify(newList.filter(item => item.notification == 1).length);
    }

    async function buildContactList() {
        try {
            let contacts = new ContactList(userLog.id);
            const req: any = await contacts.loadListContacts();
            if (req.error) throw new Error(req.message);
            setContactList([...req.data]);
            setContNotify(req.data.filter((item: any) => item.notification == 1).length);
        } catch (error) {
            console.error(error)
        }
    }
    async function receivedMessage(event: any) {
        const { send_user } = event;
        if (parseInt(send_user) === idReceived) {
            listMessage.push({
                id: event.id,
                "id_user": event.send_user,
                "message": event.message,
                "notification": 0,
                "type": event.type,
                "date": event.date
            });
            setListMessage([...listMessage]);
            await ws.current.informPreview(send_user.toString())
        } else {
            setHasNewMessage(true);
            const upContact = contactList.map((contact) =>
                contact.id === send_user ? updateContact(contact) : contact
            );
            setContactList(upContact);
            setContNotify(upContact.filter((item: any) => item.notification == 1).length);
        }
    };

    return (
        <WebSocketContext.Provider value={{ previousScrollHeight, messagesContainerRef, listMessage, pageLimit, msgLoad, contactList, sender, ws, idReceived, page, hasNewMessage, contNotify, setHasNewMessage, closeChat, includesMessage, setPage, setIdReceived, setSender, setContactList, changeListContact, changeChat, handleScroll }}>
            {children}
        </WebSocketContext.Provider>
    );
};
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};