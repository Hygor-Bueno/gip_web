/**
 * Testa a lógica de dirty-check usada no FormActive (hasChanged).
 * A função compara dois objetos via JSON.stringify e retorna true
 * se houver qualquer diferença — controlando quais PUTs são disparados.
 */
export {};

const hasChanged = (current: object, initial: object): boolean =>
  JSON.stringify(current) !== JSON.stringify(initial);

// ─────────────────────────────────────────────────────────────────────────────
describe("hasChanged — dirty check do FormActive", () => {

  it("deve retornar false quando os objetos são iguais", () => {
    const a = { brand: "Toyota", model: "Corolla" };
    const b = { brand: "Toyota", model: "Corolla" };
    expect(hasChanged(a, b)).toBe(false);
  });

  it("deve retornar true quando um campo de string mudou", () => {
    const initial = { brand: "Toyota", model: "Corolla" };
    const current = { brand: "Honda",  model: "Corolla" };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando um campo numérico mudou", () => {
    const initial = { value_purchase: 90000 };
    const current = { value_purchase: 95000 };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando um campo boolean mudou", () => {
    const initial = { is_vehicle: false };
    const current = { is_vehicle: true  };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando um campo foi adicionado", () => {
    const initial: Record<string, unknown> = { brand: "Toyota" };
    const current = { brand: "Toyota", model: "Corolla" };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando list_items ganhou um item", () => {
    const initial = { list_items: { list: ["Extintor"] } };
    const current = { list_items: { list: ["Extintor", "Estepe"] } };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar false quando list_items tem os mesmos itens", () => {
    const initial = { list_items: { list: ["Extintor", "Estepe"] } };
    const current = { list_items: { list: ["Extintor", "Estepe"] } };
    expect(hasChanged(current, initial)).toBe(false);
  });

  it("deve retornar true quando place_purchase mudou", () => {
    const initial = { place_purchase: { city: "São Paulo", state: "SP" } };
    const current = { place_purchase: { city: "Campinas",  state: "SP" } };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar false para objetos vazios iguais", () => {
    expect(hasChanged({}, {})).toBe(false);
  });

  it("deve retornar true quando franchise_list ganhou uma franquia", () => {
    const initial = { franchise_list: { list: [] } };
    const current = { franchise_list: { list: [{ description: "Para-brisa", value: "800" }] } };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando valor de franquia foi alterado", () => {
    const initial = { franchise_list: { list: [{ description: "Para-brisa", value: "800" }] } };
    const current = { franchise_list: { list: [{ description: "Para-brisa", value: "1200" }] } };
    expect(hasChanged(current, initial)).toBe(true);
  });

  it("deve retornar true quando shielding mudou de true para false", () => {
    const initial = { shielding: true  };
    const current = { shielding: false };
    expect(hasChanged(current, initial)).toBe(true);
  });
});
