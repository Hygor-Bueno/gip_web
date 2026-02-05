import { PlaceAddress } from "../FormInterfaces/FormActiveInterface";

/**
 * Monta o formulário de endereço de compra do ativo.
 * Em termos de negócio, define quais dados de localização
 * são registrados para identificar onde o ativo foi adquirido.
 */
export const formAddress = (
    values: PlaceAddress = {},
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) => [
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Loja', captureValue:{ type: 'text', name: "place_purchase.store", className: "form-control", value: values.store ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Lougradouro', captureValue:{ type: 'text', name: "place_purchase.public_place", className: "form-control", value: values.public_place ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Bairro', captureValue:{ type: 'text', name: "place_purchase.neighborhood", className: "form-control", value: values.neighborhood ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Cidade', captureValue:{ type: 'text', name: "place_purchase.city", className: "form-control", value: values.city ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Estado', captureValue:{ type: 'text', name: "place_purchase.state", className: "form-control", value: values.state ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'CEP', captureValue:{ type: 'text', name: "place_purchase.zip_code", className: "form-control", value: values.zip_code ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Numero', captureValue:{ type: 'text', name: "place_purchase.number", className: "form-control", value: values.number ?? '', onChange } } },
    { attributes: { className: 'my-2 col-6 col-md-3' }, item: { label: 'Complemento', captureValue:{ type: 'text', name: "place_purchase.complement", className: "form-control", value: values.complement ?? '', onChange } } },
];