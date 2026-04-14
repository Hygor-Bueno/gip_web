import { Dispatch, MutableRefObject, RefObject, SetStateAction } from "react";
import WebSocketCLPP from "../Services/Websocket";
import Contact from "../Class/Contact";
import { ITheme } from "../Modules/GTPP/CreateTheme/ICreateTheme";
import {
  IApiResponse,
  ICommentState,
  IGtppActiveTask,
  IGtppTaskSummary,
  IStoredState,
  ITaskItem,
  ITaskItemResult,
  IUserAssignState,
  IUserTaskElement,
  IWsObject,
} from "../Modules/GTPP/Context/types/gtppTypes";

export type {
  IApiResponse,
  ICommentState,
  IGtppActiveTask,
  IGtppTaskSummary,
  IStoredState,
  ITaskItem,
  ITaskItemResult,
  IUserAssignState,
  IUserTaskElement,
  IWsObject,
};

export interface iUser {
  id: number;
  name?: string;
  company?: string;
  shop?: string;
  departament?: string;
  sub?: string;
  CSDS?: string;
  photo?: string;
  administrator?: number;
  session?: string;
}

export interface iUserDefaultClass {
  photo: string;
  shop: string;
  departament: string;
  sub: string;
  CSDS: string;
  readonly id: number;
  yourContact?: number;
  notification?: number;
  pendingMessage?: number;
  name?: string;
  company?: string;
  administrator: number;
  session: string;
  loadInfo(isPhoto?: boolean): Promise<void>;
  loadPhotos(): Promise<void>;
  loadDetails(): Promise<void>;
}

export interface iContact {
  id: number;
  yourContact?: number;
  notification?: number;
  pendingMessage?: number;
}

export interface CustomNotification {
  id: number;
  task_id: number;
  title: string;
  message: string;
  typeNotify: "success" | "danger" | "info" | "default" | "warning";
}

export interface iSender {
  id: number;
}

export interface iMessage {
  send_user: number;
  message: string;
  type: number;
}

export interface iWebSocketCLPP {
  tokens: unknown;
  sender: iUser;
  funcReceived: (event: MessageEvent) => Promise<void>;
  funcView: (event: MessageEvent) => Promise<void>;
  connectWebSocket: () => void;
}

export interface iStates {
  color: string;
  description: string;
  id: number;
}

export interface iTaskReq {
  error?: boolean;
  data?: {
    csds?: number;
    full_description?: string;
    task_item: ITaskItem[];
    task_user?: taskItem[];
  };
}

export interface taskItem {
  task_id?: number;
  user_id?: number;
  status?: boolean;
  name?: string;
  photo?: string;
}

export interface iGtppWsContextType {
  // State
  task: Partial<IGtppActiveTask>;
  taskDetails: iTaskReq;
  taskPercent: number;
  userTaskBind: taskItem[];
  notifications: CustomNotification[];
  states: iStates[];
  onSounds: boolean;
  isAdm: boolean;
  getTask: IGtppTaskSummary[];
  openCardDefault: boolean;
  comment: ICommentState;
  themeList: ITheme[];
  getUser: iUserDefaultClass | null;

  // Task queries
  getTaskInformations: (silent?: boolean) => Promise<void>;
  loadTasks: (silent?: boolean) => Promise<void>;
  reqTasks: (silent?: boolean) => Promise<void>;
  getThemeListformations: () => Promise<void>;
  clearGtppWsContext: () => void;

  // Task item operations
  checkedItem: (id: number, checked: boolean, idTask: number | string, taskLocal: ITaskItem, yes_no?: number) => Promise<void>;
  handleAddTask: (description: string, task_id: string, yes_no: number, file?: string) => Promise<void>;
  changeDescription: (description: string, id: number, descLocal: string) => Promise<void>;
  changeObservedForm: (taskId: number, subId: number, value: string, isObservation: boolean) => Promise<void>;
  stopAndToBackTask: (taskId: number, resource: string | null, date: string | null, taskList: Partial<IGtppActiveTask>) => Promise<void>;
  checkTaskComShoDepSub: (task_id: number, company_id: number, shop_id: number, depart_id: number, taskLocal: number) => Promise<void>;
  updatedForQuestion: (item: { task_id: number; id: number; yes_no: number }) => Promise<void>;
  updatedAddUserTaskItem: (item: { task_id: number; user_id: number; id: number }, setUserState: Dispatch<SetStateAction<IUserAssignState>>) => Promise<void>;
  updateItemTaskFile: (file: string, item_id?: number) => Promise<void>;
  deleteItemTaskWS: (object: IWsObject) => void;
  addUserTask: (element: IUserTaskElement, type: number) => void;
  reloadPagePercent: (value: { percent?: number | string }, taskLocal: { task_id?: number | string }) => void;
  updateStates: (newList: IStoredState[]) => void;

  // Comments
  getComment: (taskItemId: number, count?: boolean) => Promise<void>;
  getCountComment: (taskItemId: number) => Promise<IApiResponse<unknown>>;
  sendComment: (text: string, file: File | null, taskItemId: number, taskId: number) => Promise<IApiResponse<unknown> | undefined>;
  deleteComment: (idToDelete: number, taskItemId: number, taskId: number) => Promise<IApiResponse<unknown> | undefined>;
  editComment: (idToEdit: number, newComment: string, taskItemId: number, taskId: number) => Promise<IApiResponse<unknown> | undefined>;
  notifyMentionWs: (mentionedUsers: IUserTaskElement[], taskId: number, taskItemDesc: string) => void;
  updateCommentCount: (taskItemId: number, action: "add" | "remove") => void;

  // Setters
  setOpenCardDefault: Dispatch<SetStateAction<boolean>>;
  setGetTask: Dispatch<SetStateAction<IGtppTaskSummary[]>>;
  setOnSounds: Dispatch<SetStateAction<boolean>>;
  setNotifications: Dispatch<SetStateAction<CustomNotification[]>>;
  setTaskPercent: Dispatch<SetStateAction<number>>;
  setTask: Dispatch<SetStateAction<Partial<IGtppActiveTask>>>;
  setTaskDetails: Dispatch<SetStateAction<iTaskReq>>;
  setIsAdm: Dispatch<SetStateAction<boolean>>;
  setComment: Dispatch<SetStateAction<ICommentState>>;
  setThemeList: Dispatch<SetStateAction<ITheme[]>>;
  setGetUser: Dispatch<SetStateAction<iUserDefaultClass | null>>;
}

export interface iWebSocketContextType {
  contactList: iUser[];
  sender: iSender;
  ws: MutableRefObject<WebSocketCLPP>;
  idReceived: number;
  listMessage: { id: number; id_user: number; message: string; notification: number; type: number; date: string }[];
  page: number;
  pageLimit: number;
  msgLoad: boolean;
  previousScrollHeight: MutableRefObject<number>;
  messagesContainerRef: RefObject<HTMLDivElement>;
  hasNewMessage: boolean;
  contNotify: number;
  setHasNewMessage: (value: boolean) => void;
  closeChat: () => void;
  includesMessage: (item: { id: number; id_user: number; message: string; notification: number; type: number; date: string }) => void;
  changeChat: () => void;
  handleScroll: () => void;
  setPage: (value: number) => void;
  setIdReceived: (value: number) => void;
  setSender: Dispatch<SetStateAction<iSender>>;
  setContactList: (value: Contact[]) => void;
  changeListContact: (value: Contact) => void;
}

export interface ITask {
  id: number;
  description: string;
  priority: number;
  user_id: number;
  initial_date: string;
  final_date: string;
  theme_id_fk: string;
}
