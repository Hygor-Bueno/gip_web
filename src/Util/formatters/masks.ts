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

export function maskPhone(value: string): string {
    return value?.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
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