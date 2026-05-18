/**
 * Forma estrutural compartilhada entre IAddressForm (EditExpenses) e
 * AddressForm (Releases) — ambos têm os mesmos 8 campos.
 */
export interface AddressLike {
  name?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  number?: string;
  complement?: string;
}

/**
 * Estrutura do campo `local` esperada pelo backend (`GAPP/ExpensesRegister.php`
 * e `Maintenance.php`). É sempre um objeto com as 8 chaves abaixo — vazias
 * quando o endereço específico não está ativo, preenchidas quando está.
 */
export interface LocalPayload {
  city: string;
  state: string;
  store: string;
  number: string;
  zip_code: string;
  complement: string;
  neighborhood: string;
  public_place: string;
}

// Ordem das chaves alinhada ao payload esperado pelo backend para
// comparações literais ficarem idênticas (a semântica JSON não exige).
const EMPTY_LOCAL: LocalPayload = {
  city: "", state: "", store: "", number: "",
  zip_code: "", complement: "", neighborhood: "", public_place: "",
};

/**
 * Constrói o objeto `local` a partir do estado interno do app, mapeando
 * os nomes internos do `IAddressForm` para os nomes que o backend espera.
 *
 *   internal → payload
 *   name     → store
 *   street   → public_place
 *   district → neighborhood
 *   (demais)   passam direto (city, state, zip_code, number, complement)
 *
 * O nome do estabelecimento (`store`) é resolvido com prioridade:
 *   1. addressForm.name  (se endereço específico ativo)
 *   2. freeText          (input livre da tela de criação)
 *   3. storeName         (nome derivado do store_id_fk selecionado)
 */
export function buildLocalPayload(params: {
  freeText?: string;
  addressActive: boolean;
  addressForm: AddressLike;
  storeName?: string;
}): LocalPayload {
  const { freeText, addressActive, addressForm, storeName } = params;

  const store =
    (addressActive && addressForm.name?.trim()) ||
    freeText?.trim() ||
    storeName?.trim() ||
    "";

  if (!addressActive) {
    return { ...EMPTY_LOCAL, store };
  }

  return {
    city: addressForm.city ?? "",
    state: addressForm.state ?? "",
    store,
    number: addressForm.number ?? "",
    zip_code: addressForm.zip_code ?? "",
    complement: addressForm.complement ?? "",
    neighborhood: addressForm.district ?? "",
    public_place: addressForm.street ?? "",
  };
}
