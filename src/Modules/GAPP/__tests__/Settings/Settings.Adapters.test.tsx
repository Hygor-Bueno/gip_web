import {
    getActiveClasses,
    getCompanies,
    getActiveTypes,
    getDepartaments,
    getSubdepartaments,
    getUnits,
    postActiveClass,
    postActiveType,
    postCompany,
    postDepartament,
    postSubdepartament,
    postUnit,
    putActiveClass,
    putActiveType,
    putCompany,
    putDepartament,
    putSubdepartament,
    putUnit
} from "../../Settings/Adapters/SettingsAdapters";

// ─────────────────────────────────────────────────────────────────────────────
// Mock do fetchDataFull — intercepta todas as chamadas HTTP
// ─────────────────────────────────────────────────────────────────────────────
jest.mock("../../../../Util/Utils", () => ({
  fetchDataFull: jest.fn(),
}));

import { fetchDataFull } from "../../../../Util/Utils";

const mockFetch = fetchDataFull as jest.Mock;

const successResponse  = { error: false, data: [{ id: 1 }] };
const errorResponse    = { error: true,  message: "Servidor indisponível" };

beforeEach(() => {
  mockFetch.mockResolvedValue(successResponse);
});

afterEach(() => jest.clearAllMocks());

describe("ActiveTypePut", () => {
    it("deve chamar fetchDataFull com method PUT", async () => {
        await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("deve chamar o endpoint GAPP/ActiveType.php", async () => {
        await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/ActiveType.php" })
        );
    });

    it("deve enviar o payload correto", async () => {
        const payload = { desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 };
        await putActiveType(payload);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ params: payload })
        );
    });

    it("deve retornar a resposta do servidor", async () => {
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result).toEqual(successResponse);
    });

    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });

    it("deve incluir v2=1&smart=ON na url", async () => {
        await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ urlComplement: "&v2=1&smart=ON" })
        );
    });

    it("deve retornar erro quando payload estiver incompleto", async () => {
        const incompletePayload = { desc_active_type: "Teste" };
        mockFetch.mockResolvedValue({ error: true, message: "Payload incompleto" });
        const result = await putActiveType(incompletePayload);
        expect(result.error).toBe(true);
        expect(result.message).toBe("Payload incompleto");
    });

    it("deve retornar erro quando payload tiver formato incorreto", async () => {
        const invalidPayload = { desc_active_type: "Teste", status_active_type: "ativo", date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 };
        mockFetch.mockResolvedValue({ error: true, message: "Formato de payload inválido" });
        const result = await putActiveType(invalidPayload);
        expect(result.error).toBe(true);
        expect(result.message).toBe("Formato de payload inválido");
    });

    it("deve retornar erro quando servidor responder com status 500", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Erro interno do servidor" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Erro interno do servidor");
    });

    it("deve retornar erro quando servidor responder com status 400", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Requisição inválida" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Requisição inválida");
    });

    it("deve retornar erro quando servidor responder com status 404", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Endpoint não encontrado" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Endpoint não encontrado");
    });

    it("deve retornar erro quando servidor responder com status 401", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Não autorizado" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Não autorizado");
    });

    it("deve retornar erro quando servidor responder com status 403", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Proibido" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Proibido");
    });

    it("deve retornar erro quando servidor responder com status 429", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Muitas requisições" });
        const result = await putActiveType({ desc_active_type: "Teste", status_active_type: 1, date_active_type: "2024-01-01", group_id_fk: "1", active_type_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Muitas requisições");
    });

});

describe("ActiveClassesPut", () => {
    it("deve chamar fetchDataFull com method GET", async () => {
        await putActiveClass({ desc_active_class: "Teste", status_active_class: 1, date_active_class: "2024-01-01", group_id_fk: "1", active_class_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });
    it("deve chamar o endpoint GAPP/ActiveClass.php", async () => {
        await putActiveClass({ desc_active_class: "Teste", status_active_class: 1, date_active_class: "2024-01-01", group_id_fk: "1", active_class_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/ActiveClass.php" })
        );
    });
    it("deve enviar o payload correto", async () => {
        const payload = { desc_active_class: "Teste", status_active_class: 1, date_active_class: "2024-01-01", group_id_fk: "1", active_class_id: 1 };
        await putActiveClass(payload);
    });
    it("deve retornar a resposta do servidor", async () => {
        const result = await putActiveClass({ desc_active_class: "Teste", status_active_class: 1, date_active_class: "2024-01-01", group_id_fk: "1", active_class_id: 1 });
        expect(result).toEqual(successResponse);
    });
    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putActiveClass({ desc_active_class: "Teste", status_active_class: 1, date_active_class: "2024-01-01", group_id_fk: "1", active_class_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });
});

describe("ActiveCompanyPut", () => {
    it("deve chamar fetchDataFull com method PUT", async () => {
        await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("deve chamar o endpoint GAPP/Company.php", async () => {
        await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/Company.php" })
        );
    });

    it("deve enviar o payload correto", async () => {
        const payload = { name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 };
        await putCompany(payload);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ params: payload })
        );
    });

    it("deve retornar a resposta do servidor", async () => {
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result).toEqual(successResponse);
    });

    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });

    it("deve incluir v2=1&smart=ON na url", async () => {
        await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ urlComplement: "&v2=1&smart=ON" })
        );
    });

    it("deve retornar erro quando payload estiver incompleto", async () => {
        const incompletePayload = { name_company: "Teste" };
        mockFetch.mockResolvedValue({ error: true, message: "Payload incompleto" });
        const result = await putCompany(incompletePayload);
        expect(result.error).toBe(true);
        expect(result.message).toBe("Payload incompleto");
    });

    it("deve retornar erro quando payload tiver formato incorreto", async () => {
        const invalidPayload = { name_company: "Teste", status_company: "ativo", date_company: "2024-01-01", group_id_fk: "1", company_id: 1 };
        mockFetch.mockResolvedValue({ error: true, message: "Formato de payload inválido" });
        const result = await putCompany(invalidPayload);
        expect(result.error).toBe(true);
        expect(result.message).toBe("Formato de payload inválido");
    });

    it("deve retornar erro quando servidor responder com status 500", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Erro interno do servidor" });
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Erro interno do servidor");
    });

    it("deve retornar erro quando servidor responder com status 400", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Requisição inválida" });
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Requisição inválida");
    });

    it("deve retornar erro quando servidor responder com status 404", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Endpoint não encontrado" });
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Endpoint não encontrado");
    });

    it("deve retornar erro quando servidor responder com status 401", async () => {
        mockFetch.mockResolvedValue({ error: true, message: "Não autorizado" });
        const result = await putCompany({ name_company: "Teste", status_company: 1, date_company: "2024-01-01", group_id_fk: "1", company_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Não autorizado");
    });
});

describe("ActiveDepartamentPut", () => {
    it("deve chamar fetchDataFull com method PUT", async () => {
        await putDepartament({ desc_departament: "Teste", status_departament: 1, date_departament: "2024-01-01", group_id_fk: "1", departament_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("deve chamar o endpoint GAPP/Departament.php", async () => {
        await putDepartament({ desc_departament: "Teste", status_departament: 1, date_departament: "2024-01-01", group_id_fk: "1", departament_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/Departament.php" })
        );
    });

    it("deve enviar o payload correto", async () => {
        const payload = { desc_departament: "Teste", status_departament: 1, date_departament: "2024-01-01", group_id_fk: "1", departament_id: 1 };
        await putDepartament(payload);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ params: payload })
        );
    });

    it("deve retornar a resposta do servidor", async () => {
        const result = await putDepartament({ desc_departament: "Teste", status_departament: 1, date_departament: "2024-01-01", group_id_fk: "1", departament_id: 1 });
        expect(result).toEqual(successResponse);
    });

    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putDepartament({ desc_departament: "Teste", status_departament: 1, date_departament: "2024-01-01", group_id_fk: "1", departament_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });
});

describe("ActiveSubdepartamentPut", () => {
    it("deve chamar fetchDataFull com method PUT", async () => {
        await putSubdepartament({ desc_subdepartament: "Teste", status_subdepartament: 1, date_subdepartament: "2024-01-01", group_id_fk: "1", subdepartament_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("deve chamar o endpoint GAPP/Subdepartament.php", async () => {
        await putSubdepartament({ desc_subdepartament: "Teste", status_subdepartament: 1, date_subdepartament: "2024-01-01", group_id_fk: "1", subdepartament_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/Subdepartament.php" })
        );
    });

    it("deve enviar o payload correto", async () => {
        const payload = { desc_subdepartament: "Teste", status_subdepartament: 1, date_subdepartament: "2024-01-01", group_id_fk: "1", subdepartament_id: 1 };
        await putSubdepartament(payload);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ params: payload })
        );
    });

    it("deve retornar a resposta do servidor", async () => {
        const result = await putSubdepartament({ desc_subdepartament: "Teste", status_subdepartament: 1, date_subdepartament: "2024-01-01", group_id_fk: "1", subdepartament_id: 1 });
        expect(result).toEqual(successResponse);
    });

    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putSubdepartament({ desc_subdepartament: "Teste", status_subdepartament: 1, date_subdepartament: "2024-01-01", group_id_fk: "1", subdepartament_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });
});

describe("ActiveUnitPut", () => {
    it("deve chamar fetchDataFull com method PUT", async () => {
        await putUnit({ desc_unit: "Teste", status_unit: 1, date_unit: "2024-01-01", group_id_fk: "1", unit_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("deve chamar o endpoint GAPP/Units.php", async () => {
        await putUnit({ desc_unit: "Teste", status_unit: 1, date_unit: "2024-01-01", group_id_fk: "1", unit_id: 1 });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ pathFile: "GAPP/Units.php" })
        );
    });

    it("deve enviar o payload correto", async () => {
        const payload = { desc_unit: "Teste", status_unit: 1, date_unit: "2024-01-01", group_id_fk: "1", unit_id: 1 };
        await putUnit(payload);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.objectContaining({ params: payload })
        );
    });

    it("deve retornar a resposta do servidor", async () => {
        const result = await putUnit({ desc_unit: "Teste", status_unit: 1, date_unit: "2024-01-01", group_id_fk: "1", unit_id: 1 });
        expect(result).toEqual(successResponse);
    });

    it("deve retornar erro quando servidor responde com error: true", async () => {
        mockFetch.mockResolvedValue(errorResponse);
        const result = await putUnit({ desc_unit: "Teste", status_unit: 1, date_unit: "2024-01-01", group_id_fk: "1", unit_id: 1 });
        expect(result.error).toBe(true);
        expect(result.message).toBe("Servidor indisponível");
    });
});