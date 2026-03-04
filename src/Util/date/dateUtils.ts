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


export function formatDateBR(date?: string | Date | null) {
    if (!date) return "--"; // fallback se não tiver data
    const dt = new Date(date);
    return dt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
}

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

export const convertdate = (date: string): string | null => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error(`Data inválida: ${date}`);
        return null;
    }

    return parsedDate.toLocaleDateString('pt-BR');
};


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

export function formatDate(value: string): string {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
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

