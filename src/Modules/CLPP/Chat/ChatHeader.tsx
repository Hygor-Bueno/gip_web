import { useEffect, useState } from "react";
import { useWebSocket } from "../../../Context/WsContext";
import User from "../../../Class/User";
import CardUser from "../Components/CardUser";
import { iUser } from "../../../Interface/iGIPP";

export default function ChatHeader(props: { onClose: (value?: any) => void }) {
    const { changeChat, idReceived, contactList } = useWebSocket();
    const [user, setUser] = useState<iUser>();
    //Busca os dados do colaborador que estamos conversando.
    useEffect(() => {
        const filterUser = contactList.filter(item => item.id == idReceived);
        if (filterUser.length > 0) {
            setUser(filterUser[0]);
        }
    }, [idReceived, contactList]);


    return (
        <header className="my-2 text-end">
            <div >
                <CardUser {...user} name={user?.name || ""} />
            </div>
            <i onClick={() => {
                changeChat();
                props.onClose();
            }} className="fa-solid fa-rotate-left text-danger text-end"> Voltar</i>
        </header>
    )
}