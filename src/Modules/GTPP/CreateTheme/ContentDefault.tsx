import React from "react";
import CustomForm from "../../../Components/CustomForm";
import CustomTable from "../../../Components/CustomTable";
import { useWebSocket } from "../Context/GtppWsContext";

interface ContentDefaultProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;

  themeId: number;

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

  formattedList: any[];
  showListTask: boolean;
  setShowListTask: React.Dispatch<React.SetStateAction<boolean>>;

  setSelectedTasks: React.Dispatch<React.SetStateAction<any>>;
  
  handleRemoveTheme: (selected: any) => void;

  getDescTheme: React.Dispatch<React.SetStateAction<any>>;

  handleConfirmList: (selected: any[]) => void;
}

export const ContentDefault = React.memo(
  ({
    openMenu,
    setOpenMenu,
    themeId,

    fieldset,
    onHandleSubmitForm,
    getButtonTitle,

    formattedList,
    showListTask,
    setShowListTask,
    handleConfirmList,
    setSelectedTasks,

    getDescTheme,

    handleRemoveTheme
  }: ContentDefaultProps) => {

    const {setIsAdm} = useWebSocket();

    const [fieldsetCreate, fieldsetLink] = fieldset;
    const [onSubmitTheme, onSubmitTask] = onHandleSubmitForm;
    const isEditingTheme = themeId > 0;

    return (
      <main id="creating-theme-section" className="container-fluid px-2 px-md-4">
        <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3">
          <h5 className="mb-0 fw-bold">
            {showListTask ? "Vincular Tarefa ao Tema" : "Gerenciar Temas"}
          </h5>

          <div className="d-flex gap-2 align-items-center">
            {showListTask && (
              <button
                className="btn btn-danger btn-sm"
                title="Desvincular"
                onClick={handleRemoveTheme}
              >
                <i className=" text-white fa fa-delete-left"></i>
              </button>
            )}

            {showListTask && (
              <button
                className="btn btn-primary btn-sm"
                title="ADM"
                onClick={() => setIsAdm((prev: any) => !prev)}
              >
                <i className=" text-white fa fa-user"></i>
              </button>
            )}

            <button
              className="btn btn-secondary text-white btn-sm"
              title={showListTask ? "Ver temas" : "Vincular tarefa"}
              onClick={() => setShowListTask((prev) => !prev)}
            >
              <i className={`text-white fa ${showListTask ? "fa-palette" : "fa-tasks"}`}></i>
            </button>
            <button className="btn btn-outline-secondary text-white btn-sm d-md-none" onClick={() => setOpenMenu(!openMenu)}>
              <i className={`fa ${openMenu ? "fa-eye" : "fa-eye-slash"}`}></i>
            </button>
          </div>
        </header>
        <section className="row g-3">
          <div className="col-12 col-md-4 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body">
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
                    classButton={
                      isEditingTheme
                        ? "btn btn-warning w-100"
                        : "btn btn-primary w-100"
                    }
                  />
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
            <div className={`card shadow-sm ${!showListTask ? 'h-100' : 'h-75'}`}>
              <div
                className="card-body overflow-auto"
                style={{ maxHeight: "75vh" }}
              >
                {formattedList.length > 0 ? (
                  <CustomTable
                    list={formattedList}
                    onConfirmList={handleConfirmList}
                    {...(!showListTask && { maxSelection: 1 })}
                    {...(showListTask && { hiddenButton: true })}
                    onRowClick={
                      showListTask
                        ? (item: any) => {
                            if (item.description_theme) {
                              getDescTheme(item.description_theme.value);
                            }

                            setSelectedTasks((prev: any) => {
                              if (
                                prev.some(
                                  (t: { id: { value: any } }) =>
                                    t.id.value === item.id.value
                                )
                              ) {
                                return prev.filter(
                                  (t: { id: { value: any } }) =>
                                    t.id.value !== item.id.value
                                );
                              }
                              return [...prev, item];
                            });
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="text-white fa fa-inbox fa-3x mb-3"></i>
                    <p className="mb-0">
                      {showListTask
                        ? "Nenhuma tarefa disponível para vincular."
                        : "Nenhum tema criado ainda."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
);