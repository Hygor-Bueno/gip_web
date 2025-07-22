import React, { useRef, useState } from "react";
import ModalConfirm from "../../../../../Components/ModalConfirm";
import { ICardInfoProps, IFormData } from "../../Interfaces/IFormGender";
import "../style/style.css";
import { handleNotification } from "../../../../../Util/Util";
import { useMyContext } from "../../../../../Context/MainContext";
import CardSearch from "../CardSearch/CardSearch";
import { useConnection } from "../../../../../Context/ConnContext";

const CardInfo: React.FC<ICardInfoProps> = ({ setData, setHiddenForm, visibilityTrash, dataStore, dataStoreTrash, resetDataStore}) =>
{
  const [confirm, setConfirm] = useState(false);
  const currentItemRef = useRef<IFormData | null>(null);
  const { loading, setLoading } = useMyContext();
  const { fetchData } = useConnection();
  const [confirmAction, setConfirmAction] = useState<"delete" | "recycle" | null>(null);


  const handleUpdateStoreStatus = async (item: IFormData, status: number) => {
    try {
      setLoading(true);
      const payload = { ...item, status_infractions: status };
      await fetchData({
        method: "PUT",
        params: payload,
        pathFile: "GAPP/Infraction.php",
        urlComplement: "",
      });
      await resetDataStore?.();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: IFormData) => {
    setHiddenForm?.((prev: boolean) => !prev);
    setData?.({ ...item });
  };

  const handleDelete = (item: IFormData) => {
    currentItemRef.current = item;
    setConfirmAction("delete");
    setConfirm(true);
  };

  const handleRecycle = (item: IFormData) => {
    currentItemRef.current = item;
    setConfirmAction("recycle");
    setConfirm(true);
  };

  const itemsToDisplay = visibilityTrash ? dataStore : dataStoreTrash;

  return (
    <div className="d-flex justify-content-between flex-column w-100 rounded">
      {confirm && (
        <ModalConfirm
            cancel={() => {
            setConfirm(false);
            setConfirmAction(null);
            }}
            confirm={async () => {
            const currentItem = currentItemRef.current;
            if (!currentItem) return;
            if (confirmAction === "delete") {
                await handleUpdateStoreStatus(currentItem, 0);
                handleNotification("Sucesso", "Item inativado com sucesso", "success");
            } else if (confirmAction === "recycle") {
                await handleUpdateStoreStatus(currentItem, 1);
                handleNotification("Sucesso", "Item restaurado com sucesso", "success");
            }
                setConfirm(false);
                setConfirmAction(null);
            }}
        />
      )}

      <div className="row h-25">
        <div className="col-12">
          <div className="d-flex justify-content-start flex-wrap overflow-auto h-100 heightlite_screen">
            {itemsToDisplay?.length > 0 ? (
              <CardSearch
                items={itemsToDisplay}
                loading={loading}
                onRecycle={handleRecycle}
                onDelete={handleDelete}
                onEdit={handleEdit} />
            ) : (
              <div className="p-3 m-auto shadow-sm border_none background_whiteGray"role="alert">
                <b className="text-muted font_size"> Não há dado {!visibilityTrash ? "na lixeira" : "para visualizar"} </b>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInfo;
