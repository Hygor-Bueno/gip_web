export const formOrderData = (
  values: any = {},
  optionStatus: { label: string; value: string }[] = [],
  optionTipo: { label: string; value: string }[] = [],
  optionOutra: { label: string; value: string }[] = [],
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) => [
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Observações",
      captureValue: {
        className: "form-control",
        type: "text",
        name: "observation",
        value: values.observation ?? "",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Sinal",
      mandatory: true,
      captureValue: {
        className: "form-control",
        type: "text",
        name: "sinal",
        value: values.sinal ?? "",
        placeholder: "R$ 0,00",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Pendente",
      captureValue: {
        className: "form-control",
        type: "text",
        name: "pending",
        value: values.pending ?? "",
        placeholder: "R$ 0,00",
        onChange
      }
    }
  },
  {
    attributes: { className: "my-2 col-12 col-md-4" },
    item: {
      label: "Total",
      captureValue: {
        className: "form-control",
        type: "text",
        name: "total",
        value: values.totla ?? "",
        placeholder: "R$ 0,00",
        onChange
      }
    }
  }
];
