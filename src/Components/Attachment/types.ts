export interface AttachmentProps {
  item_id?: number;
  file: number;
  base64?: string;
  reset?: boolean;
  fullFiles?: boolean;
  onClose?: (file: string) => void;
  updateAttachmentFile?: (file: string, item_id: number) => Promise<void>;
}
