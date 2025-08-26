import React, { useEffect, useState } from 'react';
import FilePreview from './FilePreview';
import { useConnection } from '../Context/ConnContext';
import { IMAGE_WEBP_QUALITY } from '../Util/Util';

const interactiveCardStyle = `
.download-card {
    transition: box-shadow 0.25s ease-in-out;
    text-decoration: none;
}
.download-card:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.20);
    cursor: pointer;
}
.download-icon-interactive {
    transition: transform 0.25s ease-in-out;
}
.download-card:hover .download-icon-interactive {
    transform: translateY(4px);
}
`;

function AttachmentFile(props:
    | { item_id: number; file: number; onClose?: (file: string) => void; reset?: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean, base64?: string }
    | { item_id?: number; file: number; onClose: (file: string) => void; reset: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean, base64?: string }
) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [base64File, setBase64File] = useState<string>('');
    const { fetchData } = useConnection();

    const { reset } = props;
    useEffect(() => {
        if (reset) { setBase64File(''); }
    }, [reset]);

    useEffect(() => {
        (async () => {
            try {
                if (props.file) {
                    const req: any = await fetchData({ method: "GET", params: null, pathFile: 'GTPP/TaskItem.php', urlComplement: `&id=${props.item_id}`, exception: ["no data"] })
                    if (req.error) throw new Error(req.message);
                    setBase64File(req.data[0]);
                }
            } catch (error: any) { console.error(error.message); }
        })();
    }, [props.file, props.item_id, fetchData]);

    useEffect(() => {
        (async () => {
            props.base64 && setBase64File(props.base64);
        })();
    }, [props]);

    const closeModal = () => {
        setIsModalOpen(false);
        let cleanedFile = base64File;
        if (!props.fullFiles) {
            cleanedFile = base64File.split(',')[1] || '';
        }
        props.onClose?.(cleanedFile);
    };

    return (
        <div title="Anexar arquivo." onClick={() => setIsModalOpen(true)}>
            <style>{interactiveCardStyle}</style>
            <label className="file-input-container">
                <div className={`fa fa-paperclip p-2 cursor-pointer  ${(base64File) && 'text-success shadow rounded-circle'}`} />
            </label>
            {isModalOpen && <AttachmentPreview item_id={props.item_id || 0} closeModal={closeModal} base64File={base64File} setBase64File={setBase64File} updateAttachmentFile={props.updateAttachmentFile} fullFiles={props.fullFiles} />}
        </div>
    );
}

function AttachmentPreview(props: { closeModal: () => void; item_id: number, base64File: string, setBase64File: (value: string) => void, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean }) {
    const { base64File, setBase64File, closeModal, item_id } = props;
    const [fileName, setFileName] = useState('');

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    const processFile = (file: File | null) => {
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert("O arquivo excede o limite de 15MB.");
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        const allowedMimeTypes = [
            'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel',
            'text/csv', 'application/xml', 'text/xml',
            'application/zip', 'application/x-zip-compressed',
            'application/vnd.rar', 'application/x-rar-compressed'
        ];

        const isAllowedMimeType = allowedMimeTypes.includes(file.type);
        const isExcalidrawFile = file.name.toLowerCase().endsWith('.excalidraw');
        const isZipFile = file.name.toLowerCase().endsWith('.zip');
        const isRarFile = file.name.toLowerCase().endsWith('.rar');
        const isImageFile = file.type.startsWith('image/');

        if (isAllowedMimeType || isExcalidrawFile || isZipFile || isRarFile || isImageFile) {
            reader.onload = (e) => {
                const result = e.target?.result?.toString() || '';
                if (isImageFile) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width; canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0);
                        let webpData = canvas.toDataURL("image/webp", IMAGE_WEBP_QUALITY);
                        if (!webpData.startsWith("data:image/webp")) { webpData = canvas.toDataURL("image/png"); }
                        setBase64File(webpData);
                    };
                    img.src = result;
                } else {
                    setBase64File(result);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert(`Tipo de arquivo não suportado: ${file.name} (${file.type})`);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        processFile(file);
    };

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    processFile(file);
                    event.preventDefault();
                    return;
                }
            }
        };
        window.addEventListener("paste", handlePaste as EventListener);
        return () => {
            window.removeEventListener("paste", handlePaste as EventListener);
        };
    }, []);

    const FileDownloadPreview = ({ base64File, fileName }: { base64File: string; fileName: string; }) => {
        const fileTypeStyles = {
            zip: { name: 'Arquivo ZIP', color: '#8395a7', icon: 'fa-solid fa-file-zipper text-white' },
            rar: { name: 'Arquivo RAR', color: '#8395a7', icon: 'fa-solid fa-file-zipper text-white' },
            excalidraw: { name: 'Excalidraw', color: '#343a40', icon: 'fa-solid fa-pen-ruler text-white' },
            word: { name: 'Word', color: '#2b579a', icon: 'fa-solid fa-file-word text-white' },
            excel: { name: 'Excel', color: '#1d6f42', icon: 'fa-solid fa-file-excel text-white' },
            powerpoint: { name: 'PowerPoint', color: '#d24726', icon: 'fa-solid fa-file-powerpoint text-white' },
            xml: { name: 'XML', color: '#617a8c', icon: 'fa-solid fa-file-code text-white' },
            csv: { name: 'CSV', color: '#556b2f', icon: 'fa-solid fa-file-csv text-white' },
            default: { name: 'Arquivo', color: '#6c757d', icon: 'fa-solid fa-file-archive text-white' }
        };

        const getFileTypeInfo = () => {
            const lowerCaseFileName = fileName.toLowerCase();
            if (lowerCaseFileName.endsWith('.zip')) { return fileTypeStyles.zip; }
            if (lowerCaseFileName.endsWith('.rar')) { return fileTypeStyles.rar; }
            if (lowerCaseFileName.endsWith('.excalidraw')) { return fileTypeStyles.excalidraw; }

            if (base64File.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') || base64File.startsWith('data:application/msword')) { return fileTypeStyles.word; }
            if (base64File.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || base64File.startsWith('data:application/vnd.ms-excel')) { return fileTypeStyles.excel; }
            if (base64File.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml.presentation') || base64File.startsWith('data:application/vnd.ms-powerpoint')) { return fileTypeStyles.powerpoint; }
            if (base64File.startsWith('data:application/xml') || base64File.startsWith('data:text/xml')) { return fileTypeStyles.xml; }
            if (base64File.startsWith('data:text/csv')) { return fileTypeStyles.csv; }
            return fileTypeStyles.default;
        };

        const fileInfo = getFileTypeInfo();

        return (
            <a href={base64File} download={fileName} className="download-card card w-75 text-center text-white border-0" style={{ backgroundColor: fileInfo.color }}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                    <i className={`${fileInfo.icon} fa-4x mb-3`}></i>
                    <h5 className="card-title mb-1">Clique para baixar o {fileInfo.name}</h5>
                    <p className="card-text small opacity-75" style={{maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{fileName}</p>
                    <div className="mt-3">
                        <i className="fa-solid fa-download fa-lg download-icon-interactive text-white"></i>
                    </div>
                </div>
            </a>
        );
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div style={{ maxWidth: "75%", maxHeight: "90%" }} className="d-flex flex-column align-items-center bg-white p-4 rounded" onClick={(e) => e.stopPropagation()}>
                <div className='d-flex align-items-center justify-content-between w-100'>
                    <span className='h5'>Anexo: </span>
                    {base64File && <button title="Remover anexo." style={{ minWidth: "25%" }} onClick={async () => {
                        if (props.updateAttachmentFile) { await props.updateAttachmentFile('', item_id); }
                        setBase64File(''); setFileName('');
                    }} className="btn btn-danger m-2 fa-solid fa-trash" />}
                </div>
                <div className='d-flex flex-column align-items-center justify-content-center w-100 h-100 overflow-auto'>
                    {base64File ? (
                        (() => {
                            if (base64File.startsWith("data:application/pdf")) {
                                return <embed src={base64File} type="application/pdf" width="100%" height="500px" />;
                            } else if (base64File.startsWith("data:image/")) {
                                return <FilePreview base64File={base64File} />;
                            } else {
                                return <FileDownloadPreview base64File={base64File} fileName={fileName} />;
                            }
                        })()
                    ) : (
                        <React.Fragment>
                            <label style={{ minHeight: "60px", height: "4vw", minWidth: "60px", width: "4vw" }} className='d-flex justify-content-center align-items-center btn btn-outline-primary text-primary fa fa-paperclip' >
                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xml,.ppt,.pptx,.xls,.xlsx,.csv,.excalidraw,.zip,.rar,image/*" />
                            </label>
                            <label className='text-danger text-bold' style={{ fontSize: '0.950rem', width: '15rem', textAlign: 'center', marginTop: '1rem' }}>Pode usar CTRL+V para colar um arquivo ou clicar para anexar</label>
                        </React.Fragment>
                    )}
                </div>
                <div className='d-flex align-items-center justify-content-around w-100'>
                    <button title={"Salvar arquivo"} disabled={!item_id} style={{ minWidth: "25%" }} onClick={async () => {
                        if (props.updateAttachmentFile) { const base64Data = base64File.split(',')[1] || ''; await props.updateAttachmentFile(base64Data, item_id); }
                        closeModal();
                    }} className="btn btn-success m-2"> Salvar </button>
                    <button title={"Voltar"} style={{ minWidth: "25%" }} onClick={closeModal} className="btn btn-danger m-2"> Voltar </button>
                </div>
            </div>
        </div>
    );
}

export default AttachmentFile;