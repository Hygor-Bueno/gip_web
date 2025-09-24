interface DataProps {
  id?: string | number;
  store?: string;
  user?: string;
  dateTime?: string; // Data de análise do produto
};

interface ProductProps {
  categoryName: string;
  code_category: string;
  code_family: string;
  code_product: string;
  description: string;
  ean: string;
  expiration_date: string; // Data de validade
  first_date: string; // Data da primeira venda
  last_date: string; // Data da última venda
  meta: string;
  quantity: string; // Quantidade em estoque
  store: string;
  store_number: string;
  total_quantity: string; // Quantidade total vendida
  value: string;
  price?: string;
  new_price?: string;
};

export interface ISalesC5Information {
  data?: DataProps;
  product?: ProductProps;
  children?: any;
};