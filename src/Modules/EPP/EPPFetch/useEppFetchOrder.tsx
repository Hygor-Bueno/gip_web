import { useState, useEffect } from "react";
import { useConnection } from "../../../Context/ConnContext";

function useEppFetchOrder(shopWithNumber: string = 'Interlagos_1') {
  const { fetchData } = useConnection();
  const [allOrders, setAllOrders] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const result = await fetchData({
          method: "GET",
          params: null,
          pathFile: "EPP/Order.php",
          urlComplement: `&deliveryStore=${shopWithNumber}`, // Ainda tenho que 
        });

        if (isMounted) {
          setAllOrders(result);
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

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return { allOrders, loading, error };
}

export default useEppFetchOrder;
