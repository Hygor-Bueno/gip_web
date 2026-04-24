import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useMyContext } from './MainContext';
import WebSocketCLPP from '../Services/Websocket';
import { iSender, iUser, iWebSocketContextType } from '../Interface/iGIPP';
import ContactList from '../Modules/CLPP/Class/ContactList';
import { handleNotification } from '../Util/Utils';
import { useConnection } from './ConnContext';
import Contact from '../Class/Contact';
import User from '../Class/User';


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
        })();
        return clearChatAll();
    }, [userLog]);

    function clearChatAll() {
        closeChat();
        changeChat();
    }
    // Garante a atualização do callback.
    useEffect(() => {
        ws.current.callbackOnMessage = callbackOnMessage;
    }, [idReceived, listMessage, contactList]);

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
        if (contact.yourContact == 0 || contact.notification == undefined) contact.yourContact = 1;
        if (contact.notification == 0 || contact.notification == undefined) contact.notification = 1;
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

    function changeListContact(user: User) {
        setContactList((prev) => {
            const newList = [...prev];
            const idx = newList.findIndex((item: iUser) => item.id == user.id);
            if (idx === -1) {
                const added = user as Contact;
                added.notification = 0;
                added.yourContact = 1;
                newList.push(added);
            } else {
                newList[idx].notification = 0;
                newList[idx].yourContact = 1;
            }
            setContNotify(newList.filter(item => item.notification == 1).length);
            return newList;
        });
    }

    async function buildContactList() {
        try {

            let contacts = new ContactList();
            const req: any = await contacts.loadListContacts();
            if (req.error) throw new Error(req.message);
            setContactList([...req.data]);
            setContNotify(req.data.filter((item: any) => item.notification == 1).length);
        } catch (error) {
            console.error(error)
        }
    }
    async function resolveSenderName(sendUserId: number): Promise<{ name: string; photo?: string }> {
        const existing = contactList.find((c) => c.id == sendUserId);
        if (existing?.name) return { name: existing.name, photo: existing.photo };
        try {
            const sender = new User({ id: sendUserId });
            await sender.loadInfo(false);
            return { name: sender.name || `Usuário ${sendUserId}`, photo: sender.photo };
        } catch {
            return { name: `Usuário ${sendUserId}` };
        }
    }

    function showBrowserNotification(title: string, body: string, photo?: string) {
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;
        if (typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus()) return;
        try {
            const options: NotificationOptions = { body, tag: "CLPP", renotify: true } as NotificationOptions;
            if (photo) options.icon = photo.startsWith("data:") ? photo : `data:image/png;base64,${photo}`;
            new Notification(title, options);
        } catch (error) {
            console.error("Falha ao exibir notificação do navegador:", error);
        }
    }

    async function receivedMessage(event: any) {
        const { send_user } = event;
        const sendUserId = parseInt(send_user);
        if (sendUserId == idReceived) {
            setListMessage((prev) => [...prev, {
                id: event.id,
                id_user: event.send_user,
                message: event.message,
                notification: 0,
                type: event.type,
                date: event.date
            }]);
            await ws.current.informPreview(send_user.toString());
        } else {
            setHasNewMessage(true);
            const { name, photo } = await resolveSenderName(sendUserId);
            const isTextType = !event.type || event.type == 1;
            const bodyText = isTextType && event.message ? event.message : "enviou um anexo";
            showBrowserNotification(
                `${name} enviou uma mensagem`,
                bodyText.length > 120 ? `${bodyText.slice(0, 117)}...` : bodyText,
                photo
            );
            setContactList((prev) => {
                const existing = prev.find((c) => c.id == sendUserId);
                let nextList: Contact[];
                if (existing) {
                    nextList = prev.map((contact) => contact.id == sendUserId ? updateContact(contact) : contact);
                } else {
                    const fresh = new Contact({ id: sendUserId, yourContact: 1, notification: 1 });
                    fresh.name = name;
                    if (photo) fresh.photo = photo;
                    nextList = [...prev, fresh];
                }
                setContNotify(nextList.filter((item: any) => item.notification == 1).length);
                return nextList;
            });
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