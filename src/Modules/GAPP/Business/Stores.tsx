import React, { useState, useEffect } from 'react';
import NavBar from '../../../Components/NavBar';
import CustomTable from '../../../Components/CustomTable';
import StoreModal from './Component/StoreModal/StoreModal';
import { IFormData, IFormGender } from './Interfaces/IFormGender';
import { useMyContext } from '../../../Context/MainContext';
import { listPathGAPP } from '../ConfigGapp';
import { convertForTable, handleNotification, consultingCEP } from '../../../Util/Utils';
import { iPropsInputCheckButton } from '../../../Interface/iGTPP';
import { InputCheckButton } from '../../../Components/CustomButton';
import { useConnection } from '../../../Context/ConnContext';
import './Stores.css';
require('bootstrap/dist/css/bootstrap.min.css');

const initialForm: IFormGender = {
  cnpj: "", name: "", street: "", district: "",
  city: "", state: "", number: "", zip_code: "",
  complement: "", status_store: 1,
};

export default function Stores(): JSX.Element {
  const [data,       setData]       = useState<IFormGender>(initialForm);
  const [dataStore,  setDataStore]  = useState<IFormData[]>([]);
  const [openMenu,   setOpenMenu]   = useState(true);
  const [openTrash,  setOpenTrash]  = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [modalMode,  setModalMode]  = useState<"create" | "edit">("create");

  const { setLoading, setTitleHead } = useMyContext();
  const { fetchData } = useConnection();

  const menuToggleButton: iPropsInputCheckButton = {
    inputId: "gapp_check_store_menu",
    nameButton: "Exibir/Ocultar Menu",
    onAction: async (event: boolean) => setOpenMenu(!event),
    labelIconConditional: ["fa-solid fa-eye", "fa-solid fa-eye-slash"],
  };

  const listButtonInputs: iPropsInputCheckButton[] = [
    {
      inputId: "gapp_check_store_trash",
      nameButton: "Itens excluídos",
      onAction: async (event: boolean) => setOpenTrash(event),
      labelIcon: "fa-solid fa-trash",
      highlight: true,
    },
  ];

  useEffect(() => {
    setTitleHead({ title: "Cadastrar Empresas - GAPP", simpleTitle: "GAPP - Empresas", icon: "fa fa-shop" });
    loadStores(openTrash ? "0" : "1");
  }, [openTrash]);

  async function loadStores(status: "0" | "1") {
    try {
      setLoading(true);
      const res: any = await fetchData({
        method: "GET", params: null,
        pathFile: "GAPP/Store.php",
        urlComplement: `&status_store=${status}`,
        exception: ["no data"],
      });
      if (res.error) throw new Error(res.message);
      setDataStore(res.data);
    } catch (error: any) {
      setDataStore([]);
      handleNotification("Erro!", error.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  async function saveStore() {
    const isNew = !(data as IFormData).store_id;
    const payload = {
      cnpj:         data.cnpj.replace(/[^a-z0-9]/gi, ""),
      name:         data.name,
      street:       data.street,
      district:     data.district,
      city:         data.city,
      state:        data.state,
      number:       data.number,
      zip_code:     data.zip_code,
      complement:   data.complement,
      status_store: data.status_store,
      ...(!isNew ? { store_id: (data as IFormData).store_id } : {}),
    };
    try {
      setLoading(true);
      const res: any = await fetchData({
        method: isNew ? "POST" : "PUT",
        params: payload,
        pathFile: "GAPP/Store.php",
        urlComplement: "",
        exception: ["no data"],
      });
      if (res.error) throw new Error(res.message);
      handleNotification("Sucesso!", isNew ? "Empresa cadastrada!" : "Empresa atualizada!", "success");
      setShowModal(false);
      setData(initialForm);
      await loadStores("1");
    } catch (error: any) {
      handleNotification("Erro!", error.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(field: keyof IFormGender, value: string | number) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSearchCEP() {
    consultingCEP(data.zip_code, setData as any, setLoading);
  }

  function openCreate() {
    setData(initialForm);
    setModalMode("create");
    setShowModal(true);
  }

  function openEdit(row: any) {
    const mapped: any = {};
    Object.keys(row).forEach((k) => { mapped[k] = row[k].value; });
    setData(mapped);
    setModalMode("edit");
    setShowModal(true);
  }

  return (
    <React.Fragment>
      {openMenu && <NavBar list={listPathGAPP} />}

      <StoreModal
        mode={modalMode}
        showModal={showModal}
        setShowModal={setShowModal}
        data={data}
        onFieldChange={handleFieldChange}
        onSearchCEP={handleSearchCEP}
        onSave={saveStore}
      />

      <div className="stores-page">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="stores-toolbar">
          <div className="stores-toolbar-title">
            <div className="stores-toolbar-title-icon">
              <i className="fa fa-shop" />
            </div>
            <div>
              <p className="stores-toolbar-title-text">Empresas</p>
              <p className="stores-toolbar-title-sub">Cadastro de lojas e filiais</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="stores-mobile-only">
              <InputCheckButton {...menuToggleButton} />
            </div>
            {listButtonInputs.map((btn, i) => (
              <InputCheckButton key={`btn_store_${i}`} {...btn} />
            ))}
            <button className="btn-add-store" onClick={openCreate}>
              <span className="btn-add-store-icon">
                <i className="fa fa-plus text-white" />
              </span>
              <span className="btn-add-store-label">Nova Empresa</span>
            </button>
          </div>
        </div>

        {/* ── Table Card ──────────────────────────────────── */}
        <div className="stores-card">
          {dataStore.length > 0 ? (
            <CustomTable
              maxSelection={1}
              list={convertForTable(dataStore, {
                ocultColumns: ["store_id", "status_store"],
                customTags: {
                  cnpj: "CNPJ", name: "Nome", street: "Rua",
                  district: "Bairro", city: "Cidade", state: "Estado",
                  number: "Número", zip_code: "CEP", complement: "Complemento",
                },
              })}
              onConfirmList={(rows) => { if (rows.length) openEdit(rows[0]); }}
            />
          ) : (
            <div className="stores-empty">
              <i className="fa fa-shop" />
              <strong>Nenhuma empresa encontrada</strong>
              <span>
                {openTrash
                  ? "Nenhuma empresa inativa no momento."
                  : "Clique em \"Nova Empresa\" para cadastrar."}
              </span>
            </div>
          )}
        </div>

      </div>
    </React.Fragment>
  );
}
