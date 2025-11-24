import { useState, useEffect } from "react";
import { useConnection } from "../../../Context/ConnContext";

function useEppFetch() {
  const { fetchData } = useConnection();
  const [allProduct, setAllProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchData({
          method: "GET",
          params: null,
          pathFile: "EPP/Product.php",
          urlComplement: "",
        });

        if (isMounted) {
          setAllProduct(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return { allProduct, loading, error };
}

export default useEppFetch;
