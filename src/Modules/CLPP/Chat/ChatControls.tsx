import { useState } from "react";
import AttachmentFile from "../../../Components/AttachmentFile";
import SendMessage from "../Class/SendMessage";
import { useWebSocket } from "../../../Context/WsContext";
import { useMyContext } from "../../../Context/MainContext";
import { captureTime, classToJSON } from "../../../Util/Util";
import { useConnection } from "../../../Context/ConnContext";

export default function ChatControls() {
    const [file, setFile] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const { idReceived, includesMessage, ws } = useWebSocket();
    const { userLog } = useMyContext();
    const { fetchData } = useConnection();

    return (
        <div className="d-flex align-items-center rounded p-2">
            <button
                onClick={() => {
                    sendAllMessage();
                    clearChatControls();
                }}
                className="btn btn-success fa-solid fa-paper-plane col-2"
                title="Enviar mensagem"
            ></button>

            <input
                type="text"
                value={message}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                        sendAllMessage();
                        clearChatControls();
                    }
                }}
                onPaste={(e) => handlePaste(e)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                id="chatControlsInput"
                className="mx-2 col-8 border rounded" />
            <AttachmentFile reset={file ? false : true} file={0} onClose={(value) => callBackAttachmentFile(value)} fullFiles={true} base64={file} />
        </div>
    );

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        if (base64) {
                            setFile(base64);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    }

    function callBackAttachmentFile(fileBase64: string) {
        if (fileBase64) {
            setFile(fileBase64);
        }
    }

    async function sendFile() {
        const type = changeTypeMessageForFile(file);
        const extension = getBase64FileExtension(file);

        const req: any = await fetchData({
            method: "POST",
            params: classToJSON(new SendMessage(file.split('base64,')[1], idReceived, userLog.id, type)),
            pathFile: "CLPP/Message.php"
        });
        if (req.error) throw new Error(req.message);
        includesMessage({
            id: req.last_id,
            id_user: userLog.id,
            message: `${idReceived}_${userLog.id}_${req.last_id}.${extension}`,
            notification: 1,
            type: type,
            date: captureTime()
        });
        ws.current.informSending(2, idReceived.toString(), req.last_id);
    }

    async function sendText() {
        const req: any = await fetchData({
            method: "POST",
            params: classToJSON(new SendMessage(message, idReceived, userLog.id, 1)),
            pathFile: "CLPP/Message.php"
        });
        if (req.error) throw new Error(req.message);

        includesMessage({
            id: req.last_id,
            id_user: userLog.id,
            message: message,
            notification: 1,
            type: 1,
            date: captureTime()
        });
        ws.current.informSending(2, idReceived.toString(), req.last_id);
    }

    async function sendAllMessage() {
        try {
            if (file.trim() !== '') {
                await sendFile();
            }
            if (message.trim() !== '') {
                await sendText();
            }
        } catch (error: any) {
            console.error(error.message);
        }
    }

    function clearChatControls() {
        setFile("");
        setMessage("");
    }

    function changeTypeMessageForFile(base64: string): number {
        const upperType = base64.toUpperCase();
        let type = 11;

        switch (true) {
            case (upperType.includes('DATA:IMAGE/WEBP') || upperType.includes('DATA:IMAGE/PNG')):
                type = 2;
                break;
            case upperType.includes('DATA:APPLICATION/PDF'):
                type = 3;
                break;
            case upperType.includes('DATA:TEXT/XML'):
                type = 4;
                break;
            case upperType.includes('DATA:TEXT/CSV'):
                type = 5;
                break;
            case upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT'):
                type = 6;
                break;
            case upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET'):
                type = 7;
                break;
            case upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.PRESENTATIONML.PRESENTATION'):
                type = 8;
                break;
            case upperType.includes('DATA:APPLICATION/X-ZIP-COMPRESSED'):
                type = 9;
                break;
            case upperType.includes('DATA:APPLICATION/OCTET-STREAM'):
                type = 10;
                break;
        }

        return type;
    }

    function getBase64FileExtension(base64: string) {
        const upperType = base64.toUpperCase();
        let extension = 'txt';
        if (upperType.includes('DATA:APPLICATION/PDF')) extension = 'pdf';
        else if (upperType.includes('DATA:APPLICATION/PDF')) extension = 'xml';
        else if (upperType.includes('DATA:TEXT/CSV')) extension = 'csv';
        else if (upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT')) extension = 'docx';
        else if (upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET')) extension = 'xlsx';
        else if (upperType.includes('DATA:APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.PRESENTATIONML.PRESENTATION')) extension = 'pptx';
        else if (upperType.includes('X-ZIP-COMPRESSED')) extension = 'zip';
        else if (upperType.includes('OCTET-STREAM')) extension = 'rar';
        else {
            const match = base64.match(/^data:(.+);base64,/);
            if (match) {
                const mimeType = match[1];
                extension = mimeType.split("/")[1];
            } else {
                extension = 'txt';
            }
        }
        return extension;
    }
}