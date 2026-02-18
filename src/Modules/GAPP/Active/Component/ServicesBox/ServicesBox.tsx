import React from 'react';

interface iServecesBox {
    setOpenModal: any;
}

const ServicesBox = ({setOpenModal}: iServecesBox) => {
    return (
        <div onClick={() => setOpenModal?.(false)} className="position-absolute top-0 start-0 vw-100 vh-100 bg-dark bg-opacity-25 d-flex flex-column align-items-center justify-content-center" >
            <div onClick={(e) => e.stopPropagation()} className="bg-white container h-50 w-50 overflow-auto p-4 rounded shadow">
                <h2 className="color-gipp-head text-white p-2 rounded-top">Menu de escolha</h2>
                <div className="d-flex gap-2 align-items-center h-75 w-100 justify-content-center">
                    <button className="btn color-gipp btn-lg px-5" onClick={() => console.log('info')}>
                        <i className="fa fa-solid fa-info text-white"></i>
                    </button>
                    <button className="btn color-gipp btn-lg px-5" onClick={() => console.log('info')}>
                        <i className="fa fa-solid fa-edit text-white"></i>
                    </button>
                    <button className="btn color-gipp btn-lg px-5" onClick={() => console.log('info')}>
                        <i className="fa fa-solid fa-plus text-white"></i>
                    </button>
                    <button className="btn color-gipp btn-lg px-5" onClick={() => console.log('info')}>
                        <i className="fa fa-solid fa-power-off text-white"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ServicesBox;