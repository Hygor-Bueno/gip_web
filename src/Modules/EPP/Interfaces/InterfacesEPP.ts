export interface Store {
  id: number;
  number: number;
  description: string;
  cnpj: number;
}

export interface dataOrder {
  dateOrder: string;
  delivered: number;
  deliveryDate: string;
  deliveryHour: string;
  deliveryStore: string;
  description: string;
  dessert: string | null;
  email: string;
  fone: string;
  idMenu: string;
  idOrder: string;
  menu: string | null;
  nameClient: string;
  obs: string;
  pluMenu: string | null;
  signalValue: number;
  store: string;
  total: string;
  typeRice: string | null;
  user_id: number;
}

export interface dataLogSale {
  eppIdLog: number,
  eppIdOrder: string,
  eppIdProduct: number,
  menu: number,
  price: number,
  quantity: number,
}

export interface dataOrderFormatted {
  delivered: string;
  total: string;
  store: string;
  deliveryDate: string;
  dateOrder: string;
  fone: string;
  signalValue: string;
}

export interface dataShop {
    cnpj: number;
    description: string;
    id: number;
    number: number;
}

export interface dataAllProd {
    cat_description: string,
    category: string,
    description: string,
    id_product: number,
    id_category: number,
    id_category_fk: string,
    measure: string,
    price: string,
    status_prod: string
}

export interface dataDetails {
  descricao: string,
  id: number,
  quantidade: number,
  unidade: string, 
  subtotal: string,
}

export interface PayloadOrderPost {
  id_order: number,
  fone: number,
  email: string,
  signal_value: number,
  id_menu: number,
  type_rice: number,
  description: string,
  delivered: number,
  dessert: number,
  store: string,
  name_client: string,
  date_order: string,
  delivery_date: string,
  delivery_hour: string,
  delivery_store: string,
  user_id: number,
  total: number,
  observation: string
}

export interface FormSalesEPPProps {
  stores: Store[];
  dataClient: dataOrder[];
  dataLogSale: dataLogSale[];
}


export interface ProductItemProps {
  item: dataAllProd;
  selected: boolean;
  quantity: number | "";
  onToggle: (item: dataAllProd) => void;
  onQuantityChange: (item: dataAllProd, value: string) => void;
}

export interface ProductListProps {
  products: dataAllProd[];
  dataLogSale: dataLogSale[];
  selectedKeys: Set<string>;
  getKey: (item: dataAllProd) => string;
  getQuantity: (item: dataAllProd) => number | "";
  toggleSelection: (item: dataAllProd) => void;
  handleQuantityChange: (item: dataAllProd, value: string) => void;
}
