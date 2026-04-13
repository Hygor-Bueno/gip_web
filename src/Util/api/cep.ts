import { handleNotification } from "../ui/notifications";

// --- Tipagens ---
interface ViaCEPResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

// --- Nova Funcionalidade 1: Cache em Memória ---
// Guarda as buscas recentes para não gastar internet e responder instantaneamente
const cepCache = new Map<string, ViaCEPResponse>();

// --- Nova Funcionalidade 2 e 3: Timeout e Fallback ---
// Essa função é interna e faz o trabalho pesado de forma segura
const fetchWithFallback = async (cep: string): Promise<ViaCEPResponse> => {
    // Cria um limite de 8 segundos para a requisição não travar a tela
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        // Tenta o ViaCEP primeiro
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { 
            signal: controller.signal 
        });
        
        if (!response.ok) throw new Error("ViaCEP indisponível");
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado.");
        
        clearTimeout(timeoutId);
        return data;

    } catch (error: any) {
        // Se o erro foi timeout, avisamos direto
        if (error.name === 'AbortError') {
            throw new Error("Tempo de limite excedido. Verifique sua conexão.");
        }

        // PLANO B: ViaCEP falhou? Tenta a BrasilAPI
        console.warn("ViaCEP falhou, tentando BrasilAPI...");
        
        const fallbackResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!fallbackResponse.ok) {
            if (fallbackResponse.status === 404) throw new Error("CEP não encontrado.");
            throw new Error("Nenhum serviço de CEP está respondendo no momento.");
        }

        const fallbackData = await fallbackResponse.json();
        
        // Adaptamos o retorno da BrasilAPI para ficar IGUAL ao ViaCEP
        // Assim, o resto do seu projeto nem percebe que trocou de API
        return {
            logradouro: fallbackData.street,
            bairro: fallbackData.neighborhood,
            localidade: fallbackData.city,
            uf: fallbackData.state,
            erro: false
        };
    }
};

// --- Funções Originais (Assinaturas intactas para não quebrar projetos) ---

export const fetchCEPData = async (cep: string, loading: any) => {
    const cleanCEP = String(cep).replace(/\D/g, "");

    // Verificação de cache: Se já buscou esse CEP hoje, pega da memória!
    if (cepCache.has(cleanCEP)) {
        return cepCache.get(cleanCEP);
    }

    try {
        loading(true);
        const data = await fetchWithFallback(cleanCEP);
        
        // Salva o resultado no cache para consultas futuras
        cepCache.set(cleanCEP, data);
        
        return data;
    } catch (error: any) {
        handleNotification("Erro", error.message || "Erro desconhecido", "danger");
        return null; 
    } finally {
        loading(false);
    }
};

export const consultingCEP = async (cep: any, setData: any, loading: any) => {
    const cleanCEP = String(cep).replace(/\D/g, "");
    
    if (cleanCEP.length !== 8) {
        console.warn("CEP inválido. Deve conter 8 dígitos.");
        return;
    }

    try {
        const data = await fetchCEPData(cleanCEP, loading);

        if (data) {
            setData((prevData: any) => ({
                ...prevData,
                street: data.logradouro || '',
                district: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
            }));
        }
    } catch (error: any) {
        console.error("Erro interno ao consultar CEP:", error);
    }
};