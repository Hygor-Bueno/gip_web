import { useEffect, useState } from 'react';
import { useConnection } from '../../../Context/ConnContext';

export function useAttachmentFile(itemId?: number, fileFlag?: number, base64Prop?: string, reset?: boolean) {
  const [base64File, setBase64File] = useState('');
  const { fetchData } = useConnection();

  useEffect(() => {
    if (reset) {
      setBase64File('');
    }
  }, [reset]);

  useEffect(() => {
    if (!fileFlag || !itemId) return;

    (async () => {
      try {
        const req: any = await fetchData({
          method: 'GET',
          params: null,
          pathFile: 'GTPP/TaskItem.php',
          urlComplement: `&id=${itemId}`,
          exception: ['no data'],
        });

        if (req?.error) throw new Error(req.message);
        setBase64File(req.data[0]);
      } catch (err: any) {
        console.error(err.message);
      }
    })();
  }, [fileFlag, itemId, fetchData]);

  useEffect(() => {
    if (base64Prop) {
      setBase64File(base64Prop);
    }
  }, [base64Prop]);

  return { base64File, setBase64File };
}
