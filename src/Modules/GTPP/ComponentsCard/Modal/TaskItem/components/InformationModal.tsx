import React from "react";

const ModalInformation = (props: any) => {
    return (
        <div className="cloud-balloon rounded p-2">
        <div>
            {
            props.description.split("\r").map((linha: any, idx: any) => (
                <p key={idx} className="mb-1">{linha}</p>
            ))
            }
        </div>
        <footer className="d-flex align-items-center justify-content-center h-25 ">
            <button onClick={() => props.onClose(props.task)} title="fechar" className="d-block btn btn-danger mt-3">Fechar</button>
        </footer>
        </div>
    );
};


export default ModalInformation;