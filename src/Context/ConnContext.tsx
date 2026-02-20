import { createContext, useContext, useState } from "react";
import { fetchDataFull, FetchDownload, formDataFetch } from "../Util/Util";
import { ConnectionContextProps, iReqConn } from "../Interface/iConnection";


const ConnectionContext = createContext<ConnectionContextProps | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLogged, setIsLogged] = useState<boolean>(true);
    const fetchData = async (req: iReqConn) => {        
            const request = await fetchDataFull(req);
            if(request.error && request.message){
                const tokenExpired = request.message.toLowerCase().includes('authorization denied') || request.message.toLowerCase().includes('time expired token 24rs limit');
                if(tokenExpired && isLogged){
                    setIsLogged(false);
                    localStorage.clear();
                }
            }
            return request
    };

    const DataFetchForm = async (req: iReqConn) => {        
            const request = await formDataFetch(req);
            if(request.error && request.message){
                const tokenExpired = request.message.toLowerCase().includes('authorization denied') || request.message.toLowerCase().includes('time expired token 24rs limit');
                if(tokenExpired && isLogged){
                    setIsLogged(false);
                    localStorage.clear();
                }
            }
            return request
    };

    const DownloadFile = async (req: iReqConn) => {        
            const request = await FetchDownload(req);
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
        <ConnectionContext.Provider value={{ fetchData, isLogged, setIsLogged, DataFetchForm, DownloadFile }} >
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
