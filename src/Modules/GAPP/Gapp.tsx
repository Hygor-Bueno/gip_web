import React, { useState, useEffect } from "react";
import NavBar from "../../Components/NavBar";
import { listPathGAPP } from "./ConfigGapp";

export default function Gapp(): JSX.Element {
    return (
        <div className="d-flex w-100 flex-grow-1 overflow-hidden">
            <NavBar list={listPathGAPP} />
            <div className="d-flex flex-column align-items-center justify-content-center overflow-auto text-white w-100" >
                <h1 className="display-6">Bem vindo(a) ao GAPP</h1>
                <i>Navegue pelo menu lateral.</i>
            </div>
        </div>
    );
}


