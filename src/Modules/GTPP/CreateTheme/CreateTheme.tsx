import React, { useMemo, useState } from "react";
import NavBar from "../../../Components/NavBar";
import CustomTable from "../../../Components/CustomTable";
import { useWebSocket } from "../Context/GtppWsContext";
import { listPath } from "../mock/configurationfile";
import CustomForm from "../../../Components/CustomForm";
import { useConnection } from "../../../Context/ConnContext";
import { handleNotification } from "../../../Util/Util";

function convertToTableFormat(data: any) {
  return data?.map((item: any) => ({
    id_theme: { value: item?.id_theme, tag: "Id" },
    description_theme: { value: item?.description_theme, tag: "Descrição" },
    user_id_fk: {value: item?.user_id_fk, tag: "Usuário", ocultColumn: false},
  }));
}

function CreateTheme() {
  const { themeList } = useWebSocket();
  const { fetchData } = useConnection();

  const [openMenu, setOpenMenu] = useState(true);
  const [creatingDescriptionTheme, setCretingDescription] = useState("");
  const [themeId, setThemeId] = useState(0);

  const formattedThemeList = useMemo(() => {
    if (!themeList) return [];
    return convertToTableFormat([...themeList]);
  }, [themeList]);

  const handleConfirmList = (selected: any[]) => {
    setThemeId(selected[0].id_theme.value);
    setCretingDescription(selected[0].description_theme.value);
  };

  const onHandleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    let response;

    if (creatingDescriptionTheme.length > 0 && themeId === 0) {
      response = await fetchData({
        method: "POST",
        params: { description_theme: creatingDescriptionTheme },
        pathFile: "GTPP/Theme.php",
        urlComplement: "",
      });
    }

    if (themeId > 0 && creatingDescriptionTheme.length > 0) {
      response = await fetchData({
        method: "PUT",
        params: { id_theme: themeId, description_theme: creatingDescriptionTheme },
        pathFile: "GTPP/Theme.php",
        urlComplement: "",
      });
    }

    if (response && !response.error) {
      handleNotification("Sucesso!", response.data, "success");
    }
  };

  const getButtonTitle = () => {
    if (themeId === 0) return "Criar Tema";
    if (themeId > 0) return "Atualizar Tema";
    return "";
  };

  const fieldset = [
    ...(themeId
      ? [
          {
            attributes: { className: "mb-3" },
            item: {
              label: "Id",
              mandatory: false,
              captureValue: {
                type: "text",
                name: "theme_id",
                disabled: true,
                value: themeId,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setThemeId(Number(e.target.value)),
                placeholder: "#",
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
          name: "description_theme",
          value: creatingDescriptionTheme,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCretingDescription(e.target.value),
          placeholder: "Escreva o nome do seu tema",
          className: "form-control",
        },
      },
    },
  ];

  return (
    <>
      {openMenu && <NavBar list={listPath} />}
      <main id="creating-theme-section" className="px-3 w-100">
        <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
          <h2>Cria seu tema</h2>
          <button id="btn-eyes-themes" className="btn btn-outline-secondary d-md-none" onClick={() => setOpenMenu(!openMenu)}>
            {openMenu ? (<i className="fa-solid fa-eye text-dark"></i>) : (<i className="fa-solid text-dark fa-eye-slash"></i>)}
          </button>
          <button onClick={() => { setThemeId(0); setCretingDescription(""); }} className="btn btn-secondary" title="Limpar">
            <i className="fa-solid fa-eraser text-white"></i>
          </button>
        </div>

        <section id="create-and-show-theme" className="d-md-flex">
          <div id="create-your-theme" className="w-25 px-2 pb-2">
            <CustomForm
              fieldsets={fieldset}
              onAction={onHandleSubmitForm}
              titleButton={getButtonTitle()}
              classButton="btn btn-primary"
            />
          </div>
          <div id="view-your-theme" className="w-75">
            {formattedThemeList.length > 0 && 
            (<CustomTable
              list={formattedThemeList}
              onConfirmList={handleConfirmList}
              maxSelection={1}
            />)}
          </div>
        </section>
      </main>
    </>
  );
}

export default CreateTheme;
