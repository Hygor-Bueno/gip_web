import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSalesData } from "../../Hooks/useSalesData";
import { dataAllProd, dataLogSale } from "../../Interfaces/InterfacesEPP";
import ProductList from "./ProductList";
import ConfirmedList from "./ConfirmedList";
import { getProductKey } from "../../../../Util/Util";

interface CardSaleEPPProps {
  setItems: any;
  dataLogSale: dataLogSale[];
}

const CardSaleEPP: React.FC<CardSaleEPPProps> = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<dataAllProd[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmedItems, setConfirmedItems] = useState<Record<string, { product: dataAllProd; quantity: number; subtotal: number }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchMenuProd, fetchAllMenuProd, fetchMenuProdCategory, fetchLogSale } = useSalesData();

  useEffect(() => {
    const cached = localStorage.getItem("consico_products");
    if (cached) {
      try {
        setProducts(JSON.parse(cached));
      } catch {
        localStorage.removeItem("consico_products");
      }
    }
  }, []);
  
  useEffect(() => {
    if (products.length === 0 || props.dataLogSale.length === 0) return;

    setSelectedItems(prev => {
      const updated = new Set(prev);
      products.forEach(product => {
        const isInLog = props.dataLogSale.some(log => log.eppIdProduct === product.id_product);
        console.log(isInLog);
        if (isInLog) {
          updated.add(getProductKey(product));
        }
      });
      return updated;
    });
  }, [products, props.dataLogSale]);

  const loadProducts = useCallback(async () => {
    if (products.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      await fetchMenuProd("", 1);
      const all = await fetchAllMenuProd();
      await fetchMenuProdCategory();
      //setProducts(all);
      localStorage.setItem("consico_products", JSON.stringify(all));
    } catch (err) {
      setError("Erro ao carregar produtos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [products.length, fetchMenuProd, fetchAllMenuProd, fetchMenuProdCategory]);

  const openModal = useCallback(async (e: any) => {
    e.preventDefault();
    await loadProducts();
    setShowModal(true);
  }, [loadProducts]);

  const toggleSelection = useCallback((item: dataAllProd) => {
    const key = getProductKey(item);
    setSelectedItems(prev => {
      const copy = new Set(prev);
      if (copy.has(key)) {
        copy.delete(key);
      } else {
        copy.add(key);
      }
      return copy;
    });
  }, []);

  const handleQuantityChange = useCallback(
    async (item: dataAllProd, value: string) => {
      const qty = parseFloat(value);
      if (isNaN(qty) || qty < 0) return;
      const key = getProductKey(item);
      try {
        const [data]: any = await fetchMenuProd(item.id_category.toString(), 1);
        const unitPrice = parseFloat(data.PRECO.replace(",", "."));
        const subtotal = qty * unitPrice;
        setConfirmedItems(prev => ({ ...prev, [key]: { product: item, quantity: qty, subtotal } }));
        setSelectedItems(prev => {
          if (prev.has(key)) return prev;
          const copy = new Set(prev);
          copy.add(key);
          return copy;
        });
      } catch (err) {
        setError("Erro ao calcular subtotal.");
        console.error(err);
      }
    },
    [fetchMenuProd]
  );

  const confirmSelection = useCallback(() => {
    setSelectedItems(new Set());
    setShowModal(false);
  }, []);

  const removeConfirmedItem = useCallback((key: string) => {
    setConfirmedItems(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setSelectedItems(prev => {
      const copy = new Set(prev);
      copy.delete(key);
      return copy;
    });
  }, []);

  const getQuantity = useCallback(
    (item: dataAllProd) => {
      const key = getProductKey(item);
      return confirmedItems[key]?.quantity ?? "";
    },
    [confirmedItems]
  );

  const total = useMemo(() => {
    const sum = Object.values(confirmedItems).reduce((acc, cur) => acc + cur.subtotal, 0);
    return sum.toFixed(2).replace(".", ",");
  }, [confirmedItems]);
  

  console.log(selectedItems)

  return (
    <React.Fragment>
      <div className="d-flex gap-2 mb-2">
        <button className="btn btn-primary" onClick={openModal} disabled={loading}>
          <i className="fa-solid fa-circle-plus text-white"></i> {loading ? "Carregando..." : "Adicionar Produto"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showModal && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ width: "80vw", maxWidth: "70%", height: "60vh", maxHeight: "400px", margin: "25px auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content p-3 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 id="modal-title" className="modal-title">Adicionar Produtos</h5>
                <strong>Total: R$ {total}</strong>
              </div>
              <div className="d-flex flex-grow-1 gap-3 overflow-hidden" style={{ minHeight: "200px" }}>
                <ProductList
                  dataLogSale={props.dataLogSale}
                  products={products}
                  selectedKeys={selectedItems}
                  getKey={getProductKey}
                  getQuantity={getQuantity}
                  toggleSelection={toggleSelection}
                  handleQuantityChange={handleQuantityChange} 
                />
                <ConfirmedList
                  selectedKeys={selectedItems}
                  confirmedItems={confirmedItems}
                  onRemove={removeConfirmedItem}
                />
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={confirmSelection}
                  disabled={selectedItems.size === 0}
                  aria-disabled={selectedItems.size === 0}
                >
                  Confirmar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default CardSaleEPP;
