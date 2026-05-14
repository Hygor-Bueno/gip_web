import { createContext, useContext, useState } from "react";
import { fetchDataFull } from "../Util/Utils";
import { ConnectionContextProps, iReqConn } from "../Interface/iConnection";


const ConnectionContext = createContext<ConnectionContextProps | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLogged, setIsLogged] = useState<boolean>(true);
    const fetchData = async (req: iReqConn) => {
            const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
            const request = await fetchDataFull(req);
            try {
                const ms = Math.round(((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0));
                if (process.env.NODE_ENV === "development" && typeof window !== "undefined" && window.__gippPerf) {
                    window.__gippPerf.markFetch(ms);
                }
            } catch { /* noop */ }
            if(request.error && request.message){
                const tokenExpired = request.message.toLowerCase().includes('authorization denied') || request.message.toLowerCase().includes('time expired token 24rs limit');
                if(tokenExpired && isLogged){
                    setIsLogged(false);
                    localStorage.clear();
                }
            }
            return request
    };

    return (
        <ConnectionContext.Provider value={{ fetchData, isLogged, setIsLogged }} >
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error("useConnection must be used within a ConnectionProvider");
    }
    return context;
};
