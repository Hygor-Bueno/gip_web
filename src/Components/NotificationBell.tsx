import React, { useState, useEffect } from "react";
import { useWebSocket } from "../Modules/GTPP/Context/GtppWsContext";


export default function NotificationBell(props: { idTask?: number }): JSX.Element {
    const { notifications, setNotifications } = useWebSocket();
    const [isHovered, setIsHovered] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(props.idTask ? notifications.filter(item => item.task_id == props.idTask).length : notifications.length)
    }, [notifications]);

    const handleClick = () => {
        alert(
            `Mensagens:\n${(props.idTask ? notifications.filter(item => item.task_id == props.idTask) : notifications)
                .map((n) => `- ${n.title}: ${n.message}`)
                .join("\n") || "Sem notificações"}`
        );

        setNotifications(props.idTask ? notifications.filter(item => item.task_id != props.idTask) : []);
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center position-relative"
            style={{ width: "fit-content", cursor: "pointer" }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ícone do Sino */}
            <i
                className={`fa-solid fa-bell`}
                style={{
                    // fontSize: "calc(0.2rem + 1vw)", // Responsivo: aumenta conforme o tamanho da tela
                    color: notifications.length > 0 ? "red" : "gray",
                    transition: "color 0.3s"
                }}
            ></i>
            {/* Contador de Notificações */}
            {count > 0 && (
                <span
                    className="position-absolute"
                    style={{
                        top: "-10px", // Ajuste para ficar acima do sino
                        right: "-4px", // Posicionado no lado direito
                        backgroundColor: isHovered ? "#ffc107" : "#dc3545",
                        color: "white",
                        fontSize: "calc(0.6rem + 0.2vw)", // Responsivo
                        minWidth: "20px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%", // Garante formato circular
                    }}
                >
                    {count}
                </span>
            )}
        </div>
    );
    
};


