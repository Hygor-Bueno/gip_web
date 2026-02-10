export interface Task {
  description: string;
  state_description: string;
  priority: number;
  initial_date: string;
  final_date: string;
  state_id: string;
  percent?: number;
}

export interface Column<T> {
  key: keyof T;
  label: string;
  format?: (value: T[keyof T], row: T) => string;
}
