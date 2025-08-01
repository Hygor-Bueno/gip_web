import React, { useEffect, useState } from 'react';
import FilePreview from './FilePreview';
import { useConnection } from '../Context/ConnContext';
import { IMAGE_WEBP_QUALITY } from '../Util/Util';

function AttachmentFile(props:
  | { item_id: number; file: number; onClose?: (file: string) => void; reset?: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean,base64?:string } // item_id é obrigatório, onClose opcional
  | { item_id?: number; file: number; onClose: (file: string) => void; reset: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean,base64?:string } // onClose é obrigatório, item_id opcional
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [base64File, setBase64File] = useState<string>('');
  const { fetchData } = useConnection();

  const { reset } = props;
  useEffect(() => {
    if (reset) {
      setBase64File('');
    }
  }, [reset]);

  useEffect(() => {
    (async () => {
      try {
        if (props.file) {
          const req: any = await fetchData({method: "GET", params: null, pathFile: 'GTPP/TaskItem.php', urlComplement: `&id=${props.item_id}`, exception: ["no data"]})
          if (req.error) throw new Error(req.message);
          setBase64File(req.data[0]);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    })();
  }, [props]);
  useEffect(() => {
    (async () => {
      props.base64 &&  setBase64File(props.base64);
    })();
  }, [props]);


  const closeModal = () => {
    setIsModalOpen(false);
    let cleanedFile = base64File;
    if(!props.fullFiles) {
      cleanedFile = base64File.split(',')[1] || '';
    }
    props.onClose?.(cleanedFile);
  };
  return (
    <div title="Anexar arquivo." onClick={() => setIsModalOpen(true)}>
      <label className="file-input-container">
        <div className={`fa fa-paperclip p-2 cursor-pointer  ${(base64File) && 'text-success shadow rounded-circle'}`}
        />
      </label>
      {isModalOpen && <AttachmentPreview item_id={props.item_id || 0} closeModal={closeModal} base64File={base64File} setBase64File={setBase64File} updateAttachmentFile={props.updateAttachmentFile} fullFiles={props.fullFiles} />}
    </div>
  );
}

function AttachmentPreview(props: { closeModal: () => void; item_id: number, base64File: string, setBase64File: (value: string) => void, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean }) {
  const { base64File, setBase64File, closeModal, item_id } = props;

    function handleFileChange(event: any) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            const webpData = canvas.toDataURL("image/webp", IMAGE_WEBP_QUALITY); // qualidade ajustável
            setBase64File(webpData);
          };
          img.src = e.target?.result?.toString() || '';
        };
        reader.readAsDataURL(file);
      }
    }


  
    useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                let webpData = canvas.toDataURL("image/webp", IMAGE_WEBP_QUALITY);
                if (!webpData.startsWith("data:image/webp")) {
                  console.log("Conversão para WebP falhou, usando PNG como fallback.");
                  webpData = canvas.toDataURL("image/png");
                }

                setBase64File(webpData);
              };
              img.src = e.target?.result?.toString() || '';
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste as EventListener);
    return () => {
      window.removeEventListener("paste", handlePaste as EventListener);
    };
  }, [setBase64File])

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div style={{ maxWidth: "75%", maxHeight: "90%" }} className="d-flex flex-column align-items-center bg-white p-4 rounded" onClick={(e) => e.stopPropagation()}>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <span className='h5'>Anexo: </span>
          {base64File && <button title="Remover anexo." style={{ minWidth: "25%" }} onClick={async () => {
            if (props.updateAttachmentFile) {
              await props.updateAttachmentFile('', item_id);
            }
            setBase64File('');
          }} className="btn btn-danger m-2 fa-solid fa-trash" />}
        </div>
        <div className='d-flex flex-column align-items-center w-100 h-100 overflow-auto'>
          {base64File ?
            <FilePreview base64File={base64File}/>
            :
            <>
              <label style={{ minHeight: "60px", height: "4vw", minWidth: "60px", width: "4vw" }} className='d-flex justify-content-center align-items-center btn btn-outline-primary text-primary fa fa-paperclip' >
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <label className='text-danger text-bold' style={{fontSize: '0.950rem', width: '15rem', textAlign: 'center', marginTop: '1rem'}}>Pode usar CTRL+C e V para colar a imagem ou anexar ela clicando no botão</label>
            </>
          }
        </div>

        <div className='d-flex align-items-center justify-content-around w-100'>
          <button title={"Salvar arquivo"} disabled={!item_id} style={{ minWidth: "25%" }} onClick={async () => {
            if (props.updateAttachmentFile) {
              await props.updateAttachmentFile(base64File.replace(/^data:image\/\w+;base64,/, ""), item_id);
            }
            closeModal();
          }} className="btn btn-success m-2">
            Salvar
          </button>
          <button title={"Voltar"} style={{ minWidth: "25%" }} onClick={closeModal} className="btn btn-danger m-2">
            Voltar
          </button>
        </div>

      </div>
    </div>
  );

}

export default AttachmentFile;
