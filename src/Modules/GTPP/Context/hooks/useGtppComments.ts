import { useState, useCallback, MutableRefObject } from "react";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import { handleNotification } from "../../../../Util/Utils";
import { IApiResponse, IComment, ICommentState, IUserTaskElement } from "../types/gtppTypes";
import GtppWebSocket from "../GtppWebSocket";

export function useGtppComments(
  updateCommentCount: (taskItemId: number, action: "add" | "remove") => void,
  ws: MutableRefObject<GtppWebSocket>
) {
  const [comment, setComment] = useState<ICommentState>({ isComment: false, data: [] });

  const { userLog } = useMyContext();
  const { fetchData } = useConnection();

  const getComment = useCallback(
    async (taskItemId: number, count?: boolean): Promise<void> => {
      if (!taskItemId) return;
      try {
        const res = await fetchData({
          method: "GET",
          params: null,
          pathFile: "GTPP/TaskItemResponse.php",
          urlComplement: count
            ? `&count=${String(count)}`
            : `&task_item_id=${taskItemId}`,
          exception: ["No data"],
        }) as IApiResponse<IComment[]>;

        setComment((prev) => ({
          ...prev,
          data: res && !res.error && Array.isArray(res.data) ? res.data : [],
        }));
      } catch (error: unknown) {
        console.error(`Erro ao buscar comentários: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchData]
  );

  const getCountComment = async (taskItemId: number): Promise<IApiResponse<unknown>> => {
    return (await fetchData({
      method: "GET",
      params: null,
      pathFile: "GTPP/TaskItemResponse.php",
      urlComplement: `&task_item_id=${taskItemId}&count=true`,
    })) as IApiResponse<unknown>;
  };

  const sendComment = useCallback(
    async (
      text: string,
      file: File | null,
      taskItemId: number,
      taskId: number
    ): Promise<IApiResponse<unknown> | undefined> => {
      try {
        const dataToSend = new FormData();
        dataToSend.append("task_item_id", taskItemId.toString());
        dataToSend.append("comment", text);
        if (file) dataToSend.append("file", file);

        const res = await fetchData({
          method: "POST",
          params: dataToSend,
          pathFile: "GTPP/TaskItemResponse.php",
        }) as IApiResponse<unknown>;

        if (res && !res.error) {
          await getComment(taskItemId);
          ws.current.informSending({
            error: false,
            user_id: userLog.id,
            task_id: taskId,
            type: 7,
            object: { task_item_id: taskItemId },
          });
          updateCommentCount(taskItemId, "add");
          return res;
        }
      } catch (error: unknown) {
        console.error(`Erro ao enviar comentário: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchData, getComment, userLog.id, updateCommentCount]
  );

  const deleteComment = async (
    idToDelete: number,
    taskItemId: number,
    taskId: number
  ): Promise<IApiResponse<unknown> | undefined> => {
    const res = await fetchData({
      method: "PUT",
      params: { id: idToDelete, status: "0" },
      pathFile: "GTPP/TaskItemResponse.php",
    }) as IApiResponse<unknown>;

    if (res && !res.error) {
      await getComment(taskItemId);
      updateCommentCount(taskItemId, "remove");
      return res;
    }
    if (!res.error) {
      handleNotification("Sucesso", "Comentário removido", "success");
      await getComment(taskItemId);
    }
    return res;
  };

  const editComment = async (
    idToEdit: number,
    newComment: string,
    taskItemId: number,
    _taskId: number
  ): Promise<IApiResponse<unknown> | undefined> => {
    const res = await fetchData({
      method: "PUT",
      params: { id: idToEdit, comment: newComment },
      pathFile: "GTPP/TaskItemResponse.php",
    }) as IApiResponse<unknown>;

    if (res && !res.error) {
      await getComment(taskItemId);
      handleNotification("Sucesso", "Comentário editado com sucesso!", "success");
      return res;
    }

    handleNotification("Erro", res?.message ?? "Erro ao editar comentário", "danger");
    return res;
  };

  const notifyMentionWs = useCallback(
    (_mentionedUsers: IUserTaskElement[], _taskId: number, _taskItemDesc: string): void => {
      // ws.current.informSending calls are intentionally disabled
    },
    []
  );

  return {
    comment, setComment,
    getComment, getCountComment,
    sendComment, deleteComment, editComment, notifyMentionWs,
  };
}
