import React from "react";
import CustomForm from "../../../Components/CustomForm";
import CustomTable from "../../../Components/CustomTable";

interface ContentDefaultProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;

  themeId: number;
  setThemeId: React.Dispatch<React.SetStateAction<number>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;

  numberTask?: string | number;
  setNumberTask?: React.Dispatch<React.SetStateAction<any>>;
  themeIdFk?: string | number;
  setThemeIdFk?: React.Dispatch<React.SetStateAction<any>>;

  fieldset: [createFieldset: any[], linkFieldset: any[]];
  onHandleSubmitForm: [
    onSubmitTheme: (e: React.MouseEvent<HTMLButtonElement>) => void,
    onSubmitTask: (e: React.MouseEvent<HTMLButtonElement>) => void
  ];
  getButtonTitle: () => string;

  formattedList: any[];           // ← Lista já formatada (temas ou tarefas)
  showListTask: boolean;          // ← Qual lista está visível
  setShowListTask: React.Dispatch<React.SetStateAction<boolean>>;

  handleConfirmList: (selected: any[]) => void;
}

export const ContentDefault = React.memo(
  ({
    openMenu,
    setOpenMenu,
    themeId,
    setThemeId,
    description,
    setDescription,

    fieldset,
    onHandleSubmitForm,
    getButtonTitle,

    formattedList,
    showListTask,
    setShowListTask,
    handleConfirmList,
  }: ContentDefaultProps) => {
    const [fieldsetCreate, fieldsetLink] = fieldset;
    const [onSubmitTheme, onSubmitTask] = onHandleSubmitForm;

    const isEditingTheme = themeId > 0;

    const clearForm = () => {
      setThemeId(0);
      setDescription("");
    };

    return (
      <main id="creating-theme-section" className="px-3 w-100">
        <header className="d-flex justify-content-between align-items-center mb-3 mt-3">
          <h2>{showListTask ? "Vincular Tarefa ao Tema" : "Gerenciar Temas"}</h2>

          <div className="d-flex gap-2">
            {/* Botão de alternar entre lista de temas e tarefas */}
            <button
              className="btn btn-secondary"
              title={showListTask ? "Ver temas" : "Vincular tarefa"}
              onClick={() => setShowListTask((prev) => !prev)}
            >
              <i className={`fa fa-solid ${showListTask ? "fa-palette" : "fa-tasks"} text-white`}></i>
            </button>

            {/* Botão mobile menu */}
            <button
              id="btn-eyes-themes"
              className="btn btn-outline-secondary d-md-none"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <i className={`fa-solid text-dark ${openMenu ? "fa-eye" : "fa-eye-slash"}`}></i>
            </button>

            {/* Limpar formulário */}
            <button onClick={clearForm} className="btn btn-secondary" title="Limpar formulário">
              <i className="fa-solid fa-eraser text-white"></i>
            </button>
          </div>
        </header>

        <section id="create-and-show-theme" className="d-md-flex gap-4">
          {/* Formulário */}
          <div id="create-your-theme" style={{ maxWidth: "400px" }}>
            {showListTask ? (
              <CustomForm
                fieldsets={fieldsetLink}
                onAction={onSubmitTask}
                titleButton="Vincular Tarefa"
                classButton="btn btn-success w-100"
              />
            ) : (
              <CustomForm
                fieldsets={fieldsetCreate}
                onAction={onSubmitTheme}
                titleButton={getButtonTitle()}
                classButton={isEditingTheme ? "btn btn-warning w-100" : "btn btn-primary w-100"}
              />
            )}
          </div>

          {/* Tabela */}
          <div id="view-your-theme" className="flex-fill overflow-auto" style={{ height: "75vh" }}>
            {formattedList.length > 0 ? (
              <CustomTable
                list={formattedList}
                onConfirmList={handleConfirmList}
                maxSelection={1}
              />
            ) : (
              <div className="text-center text-muted mt-5">
                <i className="fa fa-inbox fa-3x mb-3"></i>
                <p>
                  {showListTask
                    ? "Nenhuma tarefa disponível para vincular."
                    : "Nenhum tema criado ainda."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }
);