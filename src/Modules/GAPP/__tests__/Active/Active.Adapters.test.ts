import {
  ActivePutData,
  VehiclePutData,
  InsurancePutData,
  ActiveData,
  ActiveVehicleData,
  ActiveInsuranceData,
  ActiveDriverData,
  ActiveUnitsData,
  ActiveCompanyData,
  ActiveTypeData,
  ActiveTypeFuelData,
  ActiveDepartamentData,
} from "../../Active/Adapters/Adapters";

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

// ─────────────────────────────────────────────────────────────────────────────
// PUTs
// ─────────────────────────────────────────────────────────────────────────────
describe("ActivePutData", () => {

  it("deve chamar fetchDataFull com method PUT", async () => {
    await ActivePutData({ brand: "Toyota" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deve chamar o endpoint GAPP/Active.php", async () => {
    await ActivePutData({ brand: "Toyota" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Active.php" })
    );
  });

  it("deve incluir v2=1&smart=ON na url", async () => {
    await ActivePutData({ brand: "Toyota" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&v2=1&smart=ON" })
    );
  });

  it("deve retornar a resposta do servidor", async () => {
    const result = await ActivePutData({ brand: "Toyota" });
    expect(result).toEqual(successResponse);
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResponse);
    const result = await ActivePutData({ brand: "Toyota" });
    expect(result.error).toBe(true);
    expect(result.message).toBe("Servidor indisponível");
  });
});

describe("VehiclePutData", () => {

  it("deve chamar fetchDataFull com method PUT", async () => {
    await VehiclePutData({ license_plates: "ABC-1234" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deve chamar o endpoint GAPP/Vehicle.php", async () => {
    await VehiclePutData({ license_plates: "ABC-1234" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Vehicle.php" })
    );
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResponse);
    const result = await VehiclePutData({ license_plates: "ABC-1234" });
    expect(result.error).toBe(true);
  });
});

describe("InsurancePutData", () => {

  it("deve chamar fetchDataFull com method PUT", async () => {
    await InsurancePutData({ id_insurance: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deve chamar o endpoint GAPP/Insurance.php", async () => {
    await InsurancePutData({ id_insurance: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Insurance.php" })
    );
  });

  it("deve retornar erro quando servidor responde com error: true", async () => {
    mockFetch.mockResolvedValue(errorResponse);
    const result = await InsurancePutData({ id_insurance: 1 });
    expect(result.error).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GETs
// ─────────────────────────────────────────────────────────────────────────────
describe("ActiveData", () => {

  it("deve chamar fetchDataFull com method GET", async () => {
    await ActiveData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: "GET" })
    );
  });

  it("deve chamar o endpoint GAPP/Active.php", async () => {
    await ActiveData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Active.php" })
    );
  });

  it("deve incluir &all=1 na urlComplement", async () => {
    await ActiveData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&all=1" })
    );
  });

  it("deve retornar os dados da resposta", async () => {
    const result = await ActiveData();
    expect(result.data).toEqual([{ id: 1 }]);
  });
});

describe("ActiveVehicleData", () => {

  it("deve chamar o endpoint GAPP/Vehicle.php", async () => {
    await ActiveVehicleData("42");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Vehicle.php" })
    );
  });

  it("deve incluir active_id_fk na urlComplement", async () => {
    await ActiveVehicleData("42");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ urlComplement: "&active_id_fk=42" })
    );
  });
});

describe("ActiveInsuranceData", () => {

  it("deve chamar o endpoint GAPP/Insurance.php", async () => {
    await ActiveInsuranceData(10);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathFile: "GAPP/Insurance.php" })
    );
  });

  it("deve incluir vehicle_id_fk na urlComplement", async () => {
    await ActiveInsuranceData(10);
    const call = mockFetch.mock.calls[0][0];
    expect(call.urlComplement).toContain("vehicle_id_fk=10");
  });

  it("deve usar vehicle_id_fk=0 quando não informado", async () => {
    await ActiveInsuranceData();
    const call = mockFetch.mock.calls[0][0];
    expect(call.urlComplement).toContain("vehicle_id_fk=0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GETs de tabelas de apoio
// ─────────────────────────────────────────────────────────────────────────────
describe("Endpoints de tabelas de apoio", () => {

  const cases = [
    { fn: ActiveDriverData,      path: "GAPP/Driver.php"      },
    { fn: ActiveUnitsData,       path: "GAPP/Units.php"       },
    { fn: ActiveCompanyData,     path: "GAPP/Company.php"     },
    { fn: ActiveTypeData,        path: "GAPP/ActiveType.php"  },
    { fn: ActiveTypeFuelData,    path: "GAPP/TypeFuel.php"    },
    { fn: ActiveDepartamentData, path: "GAPP/Departament.php" },
  ];

  cases.forEach(({ fn, path }) => {
    it(`${fn.name} deve chamar ${path} com GET`, async () => {
      await fn();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ method: "GET", pathFile: path })
      );
    });
  });
});
