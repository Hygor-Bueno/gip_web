export default interface GtppMainProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  openFilterGolbal: boolean;
  isHeader: boolean;
  userLog: any;
  listButtonInputs: Array<{
    inputId: string;
    nameButton: string;
    onAction: (event?: any) => void | Promise<void>;
    labelIcon?: string;
    labelIconConditional?: string[];
    highlight?: boolean;
  }>;
  openFilter: boolean;
  handleOpenFilter: () => void;
  states: any;
  handleCheckboxChange: (stateId: number) => void;
  onSounds: boolean;
  setOnSounds: any;
  selectedThemeIds: string;
  setSelectedThemeIds: React.Dispatch<React.SetStateAction<string>>;
  themeList: Array<{
    id_theme: string;
    description_theme: string;
  }>;
  idTheme: string;
  getIdTheme: React.Dispatch<React.SetStateAction<string>>;
  getTask: any[];
  selectedTasks: number[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<number[]>>;
  task: any;
  taskDetails: any;
  openCardDefault: boolean;
  openThemeModal: boolean;
  setOpenCardDefault: any;
  setModalPage: (value: boolean) => void;
  setModalPageElement: any;
  loadTasks: () => void;
  clearGtppWsContext: () => void;
  setOpenThemeModal: any;
}