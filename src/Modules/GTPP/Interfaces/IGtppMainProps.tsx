import { Task } from "../../../Class/FileGenerator";
import User from "../../../Class/User";
import { iStates, iTaskReq } from "../../../Interface/iGIPP";
import { ITheme } from "../CreateTheme/ICreateTheme";

export default interface GtppMainProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  openFilterGolbal: boolean;
  isHeader: boolean;
  userLog: User;
  listButtonInputs: Array<{
    inputId: string;
    nameButton: string;
    onAction: (event?: React.MouseEvent<HTMLButtonElement> | any) => void | Promise<void>;
    labelIcon?: string;
    labelIconConditional?: string[];
    highlight?: boolean;
  }>;
  openFilter: boolean;
  handleOpenFilter: () => void;
  states: iStates[];
  handleCheckboxChange: (stateId: number) => void;
  onSounds: boolean;
  setOnSounds: (value: boolean) => void;
  selectedThemeIds: string;
  setSelectedThemeIds: React.Dispatch<React.SetStateAction<string>>;
  themeList: ITheme[] | undefined;
  idTheme: string;
  getIdTheme: React.Dispatch<React.SetStateAction<string>>;
  getTask: Task[];
  selectedTasks: number[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<number[]>>;
  task: Task;
  taskDetails: iTaskReq;
  openCardDefault: boolean;
  openThemeModal: boolean;
  setOpenCardDefault: (value: boolean) => void;
  setModalPage: (value: boolean) => void;
  setModalPageElement: (value: JSX.Element) => void;
  loadTasks: () => void;
  clearGtppWsContext: () => void;
  setOpenThemeModal: (value: boolean) =>void;
}