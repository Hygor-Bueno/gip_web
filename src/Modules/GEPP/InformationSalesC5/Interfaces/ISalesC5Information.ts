interface DataProps {
  id_products?: string | number;
  store_number?: string;
  user?: string;
  created_at?: string; // Data de análise do produto
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
  id_status_step_fk: string;
  id_reasons_fk: string;
  status_product: string;
  store_number: string;
  total_quantity: string; // Quantidade total vendida
  value: string;
  price?: string;
  new_price?: string;
  created_name: string;
  updated_name: string;
};

export interface ISalesC5Information {
  data?: DataProps;
  product?: ProductProps;
  children?: any;
  loadData?: any;
  setProduct?: any;
};