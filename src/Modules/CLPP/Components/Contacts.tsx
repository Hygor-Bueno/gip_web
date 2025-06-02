import React, { ChangeEvent, useEffect, useState } from "react";
import SearchUser from "../../../Components/SearchUser";
import { useMyContext } from "../../../Context/MainContext";
import CardUser from "./CardUser";
import User from "../../../Class/User";

export default function Contacts(props: {
    setIsConverse: () => void;
    isConverse: boolean;
    contactList: any[];
    openMessage: (value: any) => void;
}) {
    const { setCtlSearchUser, setAppIdSearchUser } = useMyContext();
    const [contacts, setContacts] = useState<any>([]);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        setContacts(
            props.contactList
                .filter((item) => item.yourContact === (props.isConverse ? 1 : undefined) && item.name.toUpperCase().includes(searchName))
                .sort((a: User, b: User) => {

                    const valueA = a.notification ?? 0;
                    const valueB = b.notification ?? 0;
                    return valueB - valueA;
                })
        );
    }, [props.contactList, searchName]);

    return (
        <div className="d-flex flex-column h-100 w-100">
            {/* Cabeçalho com SearchUser e botão */}
            <div className="flex-shrink-0">
                <SearchUser
                    onClose={(items) => {
                        if (items.length > 0) props.openMessage(items[0]);
                    }}
                    maxSelection={1}
                    selectionKey="employee_id"
                />
                <div className="d-flex justify-content-between my-2">
                    <div className="d-flex align-items-center gap-2 w-75">
                        <label htmlFor="nameUserCLPP" className="fa-solid fa-magnifying-glass"></label>
                        
                        <input
                            type="text"
                            id="nameUserCLPP"
                            placeholder="Nome do colaborador"
                            value={searchName}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchName(event.target.value.toLocaleUpperCase())}
                            className="form-control"
                        />
                    </div>
                    <button
                        type="button"
                        title="Contatos do Chat"
                        onClick={() => {
                            setAppIdSearchUser(7);
                            setCtlSearchUser(true);
                        }}
                        className="btn btn-primary fa-solid fa-address-book"
                    ></button>
                </div>
            </div>

            {/* Lista de contatos com altura calculada e scroll */}
            <div
                className="overflow-auto flex-grow-1"
                style={{ minHeight: 0 }}
            >
                {contacts.map((item: any) => (
                    <CardUser
                        openMessage={props.openMessage}
                        key={`contact_${item.id}`}
                        {...item}
                        name={item.name}
                        yourContact={item.yourContact || 0}
                        isSend={true}
                        notification={item.notification}
                        id={item.id}
                    />
                ))}
            </div>
        </div>
    );
}