/**
 * Testa todos os adaptadores POST da tela de Configurações.
 * Cobre: postActiveType, postActiveClass, postCompany,
 *        postUnit, postDepartament, postSubdepartament.
 */

jest.mock("../../../../Util/Utils", () => ({
  fetchDataFull: jest.fn(),
}));

import {
  postActiveType,
  postActiveClass,
  postCompany,
  postUnit,
  postDepartament,
  postSubdepartament,
} from "../../Settings/Adapters/SettingsAdapters";
import { fetchDataFull } from "../../../../Util/Utils";

const mockFetch = fetchDataFull as jest.Mock;

const successResp = { error: false, data: [{ id: 99 }] };
const errorResp   = { error: true,  message: "Servidor indisponível" };

beforeEach(() => mockFetch.mockResolvedValue(successResp));
afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// Shared behaviour for every POST adapter
// ─────────────────────────────────────────────────────────────────────────────
function itBehavesLikePost(
  fn: (p: object) => ReturnType<typeof fetchDataFull>,
  expectedPath: string,
  payload: object,
) {
  it("deve usar method POST", async () => {
    await fn(payload);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
  });

  it(`deve chamar o endpoint ${expectedPath}`, async () => {
    await fn(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: expectedPath }),
    );
  });

  it("deve incluir v2=1&smart=ON na url", async () => {
    await fn(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&v2=1&smart=ON" }),
    );
  });

  it("deve enviar o payload completo", async () => {
    await fn(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: payload }),
    );
  });

  it("deve retornar a resposta do servidor em caso de sucesso", async () => {
    expect(await fn(payload)).toEqual(successResp);
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResp);
    const result = await fn(payload);
    expect(result.error).toBe(true);
    expect(result.message).toBe("Servidor indisponível");
  });

  it("deve retornar erro de servidor 500", async () => {
    mockFetch.mockResolvedValue({ error: true, message: "Erro interno do servidor" });
    expect((await fn(payload)).error).toBe(true);
  });

  it("deve retornar erro de servidor 400", async () => {
    mockFetch.mockResolvedValue({ error: true, message: "Requisição inválida" });
    expect((await fn(payload)).message).toBe("Requisição inválida");
  });
}

// ─────────────────────────────────────────────────────────────────────────────
describe("postActiveType", () => {
  itBehavesLikePost(
    postActiveType,
    "GAPP/ActiveType.php",
    { desc_active_type: "Veículo", group_id_fk: "1" },
  );
});

describe("postActiveClass", () => {
  itBehavesLikePost(
    postActiveClass,
    "GAPP/ActiveClass.php",
    { desc_active_class: "Passeio", active_type_id_fk: 2, group_id_fk: "1" },
  );
});

describe("postCompany", () => {
  itBehavesLikePost(
    postCompany,
    "GAPP/Company.php",
    { name_company: "Empresa Teste", cnpj_company: "00.000.000/0001-00", group_id_fk: "1" },
  );
});

describe("postUnit", () => {
  itBehavesLikePost(
    postUnit,
    "GAPP/Units.php",
    { desc_unit: "Filial SP", company_id_fk: 1, group_id_fk: "1" },
  );
});

describe("postDepartament", () => {
  itBehavesLikePost(
    postDepartament,
    "GAPP/Departament.php",
    { desc_departament: "TI", unit_id_fk: 3, group_id_fk: "1" },
  );
});

describe("postSubdepartament", () => {
  itBehavesLikePost(
    postSubdepartament,
    "GAPP/Subdepartament.php",
    { desc_subdepartament: "Desenvolvimento", dep_id_fk: 5, group_id_fk: "1" },
  );
});
