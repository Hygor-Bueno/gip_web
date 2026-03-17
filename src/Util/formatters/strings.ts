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