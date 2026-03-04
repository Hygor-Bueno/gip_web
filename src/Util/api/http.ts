import { iReqConn } from "../../Interface/iConnection";
import Translator from "../Translate";
import { handleNotification } from "../ui/notifications";

const baseURLSgpp = process.env.REACT_APP_API_SGPP_BASE_URL;

function settingUrl(middlewer: string, params?: string, port?: string) {
    const portGipp = process.env.REACT_APP_API_GIPP_PORT_SERVER_DEFAULT;
    const baseURLGipp = process.env.REACT_APP_API_GIPP_BASE_URL;
    const httpDefault = `${baseURLGipp}:${port || portGipp}`;
    const server = `${httpDefault}`;
    return server + middlewer + (params ? params : "");
}

function checkedExceptionError(message: string, exceptions?: string[]): boolean {
    let result = true;
    if (exceptions) {
        exceptions.forEach(exception => {
            if (exception.toLowerCase().includes(message.toLocaleLowerCase())) result = false;
        })
    }
    return result;
}

export async function fetchNodeDataFull(req: iReqConn, headers?: Record<string, string>) {
    let result: { error: boolean, message?: string, data?: any } = { error: true, message: "Generic Error!" };
    try {
        const URL = `${baseURLSgpp}:${req.port}${req.pathFile}${req.urlComplement ? req.urlComplement : ""}`;
        let objectReq: any = { method: req.method };
        if (headers) objectReq.headers = headers;
        if (req.params) objectReq.body = JSON.stringify(req.params);
        const response = await fetch(URL, objectReq);
        const body = await response.json();
        result = body;
        if (body.error) throw new Error(body.message);
    } catch (messageErr: any) {
        const translate = new Translator(messageErr.message);
        const passDefault = messageErr.message.toLowerCase().includes('default password is not permited');
        checkedExceptionError(messageErr.message, req.exception) && handleNotification(passDefault ? "Atenção!" : "Erro!", translate.getMessagePT(), passDefault ? "info" : "danger");
    } finally {
        return result;
    }
};

export async function fetchDataFull(req: iReqConn) {
    let result: any = { error: true, message: "Generic Error!" };

    try {
        const URL = settingUrl(`/Controller/${req.pathFile}?app_id=${req.appId ? req.appId : "18"}&AUTH=${localStorage.tokenGIPP ? localStorage.tokenGIPP : ''}${req.urlComplement ? req.urlComplement : ""}`);
        let objectReq: any = { method: req.method };

        if (req.params) {
            if (req.params instanceof FormData) {
                objectReq.body = req.params;
            } else {
                objectReq.body = JSON.stringify(req.params);
                objectReq.headers = {
                    "Content-Type": "application/json"
                };
            }
        }

        const response = await fetch(URL, objectReq);
        
        // CHECAGEM DE TIPO: Se for um arquivo, baixa. Se for JSON, continua.
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = "";
            document.body.appendChild(a);
            a.click();
            a.remove();
            return { error: false };
        }

        const body = await response.json();
        result = body;        
        if (body.error) throw new Error(body.message);
    } catch (messageErr: any) {
        const translate = new Translator(messageErr.message);
        const passDefault = messageErr.message.toLowerCase().includes('default password is not permited');
        checkedExceptionError(messageErr.message, req.exception) && handleNotification(passDefault ? "Atenção!" : "Erro!", translate.getMessagePT(), passDefault ? "info" : "danger");
    } finally {
        return result;
    }
};


