import React from "react";
import "./CardTask.css";
import NotificationBell from "../../../../Components/NotificationBell";
import ProgressBar from "../Modal/Progressbar";
import { useMyContext } from "../../../../Context/MainContext";
import { useWebSocket } from "../../Context/GtppWsContext";
import { DateConverter } from "../../Class/DataConvert";


type CardTaskProps = {
    title_card?: string;
    priority_card?: number;
    initial_date?: string;
    final_date?: string;
    percent?:number;
    create_by:number;
}

type DeadlineBadge = {
    label: string;
    className: string;
    icon: string;
} | null;

/**
 * Compara só a parte de data (YYYY-MM-DD), ignorando hora — alinha
 * "vence hoje" com a percepção do usuário (não com o instante exato).
 */
function buildDeadlineBadge(finalDate?: string, percent: number = 0): DeadlineBadge {
    if (!finalDate || percent >= 100) return null;
    const deadline = new Date(finalDate);
    if (Number.isNaN(deadline.getTime())) return null;
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadline.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) {
        const overdueBy = Math.abs(diffDays);
        return { label: `ATRASADA ${overdueBy}d`, className: "bg-danger text-white", icon: "fa-triangle-exclamation" };
    }
    if (diffDays === 0) return { label: "VENCE HOJE", className: "bg-warning text-dark", icon: "fa-clock" };
    if (diffDays <= 3) return { label: `VENCE EM ${diffDays}d`, className: "bg-warning text-dark", icon: "fa-clock" };
    return null;
}

type CardTaskAllPropsHTML = React.HTMLAttributes<HTMLDivElement> & {}

type PriorityCardResult = {
    color?: string;
    title?: string;
}

const CardTask: React.FC<CardTaskProps & CardTaskAllPropsHTML> = (props) => {
    const {userLog} = useMyContext();
    const { isAdm } = useWebSocket();

    const colorPriorityCard = (numberKey: Number | string = 0): PriorityCardResult => {
        switch (numberKey) {
            case 0: return { color: 'primary', title: 'baixa' }
            case 1: return { color: 'warning', title: 'media' }
            case 2: return { color: 'danger', title: 'Alta' }
            default: return { color: '', title: '' }
        }
    }

    let { color, title } = colorPriorityCard(props.priority_card);
    const deadlineBadge = isAdm ? buildDeadlineBadge(props.final_date, props.percent) : null;
    const isOverdue = deadlineBadge?.label.startsWith("ATRASADA");

    return (
        <div title={`Tarefa: ${props.title_card}`} {...props} className={`card-task-container modal-container modal-Xsmall cursor-pointer p-2${isOverdue ? " card-task--overdue" : ""}`}>
            <React.Fragment>
                <div className="d-flex justify-content-between align-items-start">
                    <h1 className="fw-bold card-text">#{props.id}</h1>
                    {deadlineBadge && (
                        <span
                            className={`badge ${deadlineBadge.className} d-inline-flex align-items-center gap-1`}
                            title={`Prazo: ${DateConverter.formatDate(props.final_date || "")}`}
                        >
                            <i className={`fa-solid ${deadlineBadge.icon}`}></i>
                            {deadlineBadge.label}
                        </span>
                    )}
                </div>
                <div className="card-task-header d-flex justify-content-between col-12 gap-3">
                    <div className="d-flex justify-content-between col-12 mb-2">
                        <h1 className="fw-bold card-text">{props.title_card || "Tarefa sem nome"}</h1>
                        <NotificationBell idTask={parseInt(props.id || '0')} />
                    </div>
                </div>
                <div className="card-task-body">
                    <div className="card-font-large">
                        <div className="d-flex justify-content-between flex-wrap">
                            <div><span className="fw-bold">Data Inicial:</span></div>
                            <div><p>{`${DateConverter.formatDate(props.initial_date || "2024-09-20")}`}</p></div>
                        </div>
                        <div className="d-flex justify-content-between flex-wrap">
                            <div><span className="fw-bold">Data Final:</span></div>
                            <div><p>{`${DateConverter.formatDate(props.final_date || "2024-09-20")}`}</p></div>
                        </div>
                    </div>
                </div>
                <div className="card-task-footer d-flex justify-content-between align-items-center">
                    <i className={`fa-solid  ${userLog.id == props.create_by? "fa-star text-warning":"fa-handshake text-muted"}`}></i>
                    <div className="flex-grow-1">
                        <ProgressBar progressValue={props.percent  || 0} colorBar="#006645" />
                    </div>
                    <div className={`card-task-priority bg-${color} text-white px-2 fw-bold rounded-4 font-small mt-2`}>{title}</div>
                </div>
            </React.Fragment>
        </div>
    );
};

export default CardTask;