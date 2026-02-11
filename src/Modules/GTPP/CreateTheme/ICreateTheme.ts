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

export interface ApiResponse<T> {
  error: boolean;
  message?: string;
  data: T;
}

export interface ITheme {
  id_theme: number | string;
  description_theme: string;
  user_id_fk?: string | number;
}

export interface ITask {
  id: number;
  description: string;
  initial_date: string;
  final_date: string;
  state_description: string;
  theme_id_fk?: number | string | null;
  description_theme?: string | null;
}