import { formActive } from "../../Active/Component/FormActive/FormSchema/FormActive.schema";
import { formAddress } from "../../Active/Component/FormActive/FormSchema/FormAddress.schema";
import { formVehicle } from "../../Active/Component/FormActive/FormSchema/FormVehicle.schema";
import { formInsurance } from "../../Active/Component/FormActive/FormSchema/FormInsurance.schema";

const noop = () => {};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getMandatoryLabels = (fields: any[]) =>
  fields.filter((f) => f.item.mandatory === true).map((f) => f.item.label);

const getRequiredNames = (fields: any[]) =>
  fields
    .filter((f) => (f.item.captureValue as any)?.required === true)
    .map((f) => (f.item.captureValue as any).name);

// ─────────────────────────────────────────────────────────────────────────────
describe("FormActive.schema — campos obrigatórios", () => {

  const fields = formActive({}, [], [], [], noop);

  it("deve marcar Marca como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Marca");
  });

  it("deve marcar Modelo como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Modelo");
  });

  it("deve marcar Nº NF como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Nº NF");
  });

  it("deve marcar Preço como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Preço");
  });

  it("deve marcar Data de aquisição como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Data de aquisição");
  });

  it("deve marcar Comprado por como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Comprado por");
  });

  it("deve marcar Disponibilizado para como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Disponibilizado para");
  });

  it("deve marcar Status do ativo como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Status do ativo");
  });

  it("deve marcar Classe do ativo como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Classe do ativo");
  });

  it("deve ter required: true nos campos obrigatórios", () => {
    const required = getRequiredNames(fields);
    expect(required).toContain("brand");
    expect(required).toContain("model");
    expect(required).toContain("number_nf");
    expect(required).toContain("value_purchase");
    expect(required).toContain("date_purchase");
  });

  it("não deve marcar Foto como mandatory", () => {
    expect(getMandatoryLabels(fields)).not.toContain("Foto (arquivo ou URL)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FormAddress.schema — campos obrigatórios", () => {

  const fields = formAddress({}, noop);

  it("deve marcar Estabelecimento como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Estabelecimento");
  });

  it("deve marcar Logradouro como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Logradouro");
  });

  it("deve marcar Bairro como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Bairro");
  });

  it("deve marcar Cidade como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Cidade");
  });

  it("deve marcar Estado como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Estado");
  });

  it("deve marcar CEP como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("CEP");
  });

  it("deve marcar Nº como mandatory", () => {
    expect(getMandatoryLabels(fields)).toContain("Nº");
  });

  it("não deve marcar Complemento como mandatory", () => {
    expect(getMandatoryLabels(fields)).not.toContain("Complemento");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FormVehicle.schema — campos obrigatórios", () => {

  const fields = formVehicle({}, [], [], noop);

  const mandatoryLabels = getMandatoryLabels(fields);

  it("deve marcar Placa como mandatory", () => {
    expect(mandatoryLabels).toContain("Placa");
  });

  it("deve marcar Chassi como mandatory", () => {
    expect(mandatoryLabels).toContain("Chassi");
  });

  it("deve marcar Cor como mandatory", () => {
    expect(mandatoryLabels).toContain("Cor");
  });

  it("deve marcar RENAVAM como mandatory", () => {
    expect(mandatoryLabels).toContain("RENAVAM");
  });

  it("deve marcar Potência como mandatory", () => {
    expect(mandatoryLabels).toContain("Potência");
  });

  it("deve marcar Combustível como mandatory", () => {
    expect(mandatoryLabels).toContain("Combustível");
  });

  it("deve marcar Blindagem como mandatory", () => {
    expect(mandatoryLabels).toContain("Blindagem");
  });

  it("não deve marcar Cilindrada como mandatory", () => {
    expect(mandatoryLabels).not.toContain("Cilindrada");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("FormInsurance.schema — campos obrigatórios", () => {

  const fields = formInsurance({}, noop);

  const mandatoryLabels = getMandatoryLabels(fields);

  it("deve marcar CEP de risco como mandatory", () => {
    expect(mandatoryLabels).toContain("CEP de risco");
  });

  it("deve marcar Valor do seguro como mandatory", () => {
    expect(mandatoryLabels).toContain("Valor do seguro");
  });

  it("deve marcar Danos materiais como mandatory", () => {
    expect(mandatoryLabels).toContain("Danos materiais");
  });

  it("deve marcar Danos morais como mandatory", () => {
    expect(mandatoryLabels).toContain("Danos morais");
  });

  it("deve marcar Cobertura de vidros como mandatory", () => {
    expect(mandatoryLabels).toContain("Cobertura de vidros");
  });

  it("deve marcar Assistência 24h como mandatory", () => {
    expect(mandatoryLabels).toContain("Assistência 24h");
  });

  it("deve marcar KM de reboque como mandatory", () => {
    expect(mandatoryLabels).toContain("KM de reboque");
  });

  it("deve marcar Seguradora como mandatory", () => {
    expect(mandatoryLabels).toContain("Seguradora");
  });

  it("deve marcar Cobertura como mandatory", () => {
    expect(mandatoryLabels).toContain("Cobertura");
  });

  it("deve marcar Status do seguro como mandatory", () => {
    expect(mandatoryLabels).toContain("Status do seguro");
  });

  it("não deve marcar Danos corporais como mandatory", () => {
    expect(mandatoryLabels).not.toContain("Danos corporais");
  });
});
