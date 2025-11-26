import React from "react";
import CustomForm from "../../../Components/CustomForm";
import CustomTable from "../../../Components/CustomTable";

export const ContentDefault = React.memo(({
    openMenu,
    setOpenMenu,
    themeId,
    setThemeId,
    description,
    setDescription,
    fieldset,
    onHandleSubmitForm,
    getButtonTitle,
    formattedThemeList,
    handleConfirmList,
  }: any) => {
    return (
      <main id="creating-theme-section" className="px-3 w-100">
        <header className="d-flex justify-content-between align-items-center mb-3 mt-3">
          <h2>Crie seu tema</h2>

          <button
            id="btn-eyes-themes"
            className="btn btn-outline-secondary d-md-none"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <i className={`fa-solid text-dark ${openMenu ? "fa-eye" : "fa-eye-slash"}`}></i>
          </button>

          <button
            onClick={() => {
              setThemeId(0);
              setDescription("");
            }}
            className="btn btn-secondary"
            title="Limpar formulário"
          >
            <i className="fa-solid fa-eraser text-white"></i>
          </button>
        </header>

        <section id="create-and-show-theme" className="d-md-flex gap-4">
          <div id="create-your-theme" style={{ maxWidth: "400px" }}>
            <CustomForm
              fieldsets={fieldset}
              onAction={onHandleSubmitForm}
              titleButton={getButtonTitle()}
              classButton="btn btn-primary w-100"
            />
          </div>

          <div id="view-your-theme" className="flex-fill">
            {formattedThemeList.length > 0 && (
              <CustomTable
                list={formattedThemeList}
                onConfirmList={handleConfirmList}
                maxSelection={1}
              />
            )}
          </div>
        </section>
      </main>
    );
  }
);