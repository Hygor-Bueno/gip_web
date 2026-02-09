import React, { Dispatch, MouseEvent, SetStateAction } from "react";
import CustomForm from "../../../Components/CustomForm";
import CustomTable from "../../../Components/CustomTable";
import { CustomButton } from "../../../Components/CustomButton";
import { useWebSocket } from "../Context/GtppWsContext";

interface ContentDefaultProps {
  getButtonTitle: () => string;
  openMenu: boolean;
  themeId: number;
  numberTask?: string | number;
  themeIdFk?: string | number;
  showListTask: boolean;
  
  formattedList: [];
  fieldset: [createFieldset: unknown[], linkFieldset: unknown[]];
  onHandleSubmitForm: [
    onSubmitTheme: (e: MouseEvent<HTMLButtonElement>) => void,
    onSubmitTask: (e: MouseEvent<HTMLButtonElement>) => void
  ];
  
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  setNumberTask?: Dispatch<SetStateAction<Number>>;
  setThemeIdFk?: Dispatch<SetStateAction<Number>>;
  setShowListTask: Dispatch<SetStateAction<boolean>>;
  setSelectedTasks: Dispatch<SetStateAction<any[]>>;
  getDescTheme: Dispatch<SetStateAction<String>>;
  handleRemoveTheme: (selected: unknown) => void;
  handleConfirmList: (selected: unknown[]) => void;
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

    const [fieldsetCreate, fieldsetLink] = fieldset;
    const [onSubmitTheme, onSubmitTask] = onHandleSubmitForm;
    const isEditingTheme = themeId > 0;

    return (
      <main id="creating-theme-section" className="container-fluid px-2 px-md-4">
        <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3">
          <h5 className="mb-0 fw-bold">
            {showListTask ? "Vincular Tarefa ao Tema" : "Gerenciar Temas"}
          </h5>

          <div className="d-flex gap-2 align-items-center d-flexr">
            {showListTask && (
              <CustomButton
                className="btn btn-danger btn-sm"
                title="Desvincular"
                onClick={handleRemoveTheme}
              >
                <i className=" text-white fa fa-delete-left"></i>
              </CustomButton>
            )}

            <CustomButton
              className="btn btn-secondary align-items-center d-flex"
              title={showListTask ? "Ver temas" : "Vincular tarefa"}
              onClick={() => setShowListTask((prev) => !prev)}
            >
              <i className={`text-white fa ${showListTask ? "fa-palette" : "fa-tasks"}`}></i>
            </CustomButton>
            <CustomButton className="btn btn-outline-secondary text-white btn-sm d-md-none align-items-center d-flex" onClick={() => setOpenMenu(!openMenu)}>
              <i className={`fa ${openMenu ? "fa-eye" : "fa-eye-slash"}`}></i>
            </CustomButton>
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
            <div className={`card shadow-sm  h-100`}>
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
                        ? (item: {description_theme: {value: string}, id: {value: string}}) => {
                            if (item.description_theme) {
                              getDescTheme(item.description_theme.value);
                            }
                            setSelectedTasks((prev) => {
                              if (prev.some(t => t.id.value === item.id.value)) {
                                return prev.filter(t => t.id.value !== item.id.value);
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