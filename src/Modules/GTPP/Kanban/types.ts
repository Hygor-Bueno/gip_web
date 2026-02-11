export type Priority = "low" | "medium" | "high";

export interface CardType {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  progress: number;
  dueDate?: string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
}
