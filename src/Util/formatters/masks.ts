import { useState, ChangeEvent } from 'react';

// ============================================================================
// 1. FUNÇÕES DE FORMATAÇÃO (MÁSCARAS PURAS)
// Mantendo os nomes originais para não quebrar o projeto legado
// ============================================================================

export function formatarMoedaPTBR(valor: string): string {
    if (!valor) return '';
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros === '') return '';
    
    const numero = Number(apenasNumeros) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numero);
}

export function maskMoney(value: string | number): string {
    if (value === null || value === undefined) return '';
    const apenasNumeros = String(value).replace(/\D/g, '');
    if (apenasNumeros === '') return '';
    
    const numero = Number(apenasNumeros) / 100;
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(numero);
}

export function maskPhone(value: string): string {
    if (!value) return '';
    let v = value.replace(/\D/g, '');
    
    v = v.substring(0, 11); // Limita a 11 dígitos
    
    if (v.length <= 2) return v;
    if (v.length <= 6) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length <= 10) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    
    return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`; 
}

export function maskName(text: string): string {
    if (!text) return '';
    const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
    
    return text
        .toLowerCase()
        .split(' ') 
        .map((palavra, index) => {
            if (palavra.length === 0) return palavra; // Preserva espaços durante a digitação
            if (index !== 0 && preposicoes.includes(palavra)) return palavra;
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
}

export function maskCpfCnpj(value: string): string {
    if (!value) return '';
    let v = value.replace(/\D/g, '');
    
    v = v.substring(0, 14); // Limita a 14 dígitos (CNPJ)

    if (v.length <= 11) {
        if (v.length <= 3) return v;
        if (v.length <= 6) return `${v.substring(0, 3)}.${v.substring(3)}`;
        if (v.length <= 9) return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
        return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
    }

    return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12, 14)}`;
}

export function maskCEP(value: string): string {
    if (!value) return '';
    let v = value.replace(/\D/g, '');
    v = v.substring(0, 8); 

    if (v.length <= 5) return v;
    return `${v.substring(0, 5)}-${v.substring(5)}`;
}

// NOVA FUNÇÃO: Máscara de Chassi (VIN)
export function maskChassis(value: string): string {
    if (!value) return '';
    
    // Converte para maiúsculo e remove tudo que não for Letra ou Número.
    // O Regex [^A-HJ-NPR-Z0-9] significa: "Tire tudo que NÃO seja de A até Z ou de 0 até 9, pulando I, O e Q".
    let v = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    
    // Limita estritamente a 17 caracteres
    return v.substring(0, 17);
}

// ============================================================================
// 2. HOOK CUSTOMIZADO (GERENCIAMENTO DE ESTADO E INPUT)
// ============================================================================

// Adicionado o tipo 'chassis' nas opções do Hook
type MaskType = 'money' | 'phone' | 'name' | 'document' | 'cep' | 'chassis';

export function useMask(initialValue: string, type: MaskType) {
    const [value, setValue] = useState(() => {
        if (!initialValue) return '';
        if (type === 'money') return maskMoney(initialValue);
        if (type === 'phone') return maskPhone(initialValue);
        if (type === 'name') return maskName(initialValue);
        if (type === 'document') return maskCpfCnpj(initialValue);
        if (type === 'cep') return maskCEP(initialValue);
        if (type === 'chassis') return maskChassis(initialValue); // Inicializa o Chassi
        return initialValue;
    });

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        let maskedValue = rawValue;

        if (type === 'money') maskedValue = maskMoney(rawValue);
        if (type === 'phone') maskedValue = maskPhone(rawValue);
        if (type === 'name') maskedValue = maskName(rawValue);
        if (type === 'document') maskedValue = maskCpfCnpj(rawValue);
        if (type === 'cep') maskedValue = maskCEP(rawValue);
        if (type === 'chassis') maskedValue = maskChassis(rawValue); // Aplica a máscara no onChange

        setValue(maskedValue);
    };

    const getUnmaskedValue = () => {
        if (!value) return '';
        
        if (type === 'money') {
            const apenasNumeros = value.replace(/\D/g, '');
            return Number(apenasNumeros) / 100; 
        }
        
        if (type === 'phone' || type === 'document' || type === 'cep') {
            return value.replace(/\D/g, ''); 
        }
        
        // Nome e Chassi já retornam o valor limpo por padrão (Chassi não tem traços, só letras e números)
        return value; 
    };

    return {
        value,
        onChange,
        setValue,
        unmaskedValue: getUnmaskedValue()
    };
}