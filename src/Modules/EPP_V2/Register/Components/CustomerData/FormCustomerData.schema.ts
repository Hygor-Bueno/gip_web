import { IOrder } from "../../../Interfaces/IOrder.interface";

export const formCustomerData = (
  values: IOrder,
  optionStatus: { label: string; value: string }[] = [],
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) => [
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Código",
      captureValue: {
        className: "form-control",
        type: "number",
        name: "codigo",
        value: values.idOrder ?? 1,
        disabled: true,
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Cliente",
      mandatory: true,
      captureValue: {
        className: "form-control",
        type: "text",
        name: "cliente",
        value: values.nameClient ?? "",
        placeholder: "Nome do cliente",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Telefone",
      captureValue: {
        className: "form-control",
        type: "tel",
        name: "telefone",
        value: values.fone ?? "",
        placeholder: "(11) 99999-9999",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Email",
      captureValue: {
        className: "form-control",
        type: "email",
        name: "email",
        value: values.email ?? "",
        placeholder: "email@exemplo.com",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Data",
      captureValue: {
        className: "form-control",
        type: "date",
        name: "data",
        value: values.dateOrder ?? "",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Status",
      captureValue: {
        className: "form-select",
        type: "select",
        name: "status",
        value: values.delivered ?? "",
        options: [{label: "pendente", values: "1"}, {label: "preparo", values: "2"}, {label: "entregue", values: "3"}],
        onChange
      }
    }
  }
];
