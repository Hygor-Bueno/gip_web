import { useMyContext } from "../../../Context/MainContext";
import { useWebSocket } from "../../../Context/WsContext";
import { useConnection } from "../../../Context/ConnContext";
import { useEffect } from "react";
import { convertTime } from "../../../Util/Util";

export default
    function ChatMessages() {
    const { userLog } = useMyContext();
    const { handleScroll, messagesContainerRef, listMessage } = useWebSocket();
    const { fetchData } = useConnection();

    return (
        <section
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className='d-flex flex-column overflow-auto h-100 w-100 p-2'
        >
            {listMessage.map((item, index) => (
                <div key={`message_${index}`} className={`d-flex flex-column my-2 w-100 ${item.id_user == userLog.id ? 'text-end align-items-end ' + `${item.type <= 2 && 'messageSent'} ` : 'text-start align-items-start ' + `${item.type <= 2 && 'messageReceived'}`}`}>
                    <strong>{convertTime(item.date)}</strong>
                    <div className="p-2 rounded">{controllerMessage(item)}</div>
                    {
                        item.id_user == userLog.id && <span className={`fa-solid fa-check-double notifyMessage my-2 ${item.notification == 1 ? 'text-secundary' : 'text-primary'}`}></span>
                    }
                </div>
            ))}
            <div />
        </section>
    )


    function controllerMessage(message: any): any {
        let response;
        if (parseInt(message.type) === 1) {
            response = message.message;
        } else if (parseInt(message.type) === 2) {
            response = <a href={`http://gigpp.com.br:72/GLOBAL/Controller/CLPP/uploads/${message.message}`} target='_blank'><img alt="Mensagem no formato de imagem." className='fileStyle' src={`http://gigpp.com.br:72/GLOBAL/Controller/CLPP/uploads/${message.message}`} /></a>;
        } else {
            response = iconFileMessage(message);
        }
        return response;
    }

    function iconFileMessage(message: any) {
        let style: string = '';
        let icon: string = '';
        if (parseInt(message.type) === 3) {
            style = "text-danger h1";
            icon = "fa-solid fa-file-pdf";
        } else if (parseInt(message.type) === 4) {
            style = "text-success";
            icon = "fa-solid fa-file-code"
        } else if (parseInt(message.type) === 6) {
            style = "text-primary";
            icon = "fa-solid fa-file-word"
        } else if (parseInt(message.type) === 7) {
            style = "text-success";
            icon = "fa-solid fa-file-excel"
        }
        else if (parseInt(message.type) === 8) {
            style = "text-warning";
            icon = "fa-solid fa-file-powerpoint"
        }
        return componentFile(message, style, icon);
    }

    function componentFile(message: any, style: string, icon: string): JSX.Element {
        return (
            <footer id='divMessageFile' className="d-flex flex-column fileStyle bg-white p-2 rounded ">
                <a href={`http://gigpp.com.br:72/GLOBAL/Controller/CLPP/uploads/${message.message}`} target='_blank'>
                    <i className={`${style} ${icon}`} />
                </a>
                <div className="d-flex justify-content-end my-2" onClick={async () => {
                    try {
                        const req: { error: boolean, fileName: string, fileContent: string, message?: 'string' } = await await fetchData({ method: "GET", params: null, pathFile: "GIPP/LoginGipp.php", urlComplement: `&file=${message.message}` }) || { error: true, fileName: '', fileContent: '' };
                        if (req.error) throw new Error(req.message);
                        downloadFile(req);
                    } catch (error) {
                        console.error(error)
                    }
                }}>
                    <i className='text-dark fa-solid fa-download' />
                </div>
            </footer>
        );
    }
    async function downloadFile(reqFile: { error: boolean, fileName: string, fileContent: string }) {
        const binaryString = atob(reqFile.fileContent);
        const byteNumbers = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteNumbers[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/octet-stream' });

        // Cria um link temporário para download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = reqFile.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };
}