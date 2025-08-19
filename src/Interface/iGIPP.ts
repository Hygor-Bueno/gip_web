import { MutableRefObject, RefObject } from "react";
import WebSocketCLPP from "../Services/Websocket";
import Contact from "../Class/Contact";

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

export interface iContact {
    id: number;
    yourContact?: number;
    notification?: number;
    pendingMessage?: number;
}
export interface CustomNotification {
    id: number;
    task_id: number,
    title: string;
    message: string;
    typeNotify: 'success' | 'danger' | 'info' | 'default' | 'warning';
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
    tokens: any;
    sender: iUser;
    funcReceived: (event: any) => Promise<void>;
    funcView: (event: any) => Promise<void>;
    connectWebSocket: () => void;
}
export interface iGtppWsContextType {
    task: any;
    taskDetails: iTaskReq;
    taskPercent: number;
    userTaskBind: any;
    notifications: CustomNotification[];
    states: iStates[];
    onSounds: boolean;
    isAdm: any;
    getTask: any[];
    openCardDefault: boolean;
    updateItemTaskFile: (file: string, item_id: number) => Promise<void>;
    updatedForQuestion: (item: { task_id: number; id: number; yes_no: number }) => void;
    reloadPagePercent: (value: any, task: any) => void;
    deleteItemTaskWS: (object: any) => void;
    addUserTask: (value: any, num: number) => void;
    getTaskInformations: () => void;
    setOpenCardDefault: (value: boolean) => void;
    loadTasks: (admin?: boolean) => void;
    reqTasks: (admin?: boolean) => Promise<void>;
    setGetTask: (array: any[]) => void;
    updateStates: (array: any[]) => void;
    setOnSounds: (value: boolean) => void;
    setNotifications: (value: CustomNotification[]) => void;
    setTaskPercent: (value: number) => void;
    setTask: (value: any) => void;
    setTaskDetails: (value: any) => void;
    handleAddTask: (description: string, task_id: string, yes_no: number, file?: string) => void;
    clearGtppWsContext: () => void;
    checkedItem: (id: number, checked: boolean, idTask: any, task: any, yes_no: number) => void;
    checkTaskComShoDepSub: (task_id: number, company_id: number, shop_id: number, depart_id: number, taskLocal: any) => void;
    changeDescription: (description: string, id: number, descLocal: string) => void;
    stopAndToBackTask: (taskId: number, resource: string | null, date: string | null, taskList: any) => void;
    changeObservedForm: (taskId: number, subId: number, value: string, isObservetion: boolean) => void;
}
export interface iStates {
    color: string,
    description: string,
    id: number
};
export interface iTaskReq {
    error?: boolean,
    data?: {
        csds?: number,
        full_description?: string,
        task_item: [{
            id?: number,
            description?: string,
            check?: boolean,
            task_id?: number,
            order?: number,
            yes_no?: number,
            file?: number,
            note?: any,
        }],
        task_user: [{ task?: number, user_id?: number, status?: boolean }]
    }
}

export interface iWebSocketContextType {
    contactList: iUser[];
    sender: iSender;
    ws: MutableRefObject<WebSocketCLPP>;
    idReceived: number;
    listMessage: { id: number, id_user: number, message: string, notification: number, type: number, date: string }[];
    page: number;
    pageLimit: number;
    msgLoad: boolean;
    previousScrollHeight: MutableRefObject<number>;
    messagesContainerRef: RefObject<HTMLDivElement>;
    hasNewMessage: boolean;
    contNotify: number;
    setHasNewMessage: (value: boolean) => void;
    closeChat: () => void;
    includesMessage: (item: { id: number, id_user: number, message: string, notification: number, type: number, date:string }) => void;
    changeChat: () => void;
    handleScroll: () => void;
    setPage: (value: number) => void;
    setIdReceived: (value: number) => void;
    setSender: React.Dispatch<React.SetStateAction<iSender>>;
    setContactList: (value: Contact[]) => void;
    changeListContact: (value: any) => void;
}

export interface ITask {
    id: number;
    description: string;
    priority: number;
    user_id: number;
    initial_date: string;
    final_date: string;
}