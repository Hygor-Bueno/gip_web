export const listColumnsOcult = [
  "signalValue",
  "menu",
  "idMenu",
  "pluMenu",
  "typeRice",
  "dessert",
  "obs",
  "userId",
  "store",
  "nameClient",
  "deliveryDate",
  "deliveryHour",
  "deliveryStore",
  "total"
];

export const renamedColumns = {
  idOrder: "Cód",
  fone: "Telefone",
  email: "Email",
  description: "Descrição",
  dateOrder: "Data",
  delivered:  "Status",
};


export const behaviorColumns = {
  description: (value: string) => {
    return value.length > 100 ? `${value.slice(0, 140)}...` : "";
  }
}

export const columnSizes: Record<string, string | number> = {
  idOrder: "80px",
  fone: "140px",
  email: "220px",
  dateOrder: "110px",
  delivered: "100px",
  description: "100px",
};
