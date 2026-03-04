export interface TableItem {
    [key: string]: {
        tag: string;
        value: string;
        isImage?: boolean;
        ocultColumn?: boolean;
        minWidth?: string;
    };
}

export function maskUserSeach(
    value: string,
    tag: string,
    isImage?: boolean,
    ocultColumn?: boolean,
    minWidth?: string
): { tag: string; value: string; isImage?: boolean; ocultColumn?: boolean; minWidth?: string } {
    return { tag, value, isImage, ocultColumn, minWidth };
}

// Função genérica para converter um array de objetos em uma estrutura de tabela
export function convertForTable<T extends Record<string, any>>(
    array: T[], 
    options?: {
        isImageKeys?: string[];
        ocultColumns?: string[];
        minWidths?: Record<string, string>;
        customTags?: Record<string, string>;
        customValue?: Record<string, (value: any, row?: T) => string>;
    }
): TableItem[] {
    return array.map((item) => {
        const tableItem: TableItem = {};

        // Define as chaves a processar:
        // - Se customTags existir, segue a ordem delas
        // - Se não, segue as chaves originais
        const keysToProcess = options?.customTags
            ? Object.keys(options.customTags)
            : Object.keys(item);

        // Inclui também qualquer coluna de ocultColumns que não esteja no customTags
        const allKeys = new Set([
            ...keysToProcess,
            ...(options?.ocultColumns || [])
        ]);

        allKeys.forEach((key) => {
            // Ignora se a chave não existir no item e não estiver em ocultColumns
            if (!(key in item) && !(options?.ocultColumns?.includes(key))) return;

            const rawValue = item[key];
            const formatter = options?.customValue?.[key];
            const formattedValue = formatter ? formatter(rawValue, item) : rawValue?.toString() || "";
            const isImage = options?.isImageKeys?.includes(key);
            const ocultColumn = options?.ocultColumns?.includes(key);
            const minWidth = options?.minWidths?.[key] || "150px";
            const tag = options?.customTags?.[key] || key;

            tableItem[key] = maskUserSeach(formattedValue, tag, isImage, ocultColumn, minWidth);
        });

        return tableItem;
    });
}

export function convertForTable2<T extends Record<string, any>>(
  array: T[],
  options?: {
    isImageKeys?: string[];
    ocultColumns?: string[];
    minWidths?: Record<string, string | number>;
    customTags?: Record<string, string>;
    customValue?: Record<string, (value: any, row?: T) => string>;
  }
): TableItem[] {
  return array.map((item) => {
    const tableItem: TableItem = {};
    const keysToProcess = options?.customTags
      ? Object.keys(options.customTags)
      : Object.keys(item);

    const allKeys = new Set<string>([
      ...keysToProcess,
      ...(options?.ocultColumns || []),
    ]);

    allKeys.forEach((key) => {
      if (!(key in item) && !(options?.ocultColumns?.includes(key))) return;

      const rawValue = item[key];
      const formatter = options?.customValue?.[key];
      const formattedValue = formatter
        ? formatter(rawValue, item)
        : rawValue?.toString() || "";

      const isImage = options?.isImageKeys?.includes(key) ?? false;
      const ocultColumn = options?.ocultColumns?.includes(key) ?? false;

      const minWidthCfg = options?.minWidths?.[key];
      const minWidth =
        typeof minWidthCfg === "number" ? `${minWidthCfg}px` : minWidthCfg;

      const tag = options?.customTags?.[key] || key;

      tableItem[key] = maskUserSeach(
        formattedValue,
        tag,
        isImage,
        ocultColumn,
        minWidth 
      );
    });

    return tableItem;
  });
}


