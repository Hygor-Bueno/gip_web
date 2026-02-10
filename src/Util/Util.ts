
import { Store } from "react-notifications-component";
import { iReqConn } from "../Interface/iConnection"
import Translator from "./Translate";

export const IMAGE_WEBP_QUALITY = 0.4; // controla a qualidade das imagens com extensões webp.
const baseURLSgpp = process.env.REACT_APP_API_SGPP_BASE_URL;

export const convertdate = (date: string): string | null => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error(`Data inválida: ${date}`);
        return null;
    }

    return parsedDate.toLocaleDateString('pt-BR');
};

export function formatDateBR(date?: string | Date | null) {
    if (!date) return "--"; // fallback se não tiver data
    const dt = new Date(date);
    return dt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

export const fetchCEPData = async (cep: string, loading: any) => {
    try {
        loading(true);

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!response.ok) {
            throw new Error("Erro ao buscar o CEP.");
        }

        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado.");
        }

        return data;

    } catch (error: any) {
        handleNotification("Erro", error.message || "Erro desconhecido", "danger");
        return null; // <- importante: retorne algo previsível para quem chama a função
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
export function convertTime(date: string, omitTime: boolean = false): string {
    let response = "";
    try {
        if (!date) throw new Error("Invalid date");

        let formatTime: Intl.DateTimeFormatOptions = {
            dateStyle: "short",
            hourCycle: "h23"
        };

        if (!omitTime) {
            formatTime.timeStyle = "short";
        }

        if (date.includes("T") && date.endsWith("Z")) {
            formatTime.timeZone = 'UTC';
        }

        const localDate = new Date(date);
        response = new Intl.DateTimeFormat("pt-BR", formatTime).format(localDate);
    } catch (error) {
        console.error("Erro ao formatar data:", error);
    }

    return response;
}
export function convertDate(date: string, omitTime: boolean = false): string {
    let response = "";
    try {
        if (!date) throw new Error("Invalid date");

        let formatTime: Intl.DateTimeFormatOptions = {
            dateStyle: "short",
            hourCycle: "h23",
            timeZone: "UTC" // <- Isso força UTC
        };

        if (!omitTime) {
            formatTime.timeStyle = "short";
        }

        const localDate = new Date(date);
        response = new Intl.DateTimeFormat("pt-BR", formatTime).format(localDate);
    } catch (error) {
        console.error("Erro ao formatar data:", error);
    }

    return response;
}



export function captureTime(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function convertImage(src: any): string {
    if (src != null) {
        return "data:image/jpeg;base64, " + src;
    } else {
        return '/path/to/default-user-icon.png';
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
    const portGipp = process.env.REACT_APP_API_GIPP_PORT_SERVER_DEFAULT;
    const baseURLGipp = process.env.REACT_APP_API_GIPP_BASE_URL;
    const httpDefault = `${baseURLGipp}:${port || portGipp}`;
    const server = `${httpDefault}`;
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
    array: T[], 
    options?: {
        isImageKeys?: string[];
        ocultColumns?: string[];
        minWidths?: Record<string, string>;
        customTags?: Record<string, string>;
        customValue?: Record<string, (value: any, row?: T) => string>;
    }
): TableItem[] {
    return array.map((item) => {
        const tableItem: TableItem = {};

        // Define as chaves a processar:
        // - Se customTags existir, segue a ordem delas
        // - Se não, segue as chaves originais
        const keysToProcess = options?.customTags
            ? Object.keys(options.customTags)
            : Object.keys(item);

        // Inclui também qualquer coluna de ocultColumns que não esteja no customTags
        const allKeys = new Set([
            ...keysToProcess,
            ...(options?.ocultColumns || [])
        ]);

        allKeys.forEach((key) => {
            // Ignora se a chave não existir no item e não estiver em ocultColumns
            if (!(key in item) && !(options?.ocultColumns?.includes(key))) return;

            const rawValue = item[key];
            const formatter = options?.customValue?.[key];
            const formattedValue = formatter ? formatter(rawValue, item) : rawValue?.toString() || "";
            const isImage = options?.isImageKeys?.includes(key);
            const ocultColumn = options?.ocultColumns?.includes(key);
            const minWidth = options?.minWidths?.[key] || "150px";
            const tag = options?.customTags?.[key] || key;

            tableItem[key] = maskUserSeach(formattedValue, tag, isImage, ocultColumn, minWidth);
        });

        return tableItem;
    });
}

export function convertForTable2<T extends Record<string, any>>(
  array: T[],
  options?: {
    isImageKeys?: string[];
    ocultColumns?: string[];
    minWidths?: Record<string, string | number>;
    customTags?: Record<string, string>;
    customValue?: Record<string, (value: any, row?: T) => string>;
  }
): TableItem[] {
  return array.map((item) => {
    const tableItem: TableItem = {};
    const keysToProcess = options?.customTags
      ? Object.keys(options.customTags)
      : Object.keys(item);

    const allKeys = new Set<string>([
      ...keysToProcess,
      ...(options?.ocultColumns || []),
    ]);

    allKeys.forEach((key) => {
      if (!(key in item) && !(options?.ocultColumns?.includes(key))) return;

      const rawValue = item[key];
      const formatter = options?.customValue?.[key];
      const formattedValue = formatter
        ? formatter(rawValue, item)
        : rawValue?.toString() || "";

      const isImage = options?.isImageKeys?.includes(key) ?? false;
      const ocultColumn = options?.ocultColumns?.includes(key) ?? false;

      const minWidthCfg = options?.minWidths?.[key];
      const minWidth =
        typeof minWidthCfg === "number" ? `${minWidthCfg}px` : minWidthCfg;

      const tag = options?.customTags?.[key] || key;

      tableItem[key] = maskUserSeach(
        formattedValue,
        tag,
        isImage,
        ocultColumn,
        minWidth 
      );
    });

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

export async function loadLocalStorage(user: any) {
    try {
        const response = await fetchDataFull({
            method: 'GET',
            params: null,
            pathFile: "CCPP/Employee.php",
            urlComplement: `&id=${user.id}&all_data`,
        });

        if (response.error) throw new Error(response.message);

        localStorage.setItem("num_store", response.data[0]?.number_shop ?? "");
        localStorage.setItem("store", response.data[0]?.shop ?? "");

    } catch (e: any) {
        console.error(e.toString());
    }
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

export function formatDate(value: string): string {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}

export function maskPhone(value: string): string {
    return value?.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

export function removeSpecialCharsAndNumbers(text: string): string {
    return text.replace(/[^a-zA-Z\s]/g, ""); // Mantém apenas letras e espaços
}

export function removeStringSpecialChars(text: string): string {
    return text.replace(/\D/g, '');
}

type AllowedTypes = 'numbers' | 'hasSpaces' | 'allnumber' | 'lettersWithSpaces' | 'alphanumeric' | 'alphanumericWithSpaces';
export function validateWithRegexAndFormat(
    type: AllowedTypes,
    value: string
): { isValid: boolean; formatted?: string | null } {
    const regex = regexMenu()[type];
    const isEmpty = /^\s*$/.test(value);
    const isValid = isEmpty || regex.test(value);
    return { isValid, formatted: isEmpty ? '' : undefined, };
}

function regexMenu(): Record<AllowedTypes, RegExp> {
    return {
        numbers: /^\d+$/,
        hasSpaces: /\s/,
        allnumber: /^\d+$/,
        lettersWithSpaces: /^[A-Za-zÀ-ÿ\s]+$/,
        alphanumeric: /^[A-Za-z0-9]+$/,
        alphanumericWithSpaces: /^[A-Za-z0-9\s]+$/,
    };
}

/**
 * Formata um nome, deixando a primeira letra de cada palavra em maiúscula.
 * Exemplo: "joão da silva" → "João Da Silva"
 *
 * @param text - Texto que representa o nome a ser formatado
 * @returns Nome formatado com letras iniciais maiúsculas
 */
export function maskName(text: string): string {
    // Converte todo o texto para minúsculo, depois aplica uma expressão regular
    // que identifica a primeira letra de cada palavra e a converte para maiúscula.
    const result = text.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
    return result;
}

/**
 * Formata um valor numérico ou texto numérico no padrão monetário brasileiro (R$).
 * Exemplo: "1234.5" → "R$ 1.234,50"
 *
 * @param value - Valor que será convertido para o formato monetário BRL
 * @returns Valor formatado como moeda brasileira
 */
export function maskMoney(value: string | number): string {
    // Converte para número e formata com a localidade 'pt-BR' e moeda 'BRL'
    return parseFloat(value.toString()).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Ordena um array de objetos JSON com base em uma chave específica.
 *
 * @param list - Array de objetos JSON a ser ordenado.
 * @param key - Chave usada para ordenar os objetos.
 * @param ascending - Define se a ordenação será crescente (true) ou decrescente (false).
 * @returns Novo array ordenado com base na chave especificada.
 */
export function sortListByKey<T>(
    list: T[],
    key: keyof T,
    ascending: boolean = true
): T[] {
    return [...list].sort((a, b) => sortList(a, b, key, ascending));
}

function sortList<T>(a: T, b: T, key: keyof T, ascending: boolean): number {
    const valueOne = String(a[key]).toLowerCase();
    const valueTwo = String(b[key]).toLowerCase();
    return (valueOne > valueTwo ? 1 : valueOne < valueTwo ? -1 : 0) * (ascending ? 1 : -1);
}

export function cleanLocalStorage() {
    localStorage.removeItem("tokenGIPP");
    localStorage.removeItem("codUserGIPP");
}
