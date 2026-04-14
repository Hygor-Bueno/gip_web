/**
 * Testa todos os adaptadores GET da tela de Configurações.
 * Cobre: getActiveTypes, getActiveClasses, getCompanies,
 *        getUnits, getDepartaments, getSubdepartaments.
 */

jest.mock("../../../../Util/Utils", () => ({
  fetchDataFull: jest.fn(),
}));

import {
  getActiveTypes,
  getActiveClasses,
  getCompanies,
  getUnits,
  getDepartaments,
  getSubdepartaments,
} from "../../Settings/Adapters/SettingsAdapters";
import { fetchDataFull } from "../../../../Util/Utils";

const mockFetch = fetchDataFull as jest.Mock;

const successList = { error: false, data: [{ id: 1 }] };
const errorResp   = { error: true,  message: "Servidor indisponível" };

beforeEach(() => mockFetch.mockResolvedValue(successList));
afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// Shared behaviour for every GET adapter
// ─────────────────────────────────────────────────────────────────────────────
function itBehavesLikeGetAll(
  fn: () => ReturnType<typeof fetchDataFull>,
  expectedPath: string,
) {
  it("deve usar method GET", async () => {
    await fn();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it(`deve chamar o endpoint ${expectedPath}`, async () => {
    await fn();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: expectedPath }),
    );
  });

  it("deve enviar urlComplement '&all=1'", async () => {
    await fn();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&all=1" }),
    );
  });

  it("deve enviar params null", async () => {
    await fn();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: null }),
    );
  });

  it("deve retornar a resposta do servidor em caso de sucesso", async () => {
    expect(await fn()).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    const result = await fn();
    expect(result.error).toBe(true);
    expect(result.message).toBe("Servidor indisponível");
  });
}

// ─────────────────────────────────────────────────────────────────────────────
describe("getActiveTypes", () => {
  itBehavesLikeGetAll(getActiveTypes, "GAPP/ActiveType.php");
});

describe("getActiveClasses", () => {
  itBehavesLikeGetAll(getActiveClasses, "GAPP/ActiveClass.php");
});

describe("getCompanies", () => {
  itBehavesLikeGetAll(getCompanies, "GAPP/Company.php");
});

describe("getUnits", () => {
  itBehavesLikeGetAll(getUnits, "GAPP/Units.php");
});

describe("getDepartaments", () => {
  itBehavesLikeGetAll(getDepartaments, "GAPP/Departament.php");
});

describe("getSubdepartaments", () => {
  itBehavesLikeGetAll(getSubdepartaments, "GAPP/Subdepartament.php");
});
