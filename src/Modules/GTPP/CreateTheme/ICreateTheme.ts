export interface ISelectItem {
    id_theme: {
        value: any;
    };

    description_theme: {
        value: string;
    }
};

export interface ISelectedTasks {
    id: {
        value: number | string;
    };
};

export interface ITheme {
    id_theme: string,
    description_theme: string,
    user_id_fk: string
};

export interface ApiResponse<T> {
  error: boolean;
  message?: string;
  data: T;
}