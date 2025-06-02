import React from 'react';
import { tCardUser } from '../../../types/types';

const logo = require('../../../Assets/Image/groupCLPP.png');

export default function CardUser(props: tCardUser): JSX.Element {
    return (
        <div className={`cardContact border rounded my-2 overflow-hidden`}>
            <div className='d-flex align-items-center w-100 p-2'>
                <header className='overflow-hidden rounded-circle object-fit-cover'>
                    <img src={props.photo ? `data:image/png;base64,${props.photo}` : logo} />
                </header>
                <div className='d-flex flex-column align-items-start mx-2 overflow-hidden text-nowrap'>
                    <Details />
                </div>
                {props.isSend &&
                    <button title="Abrir mensagens" onClick={async () => {
                        if (props.openMessage) {
                            props.openMessage(props);
                        }
                    }} className='btn'>
                        <IconButton {...props} />
                    </button>
                }
            </div>
        </div>
    );

    function Details() {
        const fullInfo = !(props.inName || props.inStore || props.inDepartament || props.inSubDepartament);
        const datas = [
            { item: { label: "Nome", value: props.name || "N/P" }, id: props.id || "0", show: (fullInfo || props.inName) },
            { item: { label: "Loja", value: props.shop || "N/P" }, id: props.id || "0", show: (fullInfo || props.inStore) },
            { item: { label: "Departamento", value: props.departament || "N/P" }, id: props.id || "0", show: (fullInfo || props.inDepartament) },
            { item: { label: "Subdepartamento", value: props.sub || "N/P" }, id: props.id || "0", show: (fullInfo || props.inSubDepartament) },
        ]

        return (
            <React.Fragment>
                {
                    datas.map((element) => element.show && <BuildSpan key={`info_car_user_${element.id}_${element.item.label}`} {...element.item} />)
                }
            </React.Fragment>
        )
    }
    function BuildSpan(item: any) {
        return (
            <span>
                <strong >{item.label}: </strong> {item.value}
            </span>
        )
    }

}
function IconButton(value: tCardUser): JSX.Element {
    let icon: string = '';
    if (value.yourContact) {
        if (value.notification == 1) {
            icon = 'fa-solid fa-envelope'
        } else {
            icon = 'fa-solid fa-envelope-open-text'
        }
    } else {
        icon = 'fa-solid fa-paper-plane';
    }
    return (<i className={icon}></i>)
}