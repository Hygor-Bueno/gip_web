import React from "react";
import StructureModal from "../../../Components/CustomModal";
import { useWebSocket } from "../../../Context/WsContext";
const logo = require("../../../Assets/Image/peg_pese_loading.png");

export default function ChatLoading() {
    const { msgLoad } = useWebSocket();
    return msgLoad ? (
        <StructureModal className="StructureModal ModalBgWhite">
            <div className="d-flex flex-column align-items-center">
                <img className="spinner-grow-img" src={logo} alt="Logo Peg Pese" />
            </div>
        </StructureModal>
    ) : <React.Fragment />
}