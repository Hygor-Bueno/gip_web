export function fieldsetFormTheme(themeId: any, description: string, setDescription: any) {
  return [
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
}

export function fieldsetFormThemeUpdate(
  numberTask: string | number,
  setNumberTask: React.Dispatch<React.SetStateAction<any>>,
  themeIdFk: string | number,
  setThemeIdFk: React.Dispatch<React.SetStateAction<any>>,
  themeList: { id_theme: string | number; description_theme: string }[] | undefined
) {
  const optionsTheme = themeList?.map((theme) => {
    console.log(theme);
    return ({
    value: theme.id_theme,
    label: theme.description_theme,
  })}) || [];

  return [
    {
      attributes: { className: "mb-3" },
      item: {
        label: "Numero da tarefa",
        mandatory: true,
        captureValue: {
          type: "text" as const,
          value: numberTask,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNumberTask(e.target.value),
          placeholder: "Ex: 001, 002...",
          className: "form-control",
        },
      },
    },
    {
      attributes: { className: "mb-3" },
      item: {
        label: "Qual tema deseja vincular?",
        mandatory: true,
        captureValue: {
          type: "select" as const,                    
          name: "theme_id",                           
          value: themeIdFk,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setThemeIdFk(e.target.value),             
          required: true,
          className: "form-select",                   
          options: optionsTheme,                      
        },
      },
    },
  ];
}