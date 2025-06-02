import { useState, useEffect } from "react";
import { isTokenExpired } from "../Util/Util";
import { useMyContext } from "../Context/MainContext";

interface SessionTimerProps {
    expirationDate: string;
    loggedAt: string;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ expirationDate, loggedAt }) => {
    const { loadDetailsToken } = useMyContext();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expirationDate || !loggedAt) {
            logout();
            return;
        }

        const expirationTime = new Date(expirationDate).getTime();
        const loginTime = new Date(loggedAt).getTime();
        let remainingTime = expirationTime - loginTime;

        if (remainingTime <= 0 || isTokenExpired(expirationDate)) {
            logout();
            return;
        }

        setTimeLeft(remainingTime);

        const updateTimer = () => {
            const interval = 300000
            remainingTime -= interval; // Reduz cinvo minuto
            setTimeLeft((prev) => Math.max(0, prev - interval));

            if (remainingTime <= 0) {
                logout();
            } else {
                setTimeout(updateTimer, interval); // Chama novamente após cinco min
            }
        };

        const timeout = setTimeout(updateTimer, 300000);

        return () => clearTimeout(timeout);
    }, [expirationDate, loggedAt]);

    const logout = async () => {
        await loadDetailsToken();
    };

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        // const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours.toString().padStart(2, "0")}h${minutes.toString().padStart(2, "0")}`;
    };

    return (
        <div style={{ width: "78px" }} className="d-flex bg-secondary flex-column rounded p-1 mx-0">
            <div className="d-flex justify-content-between w-100">
                <span className="text-white h6 m-0">{formatTime(timeLeft)}</span>
                <i className="d-flex align-items-center fa-solid fa-clock text-white h6 m-0"></i>
            </div>
        </div>
    );
};

export default SessionTimer;
