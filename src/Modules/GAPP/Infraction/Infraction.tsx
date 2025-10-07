// src/pages/GAPP/Infraction/Infraction.tsx
import React, { useState, useEffect } from "react";
import NavBar from "../../../Components/NavBar";
import { useMyContext } from "../../../Context/MainContext";
import { useConnection } from "../../../Context/ConnContext";
import CustomTable from "../../../Components/CustomTable";
import EditInfraction from "./Component/EditInfraction/EditInfraction";
import CreateInfraction from "./Component/CreateInfraction/CreateInfraction";
import { listPathGAPP } from "../ConfigGapp";
import { Button } from "react-bootstrap";
import { handleNotification } from "../../../Util/Util";
require("bootstrap/dist/css/bootstrap.min.css");

const useInfractionFields = () => {
  const [infractionId, setInfractionId] = useState("");
  const [infraction, setInfraction] = useState("");
  const [gravity, setGravity] = useState("");
  const [points, setPoints] = useState("");
  const [statusInfractions, setStatusInfractions] = useState("ativo");

  const resetFields = () => {
    setInfractionId("");
    setInfraction("");
    setGravity("");
    setPoints("");
    setStatusInfractions("ativo");
  };

  return {
    infractionId,
    setInfractionId,
    infraction,
    setInfraction,
    gravity,
    setGravity,
    points,
    setPoints,
    statusInfractions,
    setStatusInfractions,
    resetFields,
  };
};

const Infraction: React.FC = () => {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const [dataStore, setDataStore] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const {
    infractionId,
    setInfractionId,
    infraction,
    setInfraction,
    gravity,
    setGravity,
    points,
    setPoints,
    statusInfractions,
    setStatusInfractions,
    resetFields,
  } = useInfractionFields();

  useEffect(() => {
    fetchInfractionData("1");
  }, []);

  const fetchInfractionData = async (status: "1" | "0") => {
    setLoading(true);
    try {
      const response: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GAPP/Infraction.php",
        urlComplement: `&status_infractions=${status}`,
      });
      setDataStore(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setFieldsFromItem = (item: any) => {
    setInfractionId(item?.infraction_id?.value ?? "");
    setInfraction(item?.infraction?.value ?? "");
    setGravity(item?.gravity?.value ?? "");
    setPoints(item?.points?.value ?? "");
    setStatusInfractions(item?.status_infractions?.value ?? "ativo");
  };

  const handleClick = (selectedList: any[]) => {
    if (!selectedList || selectedList.length === 0) return;

    setSelectedItems(selectedList);
    setCurrentIndex(0);

    setFieldsFromItem(selectedList[0]);
    setEditModalVisible(true);
  };

  const handleBack = () => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setFieldsFromItem(selectedItems[prevIndex]);
  };

  const handleNext = () => {
    if (currentIndex >= selectedItems.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setFieldsFromItem(selectedItems[nextIndex]);
  };

  const handleSaveEdit = async () => {
    const payload = {
      infraction_id: infractionId,
      infraction,
      gravitity: gravity,
      points,
      status_infractions: statusInfractions === "ativo" ? 1 : 0,
    };

    setLoading(true);
    try {
      await fetchData({
        method: "PUT",
        params: payload,
        pathFile: "GAPP/Infraction.php",
        urlComplement: "",
      });

      fetchInfractionData("1");

      // Avança automaticamente após salvar
      if (currentIndex < selectedItems.length - 1) {
        handleNext();
      } else {
        handleNotification("Sucesso!", "Todas as alterações foram salvas!", "success");
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCreate = async () => {
    const payload = {
      infraction,
      gravitity: gravity,
      points,
      status_infractions: statusInfractions === "ativo" ? 1 : 0,
    };

    setLoading(true);
    try {
      await fetchData({
        method: "POST",
        params: payload,
        pathFile: "GAPP/Infraction.php",
        urlComplement: "",
      });

      setCreateModalVisible(false);
      fetchInfractionData("1");
      resetFields();
    } catch (error) {
      console.error("Erro ao criar:", error);
    } finally {
      setLoading(false);
    }
  };

  const infractionsTable = dataStore.map((item: any) => ({
    infraction_id: { value: item?.infraction_id ?? "", tag: "ID" },
    infraction: { value: item?.infraction ?? "", tag: "Infração" },
    gravity: { value: item?.gravitity ?? "", tag: "Gravidade" },
    points: { value: item?.points ?? "", tag: "Pontos" },
    status_infractions: {
      value: item?.status_infractions > 0 ? "ativo" : "inativo",
      tag: "Status",
    },
  }));

  const safeInfractionsTable = infractionsTable.filter(Boolean);

  return (
    <>
      <NavBar list={listPathGAPP} />

      <div className="w-100" style={{ height: "90%" }}>
        <div className="p-2 w-100">
          <Button
            variant="primary"
            onClick={() => {
              resetFields();
              setCreateModalVisible(true);
            }}
          >
            <i className="fa fa-plus text-white"></i>
          </Button>
        </div>

        {safeInfractionsTable.length > 0 ? (
          <CustomTable
            list={safeInfractionsTable}
            onConfirmList={handleClick}
            hiddenButton={false}
            selectionKey=""
          />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center w-100"
            style={{ minHeight: "300px" }}
          >
            <div className="text-center" role="alert">
              <i className="fa fa-magnifying-glass fa-3x d-block mb-2"></i>
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
        handleSave={handleSaveEdit}
        infractionId={infractionId}
        setInfractionId={setInfractionId}
        infraction={infraction}
        setInfraction={setInfraction}
        gravity={gravity}
        setGravity={setGravity}
        points={points}
        setPoints={setPoints}
        statusInfractions={statusInfractions}
        setStatusInfractions={setStatusInfractions}
        onBack={handleBack}
        onNext={handleNext}
        showNavigation={selectedItems.length > 1}
        pageNation={`${currentIndex + 1} / ${selectedItems.length}`}
      />

      <CreateInfraction
        showModal={createModalVisible}
        setShowModal={setCreateModalVisible}
        handleSave={handleSaveCreate}
        infraction={infraction}
        setInfraction={setInfraction}
        gravity={gravity}
        setGravity={setGravity}
        points={points}
        setPoints={setPoints}
        statusInfractions={statusInfractions}
        setStatusInfractions={setStatusInfractions}
      />
    </>
  );
};

export default Infraction;
