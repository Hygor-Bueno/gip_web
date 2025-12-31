import { useConnection } from "../../../Context/ConnContext";

function useEppFetchGetOrder() {
  const { fetchData } = useConnection();

  const getOrder = async (cod: number, shop: number = 1) => {
    const result = await fetchData({
      method: "GET",
      params: null,
      pathFile: "EPP/Product.php",
      urlComplement: `&id_product=${cod}&id_shop=${shop}`,
    });

    return result;
  };

  return { getOrder };
}

export default useEppFetchGetOrder;
