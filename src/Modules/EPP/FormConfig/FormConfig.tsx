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
        name: "idOrder",
        mandatory: false,
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          disabled: true,
          name: "idOrder",
          placeholder: "Código do pedido",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Cliente",
        name: "nameClient",
        mandatory: true,
        width: "col-md-5 mb-3",
        captureValue: {
          type: "text",
          name: "nameClient",
          placeholder: "Nome do cliente",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Telefone",
        name: "fone",
        width: "col-md-4 mb-3",
        mandatory: true,
        captureValue: {
          type: "text",
          name: "fone",
          placeholder: "(00) 00000-0000",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Email",
        name: "email",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "text",
          inputMode: "email",
          name: "email",
          placeholder: "email@exemplo.com",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Data",
        name: "deliveryDate",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "date",
          name: "deliveryDate",
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
        name: "description",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "item-selector",
          name: "description",
          placeholder: "Itens do pedido",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Observação",
        name: "obs",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "textarea",
          name: "obs",
          placeholder: "Observações adicionais",
          className: "form-control",
          rows: 3,
        },
        labelClass: "form-label",
      },
      {
        label: "Sinal",
        name: "signalValue",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          inputMode: "decimal",
          name: "signalValue",
          placeholder: "0,00",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Pendente",
        name: "pendingValue",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          inputMode: "decimal",
          name: "pendingValue",
          placeholder: "0,00",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Total",
        name: "total",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "text",
          inputMode: "decimal",
          name: "total",
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
        name: "deliveryDate",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "date",
          name: "deliveryDate",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Hora",
        name: "deliveryHour",
        width: "col-md-3 mb-3",
        captureValue: {
          type: "time",
          name: "deliveryHour",
          className: "form-control",
        },
        labelClass: "form-label",
      },
      {
        label: "Local de Entrega",
        name: "deliveryStore",
        width: "col-md-6 mb-3",
        captureValue: {
          type: "select",
          name: "deliveryStore",
          options: deliveryLocations,
          className: "form-select",
        },
        labelClass: "form-label",
      },
    ],
  },
];

export default { fieldsets };
