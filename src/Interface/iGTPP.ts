export interface iPropsInputCheckButton {
    containerClass?: string;
    nameButton:string;
    onAction: (e: boolean) => void;
    inputClass?: string;
    labelClass?: string;
    labelColor?: string;
    inputId: string;
    labelText?: string;
    labelIcon?: string;
    labelIconConditional?: [string, string];
    highlight?:boolean;
  }