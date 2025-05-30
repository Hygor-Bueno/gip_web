import React, { useRef, useState } from "react";
import { Connection } from "../../../../../Connection/Connection";
import ModalConfirm from "../../../../../Components/ModalConfirm";
import { ICardInfoProps, IFormData } from "../../Interfaces/IFormGender";
import "../style/style.css";
import { handleNotification } from "../../../../../Util/Util";
import { useMyContext } from "../../../../../Context/MainContext";
import GenericCardItem from "../../../../../Components/GenericCardItem";

const CardInfo: React.FC<ICardInfoProps> = ({ setData, setHiddenForm, visibilityTrash, dataStore, dataStoreTrash, resetDataStore }) => {
  const [confirm, setConfirm] = useState(false);
  const currentItemRef = useRef<IFormData | null>(null);
  const { loading, setLoading } = useMyContext();

  const handleUpdateStoreStatus = async (item: IFormData, status: number) => {
    try {
      setLoading(true);
      const payload = { ...item, status_store: status };
      const connection = new Connection("15");
      await connection.put(payload, "GAPP/Store.php");
      await resetDataStore?.();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      handleNotification("Erro", "Erro no Serviço! " + error, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: IFormData) => {
    currentItemRef.current = item;
    setConfirm(true);
  };

  const handleRecycle = (item: IFormData) => {
    currentItemRef.current = item;
    handleUpdateStoreStatus(item, 1);
  };

  const handleEdit = (item: IFormData) => {
    setHiddenForm?.((prev: boolean) => !prev);
    setData({ ...item });
  };

  const fields = [
    { label: "Nome", key: "name" },
    { label: "CEP", key: "zip_code" },
    { label: "CNPJ", key: "cnpj" },
    { label: "Estado", key: "state" },
    { label: "Cidade", key: "city" },
    { label: "Distrito", key: "district" },
    { label: "Número", key: "number" },
    { label: "Rua", key: "street" },
    { label: "Complemento", key: "complement" },
  ] as const;

  const mutableFields = [...fields];

  const itemsToDisplay = visibilityTrash ? dataStore : dataStoreTrash;

  return (
    <div className="d-flex justify-content-between flex-column w-100 border_gray rounded">
      {confirm && (
        <ModalConfirm
          cancel={() => setConfirm(false)}
          confirm={() => {
            const currentItem = currentItemRef.current;
            if (!currentItem) return;
            handleUpdateStoreStatus(currentItem, 0);
            handleNotification(
              "Sucesso",
              "Item inativado com sucesso",
              "success"
            );
            setConfirm(false);
          }}
        />
      )}
      <div className="row h-25">
        <div className="col-12">
          <div className="d-flex justify-content-start flex-wrap overflow-auto h-100 heightlite_screen">
            {itemsToDisplay?.length > 0 ? (
              itemsToDisplay
                .slice()
                .reverse()
                .map((item: any, index: any) => (
                  <GenericCardItem<IFormData>
                    key={`card_${index}`}
                    item={item}
                    fields={mutableFields}
                    loading={loading}
                    onRecycle={handleRecycle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    showRecycle={item.status_store === 0}
                    showDelete={item.status_store === 1}
                    showEdit={item.status_store === 1} />
                ))
            ) : (
              <div
                className="p-3 m-auto shadow-sm border_none background_whiteGray"
                role="alert"
              >
                <b className="text-muted font_size">
                  Não há dados{" "}
                  {!visibilityTrash ? "na lixeira" : "para visualizar"}
                </b>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInfo;
