import React from 'react';
type Props = React.HTMLAttributes<HTMLDivElement> & {
    children: JSX.Element; // Tipo para o children
    // styleClass?: string
}

export default function StructureModal(props: Props) {
    return (
        <div {...props}>
            {props.children}
        </div>
    );
}

type MessageModal = {
    style?: string
    type: 1 | 2 | 3 | 4;
    onClose: () => void;
    message: string;
}
export function MessageModal(props: MessageModal) {
    return (
        <div className={`alert ${typeModal()} alert-dismissible fade show`} role="alert">
            {props.message}
            <button title="Fechar" onClick={() => props.onClose()} type="button" className="btn-close" data-dismiss="alert" aria-label="Close"></button>
        </div>
    );

    function typeModal() {
        let response: string = '';
        switch (props.type) {
            case 1:
                response = "alert-success";
                break;
            case 2:
                response = "alert-danger";
                break;
            case 3:
                response = "alert-warning";
                break;
            case 4:
                response = "alert-info";
                break;
            default:
                break;
        }
        return response;
    }
}