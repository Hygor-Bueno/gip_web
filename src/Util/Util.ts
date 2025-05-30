import { Store } from "react-notifications-component";
import { iReqConn } from "../Interface/iConnection"
import Translator from "./Translate";

export const convertdate = (date: string): string | null => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error(`Data inválida: ${date}`);
        return null;
    }

    return parsedDate.toLocaleDateString('pt-BR');
};

export const fetchCEPData = async (cep: string, loading: any) => {
    try {
        loading(true);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) {
            const responseStatus = new Error(`CEP encontrado!`);
            handleNotification("Sucesso", responseStatus.message, "success");
        } 
        
        const data = await response.json();
        if (data.erro) {
            const responseStatus = new Error("CEP não encontrado.");
            handleNotification("Erro", responseStatus.message, "danger");
        }
        return data;
    } catch (error) {
        handleNotification("Error", "", "danger");
    } finally {
        loading(false);
    }
};

export const consultingCEP = async (cep: any, setData: any, loading: any) => {
    if (cep.length !== 8) {
        console.warn("CEP inválido. Deve conter 8 dígitos.");
        return;
    }

    try {
        const data = await fetchCEPData(cep, loading);

        setData((prevData: any) => ({
        ...prevData,
        street: data.logradouro || '',
        district: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        }));
    } catch (error: any) {
        console.error("Erro ao consultar o CEP:", error.message || error);
    }
};

export function convertTime(date: string) {
    if (date && date != undefined) {
        let formatTime: Intl.DateTimeFormatOptions = {
            dateStyle: "short",
            timeStyle: "short",
            hourCycle: "h23"
        };
        if (date.includes("T") && date.endsWith("Z")) formatTime.timeZone = 'UTC';
        const localDate = new Date(`${date}`);
        return new Intl.DateTimeFormat("pt-BR", formatTime).format(localDate);
    }
}

export function captureTime(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth começa em 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    let httpDefault = `gigpp.com.br:${port ? port : '72/GLOBAL'}`;
    let httpTest = `192.168.0.99:${port ? port : '71/GLOBAL'}`;
    let server = `http://${httpTest}`;
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

type AllowedTypes =
  | 'numbers'
  | 'hasSpaces'
  | 'allnumber'
  | 'lettersWithSpaces'
  | 'alphanumeric'
  | 'alphanumericWithSpaces'
  | 'cpf'
  | 'cnpj'
  | 'date';

export function validateWithRegexAndFormat(
  type: AllowedTypes,
  value: string
): { isValid: boolean; formatted?: string | null } {

  if (/^\s*$/.test(value)) {
    return { isValid: true, formatted: '' };
  }

  const patterns: Record<AllowedTypes, RegExp> = regexMenu();
  const formatters: Partial<Record<AllowedTypes, (value: string) => string>> = formartterFunctionsMenu();
  const regex = patterns[type];
  const isValid = regex.test(value);
  if (!isValid) return { isValid: false };
  const formatter = formatters[type];
  const formatted = formatter ? formatter(value) : null;
  return {
    isValid: true,
    formatted,
  };
}

function regexMenu() {
    return {
        numbers: /^\d+$/,
        hasSpaces: /\s/,
        allnumber: /^\d+$/,
        lettersWithSpaces: /^[A-Za-zÀ-ÿ\s]+$/,
        alphanumeric: /^[A-Za-z0-9]+$/,
        alphanumericWithSpaces: /^[A-Za-z0-9\s]+$/,
        cpf: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
        cnpj: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
        date: /^\d{2}\/\d{2}\/\d{4}$/,
  };
};

function formartterFunctionsMenu()  {
   return {
        cpf: (v:any) => {
        const digits = v.replace(/\D/g, '');
        return digits.length === 11
            ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
            : v;
        },
        cnpj: (v:any) => {
        const digits = v.replace(/\D/g, '');
        return digits.length === 14
            ? digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
            : v;
        }
   };
};