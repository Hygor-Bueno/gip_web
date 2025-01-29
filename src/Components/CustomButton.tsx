import React, { useEffect, useState } from 'react';
import { iPropsInputCheckButton } from '../Interface/iGTPP';
type CustomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    customStyle?: string;
};

export function CustomButton({ value, customStyle, children, ...props }: CustomButtonProps) {
    return (
        <button className={customStyle} {...props}>
            {value ? value : children}
        </button>
    );
}

export function InputCheckButton(props: iPropsInputCheckButton) {
    const [icon, setIcon] = useState<string>("");
    const [isChecked, setIsChecked] = useState<boolean>(false);
    useEffect(() => {
        renderIcon(isChecked);
    }, [isChecked]);
    return (
        <button type="button" className={`${props.containerClass ? props.containerClass : `btn btn-${(props.highlight && isChecked) ? 'success' : 'light'} p-0`}`}>
            <input hidden defaultChecked={isChecked} onClick={async (e: React.MouseEvent<HTMLInputElement>) => {
                const newChecked = e.currentTarget.checked;
                setIsChecked(newChecked); // Atualiza o estado imediatamente
                await props.onAction(newChecked); // Aguarda a ação sem bloquear
            }} className={`${props.inputClass ? props.inputClass : 'cursor-pointer'}`} id={props.inputId} type="checkbox" />
            <label className={`${props.labelClass ? props.labelClass : 'cursor-pointer'} ${icon} ${(props.highlight && isChecked) ? 'text-white' : 'text-dark'}  p-2`} htmlFor={props.inputId}>{props.labelText}</label>
        </button>
    )

    function renderIcon(value: boolean) {
        let result: string = "";
        if (props.labelIconConditional) {
            result = value ? props.labelIconConditional[0] : props.labelIconConditional[1]
        } else {
            result = props.labelIcon ? props.labelIcon : "";
        }
        setIcon(result)
    }
}
