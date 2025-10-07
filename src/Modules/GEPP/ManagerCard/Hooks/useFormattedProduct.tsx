import { formatDateBR } from "../../../../Util/Util";


export default function useFormattedProduct(currentProduct: any[]) {
  const oracleData = currentProduct?.[0] || {};
  const mySqlData = currentProduct?.[1] || {};

  return {
    categoryName: oracleData?.category,
    code_category: oracleData?.code_category,
    code_family: oracleData?.code_family,
    code_product: oracleData?.code_product,
    sellout: mySqlData?.sellout,
    observation: mySqlData?.observation,
    description: oracleData?.description || mySqlData?.description,
    ean: oracleData?.ean || mySqlData?.ean,
    expiration_date: oracleData?.expiration_date || mySqlData?.expiration_date,
    first_date: formatDateBR(oracleData?.first_date),
    last_date: formatDateBR(oracleData?.last_date),
    meta: oracleData?.meta,
    quantity: oracleData?.quantity || mySqlData?.quantity,
    store: oracleData?.store || mySqlData?.store,
    status_product: mySqlData?.status_product,
    id_status_step_fk: mySqlData?.id_status_step_fk,
    id_reasons_fk: mySqlData?.id_reasons_fk,
    store_number: oracleData?.store_number || mySqlData?.store_number,
    total_quantity: oracleData?.total_quantity,
    value: oracleData?.value,
    price: mySqlData?.price,
    new_price: mySqlData?.new_price,
    created_name: mySqlData?.created_name,
    updated_name: mySqlData?.updated_name
  };
}
