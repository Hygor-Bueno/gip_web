export const formDelivery = (
  values: any = {},
  optionStatus: { label: string; value: string }[] = [],
  optionTipo: { label: string; value: string }[] = [],
  optionOutra: { label: string; value: string }[] = [],
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) => [
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Data",
      captureValue: {
        className: "form-control",
        type: "date",
        name: "date_delivery",
        value: values.date_delivery ?? "",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Hora",
      mandatory: true,
      captureValue: {
        className: "form-control",
        type: "hors",
        name: "hors_delivery",
        value: values.hors_delivery ?? "",
        placeholder: "R$ 0,00",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Local da entrega",
      captureValue: {
        className: "form-control",
        type: "select",
        name: "local",
        value: values.local ?? "",
        placeholder: "R$ 0,00",
        onChange
      }
    }
  }
];
