import { useEffect, useState } from 'react';
import { useMyContext } from '../../../Context/MainContext';
import { useConnection } from '../../../Context/ConnContext';
import { dataAllProd, dataOrder, dataOrderFormatted, dataShop } from '../Interfaces/InterfacesEPP';
import { formatDate, maskMoney, maskPhone, removeSpecialCharsAndNumbers } from '../../../Util/Util';

export function useSalesData() {
  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  const [dataOrderTable, setDataOrderTable] = useState<dataOrder[]>([]);
  const [dataShop, setDataShop] = useState<dataShop[]>([]);
  const [tableData, setTableData] = useState<dataOrder[]>([]);
  const [tableDataCustom, setTableDataCustom] = useState<dataOrderFormatted[]>([]);
  const [allProd, setAllProd] = useState<dataAllProd[]>([]);

  const [categoryMenu, setCategoryMenu] = useState<any[]>([]);

  const [storeUser, numberStoreUser] = [
    localStorage.getItem('store'),
    localStorage.getItem('num_store'),
  ];

  useEffect(() => {
    fetchAllMenuProd();
    fetchOrderData();
    fetchShopData();
    fetchMenuProdCategory();
  }, []);

  const formatTableData = (data: dataOrder[]): dataOrderFormatted[] => {
    return data.map((item) => ({
      ...item,
      delivered:
        {
          '0': 'Pendente',
          '1': 'Entregue',
          '2': 'Cancelado',
        }[item.delivered.toString()] ?? 'Desconhecido',
      total: maskMoney(parseFloat(item.total)),
      store: removeSpecialCharsAndNumbers(item.store),
      deliveryDate: formatDate(item.deliveryDate),
      dateOrder: formatDate(item.dateOrder),
      fone: maskPhone(item.fone),
      signalValue: maskMoney(item.signalValue),
    }));
  };

  useEffect(() => {
    setTableDataCustom(formatTableData(tableData));
  }, [tableData]);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/Order.php',
        urlComplement: `&deliveryStore=${storeUser}_${numberStoreUser}`,
      });
      const rawData: dataOrder[] = response.data || [];

      setDataOrderTable(rawData);
      setTableData(rawData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogSalePost = async (params: any) => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'POST',
        params: params,
        pathFile: 'EPP_DSB/LogSale.php',
        urlComplement: ''
      });

      if (!response.error) {
        return response;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'CCPP/Shop.php',
        urlComplement: `&company_id=1`,
      });
      setDataShop(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuProd = async (prodId: string, shopId:number): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await fetchData ({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/Product.php',
        urlComplement: `&id_product=${prodId}&id_shop=${shopId}`,
      });
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar Log de Venda:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchLogSale = async (orderId: number): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/LogSale.php',
        urlComplement: `&epp_id_order=${orderId}`,
      });

      return response?.data || [];
    } catch (error) {
      console.error('Erro ao buscar Log de Venda:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (orderId: number): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/Order.php',
        urlComplement: `&id_order=${orderId}`,
      });

      return response?.data || [];
    } catch (error) {
      console.error('Erro ao buscar Log de Venda:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMenuProd = async () => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/Product.php',
        urlComplement: ``,
      });

      setAllProd(response?.data || []);
    } catch (error) {
      console.error('Erro ao buscar Log de Venda:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  const fetchMenuProdCategory = async () => {
    setLoading(true);
    try {
      const response = await fetchData({
        method: 'GET',
        params: null,
        pathFile: 'EPP_DSB/Product.php',
        urlComplement: `&category=1`,
      });

      setCategoryMenu(response?.data || []);
    } catch (error) {
      console.error('Erro ao buscar Log de Venda:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    allProd,
    tableData,
    tableDataCustom,
    fetchOrder,
    fetchLogSale,
    fetchLogSalePost,
    fetchMenuProdCategory,
    fetchAllMenuProd,
    fetchMenuProd,
    dataOrderTable,
    dataShop,
    categoryMenu,
    reloadOrders: fetchOrderData,
    reloadShops: fetchShopData,
  };
}
