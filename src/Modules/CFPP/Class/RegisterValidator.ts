interface Register {
    id_record_type_fk: string;
    times: string;
}
export default class RegisterValidator {
    // Verifica se um id_record_type_fk já existe na lista
    static isIdAlreadyExists(list: Register[], id: string): boolean {
        return list.some(item => item.id_record_type_fk === id);
    }

    // Verifica se o id_record_type_fk = 3 tem um 2 antes dele ou se é o primeiro lançamento
    static hasValidPredecessorForThree(list: Register[]): boolean {
        const lastTwoIndex = list.findIndex(item => item.id_record_type_fk === "2");
        const firstItem = list.length == 0;
        return lastTwoIndex !== -1 || firstItem;
    }

    // Verifica se o times do 3 é maior que o times do 2 que o antecede
    static isThreeTimeValid(list: Register[], newTime: string): boolean {
        const lastTwoIndex = list.findIndex(item => item.id_record_type_fk === "2");
        const firstItem = list.length == 0;
        let result = false;
        if (lastTwoIndex !== -1) {
            const lastTwoTime = list[lastTwoIndex].times;
            result = new Date(newTime) >= new Date(lastTwoTime);
        }
        return result || firstItem;
    }

    // Verifica se o times do 4 é maior que todos os times anteriores
    static isFourTimeValid(list: Register[], newTime: string): boolean {
        const allTimes = list.map(item => new Date(item.times).getTime());
        const newTimeMs = new Date(newTime).getTime();
        return allTimes.every(time => newTimeMs >= time);
    }

    // Verifica se o último item tem o mesmo id_record_type_fk que o novo item
    static isConsecutiveType(list: Register[], newItem: Register): boolean {
        if (list.length === 0) return false;
        const lastItem = list[list.length - 1];
        return lastItem.id_record_type_fk === newItem.id_record_type_fk;
    }

    // Verifica se a data e hora já existe na lista
    static isTimeAlreadyExists(list: Register[], newTime: string): boolean {
        return list.some(item => item.times === newTime);
    }

    // Verifica se já existe um lançamento do tipo 4 na lista
    static hasTypeFour(list: Register[]): boolean {
        return list.some(item => item.id_record_type_fk === "4");
    }

    // Verifica se o novo time é maior ou igual ao último time da lista
    static isTimeInOrder(list: Register[], newTime: string): boolean {
        if (list.length === 0) return true; // Se a lista estiver vazia, não há restrição
        const lastTime = list[list.length - 1].times;
        return new Date(newTime) >= new Date(lastTime);
    }

    // Função principal de validação
    static isValidToAdd(list: Register[], newItem: Register): void {
        const { id_record_type_fk, times } = newItem;

        // Regra 0: Se já existir um lançamento do tipo 4, não permite adicionar mais nada
        if (this.hasTypeFour(list)) {
            throw new Error("Não é permitido adicionar lançamentos após um lançamento do tipo 4.");
        }

        // Regra 1: id_record_type_fk 1 e 4 só podem aparecer uma vez
        if (["1", "4"].includes(id_record_type_fk) && this.isIdAlreadyExists(list, id_record_type_fk)) {
            throw new Error(`id_record_type_fk ${id_record_type_fk} já existe na lista.`);
        }

        // Regra 2: id_record_type_fk = 3 precisa de um 2 antes e um times válido
        if (id_record_type_fk === "3") {
            if (!this.hasValidPredecessorForThree(list)) {
                throw new Error("Não há um registro com id_record_type_fk = 2 antes de adicionar o 3.");
            }
            if (!this.isThreeTimeValid(list, times)) {
                throw new Error("O times do 3 não pode ser menor que o times do 2 que o antecede.");
            }
        }

        // Regra 3: id_record_type_fk = 4 precisa ter o maior times
        if (id_record_type_fk === "4" && !this.isFourTimeValid(list, times)) {
            throw new Error("O times do 4 não pode ser menor que os times dos itens 1, 2 e 3 que o antecedem.");
        }

        // Regra 4: Não pode haver dois lançamentos do mesmo tipo consecutivos
        if (this.isConsecutiveType(list, newItem)) {
            throw new Error(`Não é permitido adicionar dois lançamentos do tipo ${id_record_type_fk} consecutivos.`);
        }

        // Regra 5: A data e hora não podem se repetir
        if (this.isTimeAlreadyExists(list, times)) {
            throw new Error("A data e hora do lançamento já existem na lista.");
        }

        // Regra 6: O novo time deve ser maior ou igual ao último time da lista
        if (!this.isTimeInOrder(list, times)) {
            throw new Error("As marcações devem ser adicionadas em ordem crescente de tempo.");
        }
    }
}