import React, { useEffect, useState } from "react";
import { useSalesData } from "../../Hooks/useSalesData";
import { useShopCard } from "../../Hooks/useShopCard";

type Props = {
  OrderId: any;
  setCaptureHtml: any;
};

function ShopCard({ OrderId, setCaptureHtml }: Props) {

  const { fetchLogSale, fetchMenuProd, categoryMenu, allProd } = useSalesData();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});
  const [productPrices, setProductPrices] = useState<{ [productId: number]: number }>({});
  const [filterMenu, setFilterMenu] = useState<string>('');
  const [filterNameMenu, setFilterNameMenu] = useState<string>('');
  
  const produtosDoCarrinho = useShopCard(selectedProductIds, productQuantities, productPrices, allProd);

  // ele armazena os numeros dos ids
  useEffect(() => {
    async function fetchData() {
      if (OrderId) {
        const logSaleData = await fetchLogSale(OrderId);
        const initialSelectedIds = logSaleData.map((item) => item.eppIdProduct);
        setSelectedProductIds(initialSelectedIds);
        const initialQuantities: { [key: number]: number } = {};
        logSaleData.forEach((item) => {initialQuantities[item.eppIdProduct] = item.quantity;});
        setProductQuantities(initialQuantities);
      }
    };

    async function loadingListProd() {
      const priceMap: { [Key: number]: number } = {};
      const pricePromises = allProd.map(async (prod: any) => {
        const priceData = await fetchMenuProd(prod.id_product, 1);
        if (priceData && priceData.length > 0) {
          priceMap[prod.id_product] = priceData[0].PRECO;
        }
      });
      await Promise.all(pricePromises);
      setProductPrices(priceMap);
    };
    loadingListProd(); 
    
    fetchData();
  }, [OrderId]);

  useEffect(() => {
    setCaptureHtml(produtosDoCarrinho);
  }, [selectedProductIds, productQuantities, productPrices, allProd]);

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);

    async function loadingListProd() {
      const priceMap: { [Key: number]: number } = {};
      const pricePromises = allProd.map(async (prod: any) => {
        const priceData = await fetchMenuProd(prod.id_product, 1);
        if (priceData && priceData.length > 0) {
          priceMap[prod.id_product] = priceData[0].PRECO;
        }
      });
      await Promise.all(pricePromises);
      setProductPrices(priceMap);
    };
    loadingListProd(); 
  };

  const handleCloseModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedProductIds((prevIds) => prevIds.includes(id) ? prevIds.filter((itemId) => itemId !== id) : [...prevIds, id]);
  };

  const handleUnAndKg = (prodId:any) => (e:any) => {
    setProductQuantities((prev) => ({...prev,[prodId]: parseFloat(e.target.value) || 0}));
  };

  const handleTrashFunction = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setProductQuantities({});
    setSelectedProductIds([]);
  }

  return (
    <React.Fragment>
      <button className="btn btn-primary text-white" onClick={handleOpenModal}>
        Adicionar mais produtos
      </button>

      {isModalOpen && (
        <React.Fragment>
          <div className="modal show d-block justify-content-center align-items-center" tabIndex={-1} role="dialog">
            <div
              className="modal-dialog modal-xl"
              role="document"
              style={{
                width: '90vw',
                maxWidth: '90vw',
                height: '80vh',
                maxHeight: '80vh',
              }}>
              <div className="modal-content h-100 d-flex flex-column">
                <div className="modal-header">
                  <h5 className="modal-title">Selecionando o cardápio</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseModal}
                  />
                </div>

                <section className="d-flex px-3 gap-3">
                  <div className="w-50">
                    <label>Nome do produto</label>
                    <input
                      className="form-control"
                      type="text"
                      onChange={(e) => setFilterNameMenu(e.target.value)}
                    />
                  </div>
                  <div className="w-50">
                    <label>Nomes dos menus</label>
                    <select className="form-select" onChange={(e) => setFilterMenu(e.target.value)}>
                      <option defaultValue="" hidden>Selecione uma categoria</option>
                      <option value="0">todos os menus</option>
                        {categoryMenu?.map((item: { id_category: string, cat_description: string }) => (
                          <option key={item.id_category} value={item.id_category}>
                            {item.cat_description}
                          </option>
                        ))}
                    </select>
                  </div>
                </section>
                <section className="d-flex gap-4 flex-grow-1 overflow-hidden px-3 pt-2">
                  <div
                    className="modal-body p-0"
                    style={{
                      flex: 2,
                      overflowY: 'auto',
                      height: '100%',
                    }}
                  >
                    {allProd && allProd.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                          <thead className="table-primary">
                            <tr>
                              <th>Selecionar</th>
                              <th>Descrição</th>
                              <th>Unidade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allProd
                              .filter(x => x.description.toLowerCase().includes(filterNameMenu.toLowerCase()))
                              .filter(x => filterMenu === '0' || filterMenu === '' || x.id_category_fk === filterMenu)
                              .map((prod) => (
                                <tr key={`prod_${prod.id_product}`}>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={selectedProductIds.includes(prod.id_product)}
                                      onChange={() => handleCheckboxChange(prod.id_product)}
                                    />
                                  </td>
                                  <td>{prod.description}</td>
                                  <td>
                                    <input
                                      disabled={!selectedProductIds.includes(prod.id_product)}
                                      value={productQuantities[prod.id_product] ?? ""}
                                      onChange={handleUnAndKg(prod.id_product)}
                                      min={0}
                                      placeholder={prod.measure}
                                      type="number"
                                      step={prod.measure.toUpperCase() === "KG" ? 0.5 : 1}
                                      className="form-control"
                                    />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="p-2">Nenhum produto encontrado.</p>
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      height: '100%',
                    }}
                  >
                    <div className="p-3">
                      <h6>Resumo da Seleção</h6>
                      <ul className="list-group">
                        {selectedProductIds.map((productId) => {
                          const product = allProd?.find((p) => p.id_product === productId);
                          const quantity = productQuantities[productId] || 0;
                          const price = Number(productPrices[productId]) || 0;
                          const total = price * quantity;

                          return (
                            <li key={productId} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <div><strong>Código</strong>: {productId}</div>
                                <strong>{product?.description}</strong>
                                <br />
                                <strong>Subtotal: </strong>
                                <small>
                                  {quantity} x R$ {price.toFixed(2)} = <strong>R$ {total.toFixed(2)}</strong>
                                </small>
                              </div>
                            </li>
                          );
                        })}
                        {selectedProductIds.length > 0 && (
                          <li className="list-group-item d-flex justify-content-between">
                            <strong>Total Geral</strong>
                            <strong>
                              R$ {
                                selectedProductIds.reduce((acc, id) => {
                                  const q = productQuantities[id] || 0;
                                  const p = Number(productPrices[id]) || 0;
                                  return acc + q * p;
                                }, 0).toFixed(2)
                              }
                            </strong>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </section>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseModal}>Sair</button>
                  <button className="btn btn-danger" onClick={handleTrashFunction}>Apagar</button>
                  <button className="btn btn-success" onClick={handleSave}>Salvar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default ShopCard;
