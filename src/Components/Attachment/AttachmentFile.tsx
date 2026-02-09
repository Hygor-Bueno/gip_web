import React, { useState } from 'react';
import { AttachmentProps } from './types';
import { useAttachmentFile } from './hooks/useAttachmentFile';
import { AttachmentModal } from './components/AttachmentModal';

export default function AttachmentFile(props: AttachmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { base64File, setBase64File } = useAttachmentFile(
    props.item_id,
    props.file,
    props.base64,
    props.reset
  );

  const closeModal = () => {
    setIsOpen(false);

    let result = base64File;
    if (!props.fullFiles) {
      result = base64File.split(',')[1] || '';
    }

    props.onClose?.(result);
  };

  return (
    <div title="Anexar arquivo" onClick={() => setIsOpen(true)}>
      <div
        className={`fa fa-paperclip p-2 cursor-pointer ${
          base64File ? 'text-success shadow rounded-circle' : ''
        }`}
      />

      {isOpen && (
        <AttachmentModal
          itemId={props.item_id || 0}
          base64File={base64File}
          setBase64File={setBase64File}
          updateAttachmentFile={props.updateAttachmentFile}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
