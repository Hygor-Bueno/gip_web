import React, { useState, useEffect } from 'react';
import { handleNotification, removeStringSpecialChars } from '../../../../Util/Util';
import { dataDetails, FormSalesEPPProps } from '../../Interfaces/InterfacesEPP';
import ShopCard from '../ShopCard/ShopCard';
import { useConnection } from '../../../../Context/ConnContext';

const INITIAL_FORM_DATA = {
  idOrder: '', fone: '', email: '', signalValue: '', idMenu: '', pluMenu: '',
  typeRice: '', description: '', delivered: '', dessert: '', store: '',
  nameClient: '', dateOrder: '', deliveryDate: '', deliveryHour: '',
  deliveryStore: '', userId: '', total: '', obs: '',
};

const STATUS_ICONS = [
  <i title='pendente' className='fa-solid fa-circle-info text-warning'></i>,
  <i title='enviado' className='fa-solid fa-circle-check text-success'></i>,
  <i title='cancelado' className='fa-solid fa-circle-xmark text-danger'></i>,
];

const FormSalesEPP: React.FC<FormSalesEPPProps> = ({ stores, dataClient }) => {
  const { fetchData } = useConnection();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [valorPendente, setValorPendente] = useState(0);
  const [captureHtml, setCaptureHtml] = useState<any>([]);

  useEffect(() => {
    if (!dataClient?.length) return;
    const client = dataClient[0];
    const newFormData = {
      ...INITIAL_FORM_DATA,
      idOrder: client.idOrder || '',
      nameClient: client.nameClient || '',
      fone: client.fone || '',
      email: client.email || '',
      dateOrder: client.dateOrder?.toString().substring(0, 10) || '',
      description: client.description || '',
      obs: client.obs || '',
      signalValue: client.signalValue?.toString() || '',
      total: client.total || '',
      deliveryDate: client.deliveryDate?.toString().substring(0, 10) || '',
      deliveryHour: client.deliveryHour || '',
      store: client.store || '',
    };
    setFormData(newFormData);
    const sinal = parseFloat(newFormData.signalValue) || 0;
    const total = parseFloat(newFormData.total) || 0;
    setValorPendente(Math.max(0, total - sinal));
  }, [dataClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      const sinal = parseFloat(updated.signalValue) || 0;
      const total = parseFloat(updated.total) || 0;
      setValorPendente(total - sinal);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Object.values(formData).some(v => v.length)) {
      handleNotification('Atenção!', 'Preencha todos os campos antes de enviar', 'warning');
      return;
    }

    const {
      fone, email, signalValue, idMenu, pluMenu, typeRice, description,
      delivered, dessert, store, nameClient, dateOrder, deliveryDate,
      deliveryHour, deliveryStore, userId, total, obs
    } = formData;

    const cleanCaptureHtml = captureHtml.replace(/<[^>]+>/g, '').trim();

    await fetchData({
      method: "POST",
      pathFile: "EPP_DSB/Order.php",
      urlComplement: "",
      params: {
        id_order: null,
        fone: fone,
        email: email,
        signal_value: signalValue,
        id_menu: idMenu,
        plu_menu: pluMenu,
        type_rice: typeRice,
        description: cleanCaptureHtml,
        delivered: delivered,
        dessert: dessert,
        store: store,
        name_client: nameClient,
        date_order: dateOrder,
        delivery_date: deliveryDate,
        delivery_hour: deliveryHour,
        delivery_store: deliveryStore,
        user_id: userId,
        total: total,
        observation: obs
      },
    });
  };


  const handleAction = (action: 'edit' | 'delete' | 'clear' | 'delivery' | 'print') => (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'clear') {
      setFormData(INITIAL_FORM_DATA);
      setCaptureHtml([]);
      setValorPendente(0);
      handleNotification('Formulário limpo', '', 'success');
      return;
    }

    if (!formData.idOrder.length) {
      handleNotification('Atenção!', `Selecione uma linha da tabela para ${action}`, 'warning');
      return;
    }

    alert(`${action === 'edit' ? 'Editando' : action === 'delete' ? 'Excluindo' : 'Ação'} o formulário!`);
  };

  return (
    <div className="container my-4">
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        
        {/* Dados do Cliente */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header"><strong>Dados do cliente</strong></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="idOrder" className="form-label">Cod</label>
                <input id="idOrder" disabled name="idOrder" value={formData.idOrder} className="form-control" />
              </div>
              <div className="col-md-5">
                <label htmlFor="nameClient" className="form-label">Cliente</label>
                <input id="nameClient" name="nameClient" value={formData.nameClient} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label htmlFor="fone" className="form-label">Telefone</label>
                <input id="fone" name="fone" type="tel" value={formData.fone} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-5">
                <label htmlFor="dateOrder" className="form-label">Data</label>
                <input id="dateOrder" type="date" name="dateOrder" value={formData.dateOrder} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-3 d-flex flex-column align-items-center justify-content-center">
                <label>Status</label>
                <div className="fs-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Status do pedido">
                  {STATUS_ICONS[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do pedido */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header"><strong>Detalhes do pedido</strong></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-semibold mb-0">Itens do pedido</label>
                  <ShopCard setCaptureHtml={setCaptureHtml} OrderId={formData.idOrder} />
                </div>
                <div className="form-control shadow-sm overflow-auto" style={{ minHeight: '50px', height: '160px' }}>
                <div>{captureHtml.map(({descricao, id, quantidade, subtotal, unidade}: dataDetails) => (
                  <div>
                    <strong>Codigo:</strong> {id}<br/>
                    <strong>Descrição:</strong> {descricao}<br/>
                    <strong>Quantidade:</strong> {quantidade} {unidade}<br/>
                    <strong>Subtotal:</strong> {subtotal}<br/>
                    <hr/>
                  </div>
                ))}</div>
              </div>
              </div>
              <div className="col-12">
                <label htmlFor="obs" className="form-label">Observações</label>
                <textarea id="obs" name="obs" value={formData.obs} onChange={handleChange} className="form-control" rows={3} />
              </div>
              <div className="col-md-4">
                <label htmlFor="signalValue" className="form-label">Valor de Sinal</label>
                <input id="signalValue" type="number" name="signalValue" value={formData.signalValue} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Valor Pendente</label>
                <input disabled type="number" value={valorPendente.toFixed(2)} className="form-control" />
              </div>
              <div className="col-md-4">
                <label htmlFor="total" className="form-label">Valor Total</label>
                <input id="total" type="number" name="total" value={formData.total} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>
        </div>

        {/* Dados da entrega */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header"><strong>Dados da entrega</strong></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="deliveryDate" className="form-label">Data</label>
                <input id="deliveryDate" type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label htmlFor="deliveryHour" className="form-label">Hora</label>
                <input id="deliveryHour" type="time" name="deliveryHour" value={formData.deliveryHour} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label htmlFor="store" className="form-label">Loja</label>
                <select id="store" name="store" value={removeStringSpecialChars(formData.store)} onChange={handleChange} className="form-select">
                  <option value="">Selecione uma loja</option>
                  {stores.map(store => <option key={store.id} value={store.number}>{store.description}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="d-flex gap-2 justify-content-start mb-4">
          <button type="submit" className="btn btn-success">Inserir</button>
          <button onClick={handleAction('edit')} className="btn btn-secondary" type="button">Editar</button>
          <button onClick={handleAction('delete')} className="btn btn-danger" type="button">Excluir</button>
          <button onClick={handleAction('clear')} className="btn btn-primary" type="button">Limpar</button>
          <button onClick={handleAction('delivery')} className="btn btn-dark" type="button" title="Entrega">
            <i className="fa-solid fa-truck text-white"></i>
          </button>
          <button onClick={handleAction('print')} className="btn btn-dark" type="button" title="Imprimir">
            <i className="fa-solid fa-print text-white"></i>
          </button>
        </div>

      </form>
    </div>
  );
};

export default FormSalesEPP;
