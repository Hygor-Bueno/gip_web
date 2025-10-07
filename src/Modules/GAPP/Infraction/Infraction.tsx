import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import NavBar from "../../../Components/NavBar";
import CustomTable from "../../../Components/CustomTable";
import EditInfraction from "./Component/EditInfraction/EditInfraction";
import CreateInfraction from "./Component/CreateInfraction/CreateInfraction";
import { listPathGAPP } from "../ConfigGapp";
import { useMyContext } from "../../../Context/MainContext";
import { handleNotification } from "../../../Util/Util";
import { useConnection } from "../../../Context/ConnContext";
import useInfractionFields from "./hook/useInfractionFields";
require("bootstrap/dist/css/bootstrap.min.css");

const Infraction: React.FC = () => {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();
  const [dataStore, setDataStore] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const {infractionId, infraction, gravity, points, statusInfractions,setField, resetFields} = useInfractionFields();
  useEffect(() => {
    fetchInfractions("1");
  }, []);

  const fetchInfractions = async (status: "1" | "0") => {
    setLoading(true);
    try {
      const res = await fetchData({
        method: "GET",
        pathFile: "GAPP/Infraction.php",
        urlComplement: `&status_infractions=${status}`,
        params: null,
      });
      setDataStore(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mapeia os campos do item recebido da tabela para os campos do formulário
   * Isso permite abrir o modal com os dados preenchidos
   * @param item - objeto com dados da infração selecionada
   */
  const mapFieldsFromItem = (item: any) => {
    ["infraction_id", "infraction", "gravity", "points", "status_infractions"].forEach((key) => {
      const fieldMap: Record<string, string> = {
        infraction_id: "infractionId",
        status_infractions: "statusInfractions",
      };
      const fieldKey = fieldMap[key] || key;
      setField(fieldKey, item?.[key]?.value ?? (key === "status_infractions" ? "ativo" : ""));
    });
  };

  /**
   * Navega entre os itens selecionados para edição
   * Atualiza o índice atual e os campos do formulário com o item correto
   * @param direction - número que indica direção da navegação (1 para próximo, -1 para anterior)
   */
  const navigateItem = (direction: number) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < selectedItems.length) {
      setCurrentIndex(nextIndex);
      mapFieldsFromItem(selectedItems[nextIndex]);
    }
  };

  /**
   * Manipulador para quando a lista de itens é selecionada na tabela
   * Atualiza os itens selecionados, inicializa o índice e abre modal de edição
   * @param list - lista de itens selecionados na tabela
   */
  const handleClick = (list: any[]) => {
    if (!list.length) return;
    setSelectedItems(list);
    setCurrentIndex(0);
    mapFieldsFromItem(list[0]); // preenche o formulário com o primeiro item
    setEditModalVisible(true); // abre modal de edição
  };

  /**
   * Função que salva as alterações feitas no modal, tanto para edição quanto criação
   * Faz a chamada à API e atualiza a lista em seguida
   * @param type - "edit" para editar infração existente, "create" para criar nova infração
   */
  const handleSave = async (type: "edit" | "create") => {
    const isEdit = type === "edit";
    // Monta payload para envio, adaptando campos conforme tipo da operação
    const payload = {
      ...(isEdit && { infraction_id: infractionId }),
      infraction,
      gravitity: gravity, // *Note que há um typo no campo 'gravitity' (deveria ser gravity)
      points,
      status_infractions: statusInfractions === "ativo" ? 1 : 0,
    };

    setLoading(true);
    try {
      await fetchData({
        method: isEdit ? "PUT" : "POST",
        pathFile: "GAPP/Infraction.php",
        params: payload,
      });
      
      fetchInfractions("1");

      if (isEdit) {
        if (currentIndex < selectedItems.length - 1) {
          navigateItem(1);
        } else {
          handleNotification("Sucesso!", "Todas as alterações foram salvas!", "success");
          setEditModalVisible(false);
        }
      } else {
        setCreateModalVisible(false);  // Após criar, fecha modal e reseta campos para próxima criação
        resetFields();
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata os dados para a exibição na tabela CustomTable
   * Adiciona valor e uma tag para cada coluna, para renderização
   */
  const tableData = dataStore.map((item: any) => ({
    infraction_id: { value: item?.infraction_id ?? "", tag: "ID" },
    infraction: { value: item?.infraction ?? "", tag: "Infração" },
    gravity: { value: item?.gravitity ?? "", tag: "Gravidade" }, // typo repetido aqui também
    points: { value: item?.points ?? "", tag: "Pontos" },
    status_infractions: {
      value: item?.status_infractions > 0 ? "ativo" : "inativo",
      tag: "Status",
    },
  }));

  /**
   * Prepara as props compartilhadas para os modais de edição e criação
   * Passa os campos e suas funções setters para controle dos formulários
   */
  const getModalProps = () => ({
    infractionId, setInfractionId: (v: string) => setField("infractionId", v),
    infraction, setInfraction: (v: string) => setField("infraction", v),
    gravity, setGravity: (v: string) => setField("gravity", v),
    points, setPoints: (v: string) => setField("points", v),
    statusInfractions, setStatusInfractions: (v: string) => setField("statusInfractions", v),
  });

  return (
    <React.Fragment>
      <NavBar list={listPathGAPP} />

      <div className="w-100" style={{ height: "90%" }}>
        <div className="p-2 w-100">
          <Button variant="primary" onClick={() => { resetFields(); setCreateModalVisible(true); }}>
            <i className="fa fa-plus text-white" />
          </Button>
        </div>

        {tableData.length > 0 ? (
          <CustomTable
            list={tableData}
            onConfirmList={handleClick}
            hiddenButton={false}
            selectionKey=""
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "300px" }}>
            <div className="text-center" role="alert">
              <i className="fa fa-magnifying-glass fa-3x d-block mb-2" />
              <strong>Lista vazia</strong>
              <br />
              Nenhum item foi encontrado.
            </div>
          </div>
        )}
      </div>

      <EditInfraction
        showModal={editModalVisible}
        setShowModal={setEditModalVisible}
        handleSave={() => handleSave("edit")}
        onBack={() => navigateItem(-1)}
        onNext={() => navigateItem(1)}
        showNavigation={selectedItems.length > 1}
        pageNation={`${currentIndex + 1} / ${selectedItems.length}`}
        {...getModalProps()}
      />

      <CreateInfraction
        showModal={createModalVisible}
        setShowModal={setCreateModalVisible}
        handleSave={() => handleSave("create")}
        {...getModalProps()}
      />
    </React.Fragment>
  );
};

export default Infraction;
