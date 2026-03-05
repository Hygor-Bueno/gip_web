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

// Jonatas silva dos santos | data: 05/03/2026
// - Fiz uma mudança para trabalhar com FormData para envios de arquivos e leitura binaria
export async function fetchDataFull(req: iReqConn) {
    let result: any = { error: true, message: "Generic Error!" };

    try {
        const URL = settingUrl(`/Controller/${req.pathFile}?app_id=${req.appId ?? "18"}&AUTH=${localStorage.tokenGIPP ?? ''}${req.urlComplement ?? ""}`);

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
        const body = await response.json();

        result = body;

        if (body.error) {
            throw new Error(body.message);
        }

    } catch (messageErr: any) {
        const translate = new Translator(messageErr.message);
        const passDefault = messageErr.message.toLowerCase().includes('default password is not permited');

        checkedExceptionError(messageErr.message, req.exception) &&
            handleNotification(
                passDefault ? "Atenção!" : "Erro!",
                translate.getMessagePT(),
                passDefault ? "info" : "danger"
            );
    }

    return result;
}

/*
    - Download do arquivo Criado por Jonatas silva silva dos santos
*/
export function downloadFile(req: any) {
    const URL = settingUrl(`/Controller/${req.pathFile}?app_id=${req.appId ?? "18"}&AUTH=${localStorage.tokenGIPP ?? ''}${req.urlComplement ?? ""}`);
    window.location.href = URL;
}


