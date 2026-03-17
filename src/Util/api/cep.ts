import { handleNotification } from "../ui/notifications";

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