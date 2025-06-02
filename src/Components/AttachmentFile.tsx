import React, { useEffect, useState } from 'react';
import { Connection } from '../Connection/Connection';
import FilePreview from './FilePreview';

function AttachmentFile(props:
  | { item_id: number; file: number; onClose?: (file: string) => void; reset?: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean,base64?:string } // item_id é obrigatório, onClose opcional
  | { item_id?: number; file: number; onClose: (file: string) => void; reset: boolean, updateAttachmentFile?: (file: string, item_id: number) => Promise<void>, fullFiles?: boolean,base64?:string } // onClose é obrigatório, item_id opcional
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [base64File, setBase64File] = useState<string>('');
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
          const connection = new Connection("18");
          const req: any = await connection.get(`&id=${props.item_id}`, "GTPP/TaskItem.php");
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
    props.onClose?.(props.fullFiles ? base64File : base64File.replace(/^data:image\/\w+;base64,/, ""));
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
      reader.onloadend = () => {
        setBase64File(reader.result?.toString() || '');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div style={{ maxWidth: "75%", maxHeight: "90%" }} className="d-flex flex-column align-items-center bg-white p-4 rounded" onClick={(e) => e.stopPropagation()}>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <span className='h5'>Anexo:  </span>
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
            <label style={{ minHeight: "60px", height: "4vw", minWidth: "60px", width: "4vw" }} className='d-flex justify-content-center align-items-center btn btn-outline-primary text-primary fa fa-paperclip' >
              <input
                type="file"
                accept={
                  props.fullFiles 
                    ?  `text/xml, image/png, image/jpeg, image/gif, video/mp4, application/pdf, 
                       application/vnd.openxmlformats-officedocument.wordprocessingml.document, 
                       application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                       application/vnd.openxmlformats-officedocument.presentationml.presentation`
                    : "image/*"}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
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
