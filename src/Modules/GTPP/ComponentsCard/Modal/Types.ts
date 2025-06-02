import { HTMLAttributes } from "react";

export type TaskItem = {
    card_id?: string;
    task_id?: string;
    description?: string;
    percent?: number;
    close_modal?: any;
    taskFilter?: any;
    getPercent?: any;
    listItem?: any;
    resetTask?: any;
    details?: any;
    taskDetails?: any;
    taskCheckReset?: any;
  }
  
 export type FormTextAreaDefaultProps = HTMLAttributes<HTMLInputElement> &{
    disabledForm?: boolean;
    details?: any;
    setRenderList?:any;
    onChange?: (value: string) => void;
    buttonTextOpen?: string;
    buttonTextClosed?: string;
    buttonClasses?: string;
    textAreaClasses?: string;
    rows?: number;
    cols?: number;
    task: any;
  }
  
 export type SubTask = {
    id: number;
    description: string;
    check: boolean;
    task_id: number;
    setRenderList?: any;
  }
  
 export type SubTasksWithCheckboxProps = {
    onTaskChange: (id: number, checked: boolean) => void;
    allData: any;
    message?: any;
  }