/**
 * Classe utilitária para conversão e manipulação de datas.
 * Fornece métodos para formatar datas, converter strings em objetos Date,
 * obter a data atual e adicionar ou subtrair dias de uma data específica.
 */
export class DateConverter {
    /**
     * Verifica se um objeto Date é válido.
     * @param date Objeto Date a ser validado.
     * @returns Retorna true se a data for válida, caso contrário, false.
     */
    private static isValidDate(date: Date): boolean {
        return !isNaN(date.getTime());
    }

    /**
     * Formata uma string de data para um formato específico.
     * @param date String representando uma data.
     * @param format Formato desejado ('dd/mm/yyyy' ou 'yyyy-mm-dd').
     * @returns Retorna a data formatada ou null se inválida.
     */
    public static formatDate(date: string, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        if (!date) return null;
        
        const parsedDate = new Date(date);
        if (!this.isValidDate(parsedDate)) {
            console.error(`Data inválida: ${date}`);
            return null;
        }
        
        const day = parsedDate.getUTCDate().toString().padStart(2, '0');
        const month = (parsedDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = parsedDate.getUTCFullYear();

        return format === 'dd/mm/yyyy' 
            ? `${day}/${month}/${year}` 
            : `${year}-${month}-${day}`;
    }

    /**
     * Converte uma string de data para um objeto Date.
     * @param date String representando uma data.
     * @returns Retorna um objeto Date ou null se inválido.
     */
    public static toDateObject(date: string): Date | null {
        const parsedDate = new Date(date);
        return this.isValidDate(parsedDate) ? parsedDate : null;
    }

    /**
     * Obtém a data atual formatada no formato especificado.
     * @param format Formato desejado ('dd/mm/yyyy' ou 'yyyy-mm-dd').
     * @returns Retorna a data atual formatada.
     */
    public static getCurrentDate(format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string {
        const now = new Date();
        return this.formatDate(now.toISOString(), format) ?? '';
    }

    /**
     * Adiciona um número específico de dias a uma data.
     * @param date String representando uma data.
     * @param days Número de dias a serem adicionados.
     * @param format Formato desejado ('dd/mm/yyyy' ou 'yyyy-mm-dd').
     * @returns Retorna a nova data formatada ou null se inválida.
     */
    public static addDays(date: string, days: number, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        const parsedDate = this.toDateObject(date);
        if (!parsedDate) return null;
        
        parsedDate.setDate(parsedDate.getUTCDate() + days);
        return this.formatDate(parsedDate.toISOString(), format);
    }

    /**
     * Subtrai um número específico de dias de uma data.
     * @param date String representando uma data.
     * @param days Número de dias a serem subtraídos.
     * @param format Formato desejado ('dd/mm/yyyy' ou 'yyyy-mm-dd').
     * @returns Retorna a nova data formatada ou null se inválida.
     */
    public static subtractDays(date: string, days: number, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        return this.addDays(date, -days, format);
    }
}
