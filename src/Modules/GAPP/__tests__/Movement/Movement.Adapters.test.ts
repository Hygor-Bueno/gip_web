/**
 * Testa todos os adaptadores da tela de Movimentações.
 * Cobre getActives, getVehicles, getMovimentations, getDepartamentsByUnit,
 * getSubdepartamentsByDep, postMovimentation e putMovimentation.
 */

jest.mock("../../../../Util/Utils", () => ({
  fetchDataFull: jest.fn(),
}));

import {
  getActives,
  getVehicles,
  getMovimentations,
  getDepartamentsByUnit,
  getSubdepartamentsByDep,
  postMovimentation,
  putMovimentation,
} from "../../Movement/Adapters/MovementAdapters";
import { fetchDataFull } from "../../../../Util/Utils";

const mockFetch = fetchDataFull as jest.Mock;

const successList = { error: false, data: [{ id: 1 }] };
const errorResp   = { error: true,  message: "Servidor indisponível" };

beforeEach(() => mockFetch.mockResolvedValue(successList));
afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// getActives
// ─────────────────────────────────────────────────────────────────────────────
describe("getActives", () => {
  it("deve usar method GET", async () => {
    await getActives();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it("deve chamar o endpoint GAPP/Active.php", async () => {
    await getActives();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ pathFile: "GAPP/Active.php" }));
  });

  it("deve enviar parâmetro actplc=1", async () => {
    await getActives();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("actplc=1") })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    const result = await getActives();
    expect(result).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    const result = await getActives();
    expect(result.error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getVehicles
// ─────────────────────────────────────────────────────────────────────────────
describe("getVehicles", () => {
  it("deve usar method GET", async () => {
    await getVehicles();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it("deve chamar o endpoint GAPP/Vehicle.php", async () => {
    await getVehicles();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ pathFile: "GAPP/Vehicle.php" }));
  });

  it("deve enviar parâmetro all=1", async () => {
    await getVehicles();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("all=1") })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    expect(await getVehicles()).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    expect((await getVehicles()).error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMovimentations
// ─────────────────────────────────────────────────────────────────────────────
describe("getMovimentations", () => {
  it("deve usar method GET", async () => {
    await getMovimentations();
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it("deve chamar o endpoint GAPP/Movimentation.php", async () => {
    await getMovimentations();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Movimentation.php" })
    );
  });

  it("deve enviar parâmetro all=1", async () => {
    await getMovimentations();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("all=1") })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    expect(await getMovimentations()).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    expect((await getMovimentations()).error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getDepartamentsByUnit
// ─────────────────────────────────────────────────────────────────────────────
describe("getDepartamentsByUnit", () => {
  it("deve usar method GET", async () => {
    await getDepartamentsByUnit(5);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it("deve chamar o endpoint GAPP/Departament.php", async () => {
    await getDepartamentsByUnit(5);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Departament.php" })
    );
  });

  it("deve incluir unit_id_fk na url com número", async () => {
    await getDepartamentsByUnit(7);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("unit_id_fk=7") })
    );
  });

  it("deve aceitar unitId como string", async () => {
    await getDepartamentsByUnit("3");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("unit_id_fk=3") })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    expect(await getDepartamentsByUnit(1)).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    expect((await getDepartamentsByUnit(1)).error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getSubdepartamentsByDep
// ─────────────────────────────────────────────────────────────────────────────
describe("getSubdepartamentsByDep", () => {
  it("deve usar method GET", async () => {
    await getSubdepartamentsByDep(2);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  });

  it("deve chamar o endpoint GAPP/Subdepartament.php", async () => {
    await getSubdepartamentsByDep(2);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Subdepartament.php" })
    );
  });

  it("deve incluir dep_id_fk na url", async () => {
    await getSubdepartamentsByDep(9);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("dep_id_fk=9") })
    );
  });

  it("deve aceitar depId como string", async () => {
    await getSubdepartamentsByDep("4");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: expect.stringContaining("dep_id_fk=4") })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    expect(await getSubdepartamentsByDep(1)).toEqual(successList);
  });

  it("deve retornar erro quando servidor falha", async () => {
    mockFetch.mockResolvedValue(errorResp);
    expect((await getSubdepartamentsByDep(1)).error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// postMovimentation
// ─────────────────────────────────────────────────────────────────────────────
describe("postMovimentation", () => {
  const payload = {
    active_id_fk:       1,
    unit_id_fk:         2,
    dep_id_fk:          3,
    sub_dep_id_fk:      null,
    type_movimentation: "internal",
    obs_movimentation:  "Transferência de teste",
  };

  it("deve usar method POST", async () => {
    await postMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
  });

  it("deve chamar o endpoint GAPP/Movimentation.php", async () => {
    await postMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Movimentation.php" })
    );
  });

  it("deve incluir v2=1&smart=ON na url", async () => {
    await postMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&v2=1&smart=ON" })
    );
  });

  it("deve enviar o payload completo", async () => {
    await postMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ params: payload }));
  });

  it("deve retornar a resposta do servidor em caso de sucesso", async () => {
    expect(await postMovimentation(payload)).toEqual(successList);
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResp);
    const result = await postMovimentation(payload);
    expect(result.error).toBe(true);
    expect(result.message).toBe("Servidor indisponível");
  });

  it("deve retornar erro de servidor 500", async () => {
    mockFetch.mockResolvedValue({ error: true, message: "Erro interno do servidor" });
    expect((await postMovimentation(payload)).error).toBe(true);
  });

  it("deve retornar erro de servidor 400", async () => {
    mockFetch.mockResolvedValue({ error: true, message: "Requisição inválida" });
    expect((await postMovimentation(payload)).message).toBe("Requisição inválida");
  });

  it("deve aceitar dep_id_fk e sub_dep_id_fk nulos", async () => {
    const p = { ...payload, dep_id_fk: null, sub_dep_id_fk: null };
    await postMovimentation(p);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ params: p }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// putMovimentation
// ─────────────────────────────────────────────────────────────────────────────
describe("putMovimentation", () => {
  const payload = { mov_id: 10, status_movimentation: "0" };

  it("deve usar method PUT", async () => {
    await putMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "PUT" }));
  });

  it("deve chamar o endpoint GAPP/Movimentation.php", async () => {
    await putMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Movimentation.php" })
    );
  });

  it("deve incluir v2=1&smart=ON na url", async () => {
    await putMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&v2=1&smart=ON" })
    );
  });

  it("deve enviar o payload correto", async () => {
    await putMovimentation(payload);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ params: payload }));
  });

  it("deve retornar resposta de sucesso", async () => {
    expect(await putMovimentation(payload)).toEqual(successList);
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResp);
    const result = await putMovimentation(payload);
    expect(result.error).toBe(true);
    expect(result.message).toBe("Servidor indisponível");
  });

  it("deve suportar ativação (status '1') e inativação (status '0')", async () => {
    await putMovimentation({ mov_id: 1, status_movimentation: "1" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { mov_id: 1, status_movimentation: "1" } })
    );

    await putMovimentation({ mov_id: 1, status_movimentation: "0" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { mov_id: 1, status_movimentation: "0" } })
    );
  });
});
