import { Store } from "react-notifications-component";
import { Connection } from "../Connection/Connection";
import { iReqConn } from "../Interface/iConnection";
import Translator from "./Translate";

const connection = new Connection("18", true);

export const convertdate = (date: string): string | null => {
    if (!date) return null;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error(`Data inválida: ${date}`);
        return null;
    }

    return parsedDate.toLocaleDateString('pt-BR');
};

export function convertTime(date: string) {
    const localDate = new Date(`${date}`);

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        hourCycle: "h23" // Use "h23" para formato de 24 horas ou "h12" para formato de 12 horas
    }).format(localDate);
}

export const httpGet = async (url: string, params: any = {}) => {
    return connection.get(url, params);
};

export const httpPost = async (url: string, data: any) => {
    return connection.post(data, url);
};

export const httpPut = async (url: string, data: any) => {
    return connection.put(data, url);
};

export function convertImage(src: any) {
    if (src != null) {
        var image = new Image();
        image.src = "data:image/jpeg;base64, " + src;
        return image.src;
    } else {
        return null;
    }
}

export function isJSON(obj: string): boolean {
    try {
        JSON.parse(obj);
        return true;
    } catch (error) {
        return false;
    }
}

export function classToJSON(instance: object): Record<string, unknown> {
    const json: Record<string, unknown> = {};

    // Itera sobre os próprios getters da classe
    Object.entries(Object.getOwnPropertyDescriptors(instance.constructor.prototype))
        .filter(([_, descriptor]) => typeof descriptor.get === "function") // Apenas getters
        .forEach(([key]) => {
            json[key] = (instance as any)[key];
        });
    return json;
}

export function handleNotification(title: string, message: string, type: 'success' | 'danger' | 'info' | 'default' | 'warning', align?: "bottom-left" | "bottom-right" | "bottom-center" | "center" | "top-left" | "top-right" | "top-center", time?: number) {
    Store.addNotification({
        title: title,
        message: message,
        type: type, // Tipos: "success", "danger", "info", "default", "warning"
        insert: "top", // Posição na tela: "top" ou "bottom"
        container: align ? align : "bottom-left",
        animationIn: ["animate__animated animate__zoomIn"],
        animationOut: ["animate__animated animate__flipOutX"],
        dismiss: {
            duration: time ? time : 5000, // Tempo em ms
            onScreen: true,
        },
    });
}

export function isTokenExpired(expirationDate: string): boolean {
    let result: boolean = true;
    if (expirationDate) {
        const expirationTime = new Date(expirationDate).getTime();
        const currentTime = Date.now();
        result = currentTime > expirationTime;
    }
    return result;
};

export async function fetchNodeDataFull(req: iReqConn, headers?: Record<string, string>) {
    let result: { error: boolean, message?: string, data?: any } = { error: true, message: "Generic Error!" };
    try {
        const URL = `http://sgpp.pegpese.com:${req.port}${req.pathFile}${req.urlComplement ? req.urlComplement : ""}`;
        // console.log(URL,headers);
        let objectReq: any = { method: req.method };
        if (headers) {
            objectReq.headers = headers;
        }
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
    let result: { error: boolean, message?: string, data?: any } = { error: true, message: "Generic Error!" };
    try {
        const URL = settingUrl(`/Controller/${req.pathFile}?app_id=${req.appId ? req.appId : "18"}&AUTH=${localStorage.tokenGIPP ? localStorage.tokenGIPP : ''}${req.urlComplement ? req.urlComplement : ""}`);
        let objectReq: any = { method: req.method };
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
function checkedExceptionError(message: string, exceptions?: string[]): boolean {
    let result = true;
    if (exceptions) {
        exceptions.forEach(exception => {
            if (exception.toLowerCase().includes(message.toLocaleLowerCase())) result = false;
        })
    }
    return result;
}
function settingUrl(middlewer: string, params?: string, port?: string) {
    let server = `http://gigpp.com.br:${port ? port : '72/GLOBAL'}`;
    return server + middlewer + (params ? params : "");
}

// Interface para o item da tabela
export interface TableItem {
    [key: string]: {
        tag: string;
        value: string;
        isImage?: boolean;
        ocultColumn?: boolean;
        minWidth?: string;
    };
}

// Função para mascarar valores
export function maskUserSeach(
    value: string,
    tag: string,
    isImage?: boolean,
    ocultColumn?: boolean,
    minWidth?: string
): { tag: string; value: string; isImage?: boolean; ocultColumn?: boolean; minWidth?: string } {
    return { tag, value, isImage, ocultColumn, minWidth };
}

// Função genérica para converter um array de objetos em uma estrutura de tabela
export function convertForTable<T extends Record<string, any>>(
    array: T[], // Array de objetos genéricos
    options?: {
        isImageKeys?: string[]; // Chaves que devem ser tratadas como imagens
        ocultColumns?: string[]; // Chaves que devem ser ocultadas
        minWidths?: Record<string, string>; // Larguras mínimas personalizadas para colunas
        customTags?: Record<string, string>; // Mapeamento de chaves para tags personalizadas
    }
): TableItem[] {
    return array.map((item) => {
        const tableItem: TableItem = {};

        // Itera sobre as chaves do objeto
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                const value = item[key]?.toString() || ""; // Converte o valor para string
                const isImage = options?.isImageKeys?.includes(key); // Verifica se é uma imagem
                const ocultColumn = options?.ocultColumns?.includes(key); // Verifica se a coluna deve ser oculta
                const minWidth = options?.minWidths?.[key] || '150px'; // Largura mínima personalizada
                const tag = options?.customTags?.[key] || key; // Usa a tag personalizada ou a chave como fallback

                // Cria a coluna dinamicamente usando maskUserSeach
                tableItem[key] = maskUserSeach(value, tag, isImage, ocultColumn, minWidth);
            }
        }

        return tableItem;
    });
}

/**
 * Essa função recebe um objeto e converte ele para uma string no seguinte formato "@key=value ".
 * Onde o @ é o prefixo e o espaço em branco o separador.
 * @param {Record<string, any>} objectItem - O objeto a ser convertido.
 * @param {string} [prefix="@"] - O prefixo a ser adicionado antes de cada chave (opcional, padrão é "@").
 * @param {string} [separator=" "] - O separador entre os pares chave-valor (opcional, padrão é um espaço em branco).
 * @returns {string} - A string formatada.
 * @author Hygor Bueno
 */
export function objectForString(
    objectItem: Record<string, any>,
    separator: string = ""
): string {
    const result: string[] = [];
    Object.keys(objectItem).forEach((item) => {
        if (objectItem[item]) {
            result.push(`${item}=${objectItem[item]}`);
        }
    });
    return result.join(separator);
}

export function getFormattedDate(daysToSubtract?: number): string {
    // Cria uma nova data com o valor atual
    const currentDate = new Date();

    // Se o parâmetro daysToSubtract for passado, subtrai a quantidade de dias
    if (daysToSubtract !== undefined) {
        currentDate.setDate(currentDate.getDate() - daysToSubtract);
    }

    // Formata a data no formato 'yyyy-MM-dd'
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Mês é base 0, então adicionamos 1
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Retorna a data formatada como string
    return `${year}-${month}-${day}`;
}


export function formatarMoedaPTBR(valor: string): string {
    // Remove todos os caracteres que não são dígitos ou ponto
    const valorNumerico = valor.replace(/[^0-9.]/g, '');

    // Converte a string para número
    const numero = parseFloat(valorNumerico);

    // Verifica se o número é válido
    if (isNaN(numero)) {
        throw new Error('Valor monetário inválido');
    }

    // Formata o número para o padrão PT-BR com duas casas decimais
    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}