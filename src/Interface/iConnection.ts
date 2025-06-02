export interface ConnectionContextProps {
    fetchData: (req: iReqConn) => Promise<any>;
    isLogged: boolean;
    setIsLogged: (isLogged: boolean) => void;
}
export interface iReqConn {
    method?: "GET" | "POST" | "PUT" | "DELETE"; params: null | {}; pathFile: string; appId?: string; urlComplement?: string;port?: string, exception?:string[]
}