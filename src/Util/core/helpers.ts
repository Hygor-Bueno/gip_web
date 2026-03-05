export const IMAGE_WEBP_QUALITY = 0.4;



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