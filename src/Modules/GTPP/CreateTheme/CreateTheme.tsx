import React, { useMemo, useState } from "react";
import NavBar from "../../../Components/NavBar";
import { useWebSocket } from "../Context/GtppWsContext";
import { useConnection } from "../../../Context/ConnContext";
import { listPath } from "../mock/configurationfile";
import { handleNotification } from "../../../Util/Util";
import { ContentDefault } from "./ContentDefault";
import { ActionModal } from "./ActionModal";

function CreateTheme() {
  const { themeList, getThemeListformations } = useWebSocket();
  const { fetchData } = useConnection();

  const [openMenu, setOpenMenu] = useState(true);
  const [description, setDescription] = useState("");
  const [themeId, setThemeId] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formattedThemeList = useMemo(() => {
    return themeList ? themeList.map((item: any) => ({
      id_theme: { value: item.id_theme, tag: "Id" },
      description_theme: { value: item.description_theme, tag: "Descrição" },
      user_id_fk: { value: item.user_id_fk, tag: "Usuário", ocultColumn: true },
    })) : [];
  }, [themeList]);

  const handleConfirmList = (selected: any[]) => {
    setSelectedItem(selected[0]);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const response = await fetchData({
      method: "DELETE",
      params: { id_theme: selectedItem.id_theme.value },
      pathFile: "GTPP/Theme.php",
    });

    if (!response.error) {
      handleNotification("Sucesso!", "Tema excluído com sucesso", "success");
      getThemeListformations();
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    setThemeId(selectedItem.id_theme.value);
    setDescription(selectedItem.description_theme.value);
    setShowModal(false);
    setSelectedItem(null);
  };

  const onHandleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!description.trim()) return;

    const params: any = { description_theme: description };
    const method: "POST" | "PUT" = themeId > 0 ? "PUT" : "POST";
    if (themeId > 0) params.id_theme = themeId;

    const response = await fetchData({
      method,
      params,
      pathFile: "GTPP/Theme.php",
    });

    if (response && !response.error) {
      handleNotification("Sucesso!", themeId > 0 ? "Tema atualizado" : "Tema criado", "success");
      setThemeId(0);
      setDescription("");
      getThemeListformations();
    }
  };

  const getButtonTitle = () => (themeId === 0 ? "Criar Tema" : "Atualizar Tema");

  const fieldset = [
    ...(themeId > 0
      ? [
          {
            attributes: { className: "mb-3" },
            item: {
              label: "ID",
              captureValue: {
                type: "text",
                disabled: true,
                value: themeId,
                className: "form-control border-dark",
              },
            },
          },
        ]
      : []),
    {
      attributes: { className: "mb-3" },
      item: {
        label: "Descrição do tema",
        mandatory: true,
        captureValue: {
          type: "text",
          value: description,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value),
          placeholder: "Ex: Tema Escuro, Tema Natal, etc...",
          className: "form-control",
        },
      },
    },
  ];

  return (
    <>
      {openMenu && <NavBar list={listPath} />}
      <ContentDefault
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        themeId={themeId}
        setThemeId={setThemeId}
        description={description}
        setDescription={setDescription}
        fieldset={fieldset}
        onHandleSubmitForm={onHandleSubmitForm}
        getButtonTitle={getButtonTitle}
        formattedThemeList={formattedThemeList}
        handleConfirmList={handleConfirmList}
      />
      <ActionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        themeName={selectedItem?.description_theme.value || ""}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}

export default CreateTheme;