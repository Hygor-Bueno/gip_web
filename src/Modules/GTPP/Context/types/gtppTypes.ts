import { Dispatch, SetStateAction } from "react";

/** Item inside a task */
export interface ITaskItem {
  id: number;
  description?: string;
  check?: boolean;
  task_id?: number;
  order?: number;
  yes_no?: number;
  file?: number;
  note?: string | null;
  assigned_to?: number;
  created_by?: number;
  creator_name?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: number;
  total_comment?: number;
  hasNewComment?: boolean;
}

/** Task summary item from the task list */
export interface IGtppTaskSummary {
  id: number;
  description?: string;
  percent?: number;
  theme_id_fk?: number | string | null;
  description_theme?: string | null;
  state_id?: number;
  priority?: number;
  initial_date?: string;
  final_date?: string;
  user_id?: number;
  state_description?: string;
}

/** Currently open/selected task card */
export interface IGtppActiveTask {
  id: number;
  state_id: number;
  percent: number;
  description?: string;
  initial_date?: string;
  final_date?: string;
  state_description?: string;
  user_id?: number;
  priority?: number;
  csds?: Array<{ company_id: number; shop_id: number; depart_id: number }>;
}

/** Single comment entry */
export interface IComment {
  id: number;
  comment: string;
  user_id?: number;
  task_item_id?: number;
  created_at?: string;
  file?: string | null;
  name?: string;
  photo?: string;
  status?: string;
}

/** Comment panel state */
export interface ICommentState {
  isComment: boolean;
  data: IComment[];
}

/** Object payload inside a WebSocket message */
export interface IWsObject {
  description?: string;
  task_id?: number;
  state_id?: number;
  percent?: number | string;
  itemUp?: ITaskItem | number;
  isItemUp?: boolean;
  remove?: boolean;
  isUserTask?: boolean;
  task_item_id?: number;
  full_description?: string;
  company_id?: number;
  shop_id?: number;
  depart_id?: number;
  isMention?: boolean;
  note?: string;
  task?: Partial<IGtppActiveTask>;
  changeUser?: number;
  reason?: string | null;
  days?: number | string;
  taskState?: number;
  new_final_date?: string;
}

/** Incoming WebSocket message */
export interface IWsMessage {
  type: number;
  task_id: number;
  send_user_id?: number | string;
  user_id?: number;
  error?: boolean;
  object?: IWsObject;
  state?: string;
}

/** Element passed to addUserTask */
export interface IUserTaskElement {
  user_id: number;
  name: string;
  task_id: number;
}

/** State of a user assignment component */
export interface IUserAssignState {
  isListUser: boolean;
  loadingList: unknown[];
}

/** Generic API response */
export interface IApiResponse<T = unknown> {
  error: boolean;
  message?: string;
  data: T;
}

/** API result shape for task-item operations */
export interface ITaskItemResult {
  percent: string | number;
  state_id: number;
  last_id?: number;
  order?: number;
  created_by?: number;
  yes_no?: number;
}

/** Stored state shape (localStorage + setState) */
export interface IStoredState {
  id: number;
  description: string;
  color: string;
  active?: boolean;
}

/** Setter alias for convenience */
export type SetState<T> = Dispatch<SetStateAction<T>>;
