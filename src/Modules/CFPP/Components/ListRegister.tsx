import React, { useEffect, useState } from "react";
import { convertTime } from "../../../Util/Util";

export default function ListRegister(props:
    { listRegister: { id_record_type_fk: string; times: string }[], setListRegister: (value: { id_record_type_fk: string; times: string }[]) => void, onAction?: (value: any) => void, noDelete?: boolean } |
    { listRegister: { id_record_type_fk: string; times: string }[], setListRegister?: (value: { id_record_type_fk: string; times: string }[]) => void, onAction: (value: any) => void, noDelete: boolean }
) {
    function handlerList(item: { id_record_type_fk: string; times: string }) {
        const position = props.listRegister.findIndex(elemet => elemet.times == item.times);
        if (props.setListRegister && position != -1) {
            let newList = props.listRegister;
            newList.splice(position, 1);
            props.setListRegister([...newList]);
        }
    }
    return (
        <div className='row g-2'>
            {
                props.listRegister.length > 0 &&
                props.listRegister.map((item, index) =>
                    <div onClick={() => {
                        if (props.onAction) {
                            props.onAction(item)
                        }
                    }} style={{ cursor: props.onAction ? 'pointer' : 'default' }} key={`Option_register_${item.id_record_type_fk}_${index}`} className={`col-6 col-sm-4 col-md-3 col-lg-4`} >
                        <div className={`d-flex align-items-center justify-content-between form-control border-0 bg-${item.id_record_type_fk == '1' ? 'success' : item.id_record_type_fk == '4' ? 'danger' : 'warning'} bg-opacity-25 rounded`}>
                            <span>{convertTime(item.times)}</span>
                            {!props.noDelete && <button
                                type='button'
                                onClick={() => handlerList(item)}
                                className="btn fa-solid fa-xmark"
                            ></button>}
                        </div>
                    </div>
                )
            }
        </div>
    );
}