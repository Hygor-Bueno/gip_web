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
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value),
          placeholder: "Ex: Tema Escuro, Tema Natal, etc...",
          className: "form-control",
        },
      },
    },
  ];
}

export function fieldsetFormThemeUpdate(
  themeIdFk: string | number,
  setThemeIdFk: React.Dispatch<React.SetStateAction<any>>,
  setDescTheme: React.Dispatch<React.SetStateAction<any>>,
  themeList: { id_theme: string | number; description_theme: string }[] | undefined
) {
  const optionsTheme = themeList?.map((theme) => {
    return ({
    value: theme.id_theme,
    label: theme.description_theme,
  })}) || [];

  return [
    {
      attributes: { className: "mb-3" },
      item: {
        label: "Qual tema deseja vincular?",
        mandatory: true,
        captureValue: {
          type: "select",                    
          name: "theme_id",                           
          value: themeIdFk,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
            const id = e.target.value;
            setThemeIdFk(id);
            const theme = themeList?.find(t => t.id_theme == id);
            setDescTheme(theme?.description_theme || "");
          },
          required: true,
          className: "form-select",                   
          options: optionsTheme,
        },
      },
    },
  ];
}