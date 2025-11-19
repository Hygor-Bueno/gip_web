import { z } from "zod";
import { SelectOption } from "../../../Components/CustomForm";

const statusOptions: SelectOption[] = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "cancelado", label: "Cancelado" },
];

const deliveryLocations: SelectOption[] = [
  { value: "loja", label: "Loja" },
  { value: "domicilio", label: "Domicílio" },
  { value: "outro", label: "Outro" },
];

export const fieldsets = [
  {
    legend: { text: "Dados do Cliente" },
    row: true,
    columns: 3,
    items: [
      {
        label: "Código",
        name: "clienteCodigo",
        mandatory: true,
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          name: "clienteCodigo",
          placeholder: "Código do cliente",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Cliente",
        name: "clienteNome",
        mandatory: true,
        width: "col-md-5 mb-3",
        captureValue: {
          type: "text",
          name: "clienteNome",
          placeholder: "Nome do cliente",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Telefone",
        name: "clienteTelefone",
        width: "col-md-4 mb-3",
        captureValue: {
          type: "text",
          name: "clienteTelefone",
          placeholder: "(00) 00000-0000",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Email",
        name: "clienteEmail",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "text",               
          inputMode: "email",         
          name: "clienteEmail",
          placeholder: "email@exemplo.com",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Data",
        name: "clienteData",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "date",
          name: "clienteData",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Status do Pedido",
        name: "statusPedido",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "select",
          name: "statusPedido",
          options: statusOptions,
          className: "form-select",
        },
        labelClass: "form-label",
      },
    ],
  },
  {
    legend: { text: "Detalhes do Pedido" },
    row: true,
    columns: 3,
    items: [
      {
        label: "Itens",
        name: "pedidoItens",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "item-selector",
          name: "pedidoItens",
          placeholder: "Itens do pedido",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Observação",
        name: "pedidoObservacao",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "textarea",
          name: "pedidoObservacao",
          placeholder: "Observações adicionais",
          className: "form-control",
          rows: 3,
        },
        labelClass: "form-label",
      },
      {
        label: "Sinal",
        name: "pedidoSinal",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",               
          inputMode: "decimal", 
          name: "pedidoSinal",
          placeholder: "0,00",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Pendente",
        name: "pedidoPendente",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          inputMode: "decimal",
          name: "pedidoPendente",
          placeholder: "0,00",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Total",
        name: "pedidoTotal",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          inputMode: "decimal",
          name: "pedidoTotal",
          placeholder: "0,00",
          className: "form-control",
        },
        labelClass: "form-label",
      },
    ],
  },
  {
    legend: { text: "Dados da Entrega" },
    row: true,
    columns: 3,
    items: [
      {
        label: "Data",
        name: "entregaData",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "date",
          name: "entregaData",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Hora",
        name: "entregaHora",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "time",
          name: "entregaHora",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Local de Entrega",
        name: "entregaLocal",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "select",
          name: "entregaLocal",
          options: deliveryLocations,
          className: "form-select",
        },
        labelClass: "form-label",
      },
    ],
  },
];

export default { fieldsets };