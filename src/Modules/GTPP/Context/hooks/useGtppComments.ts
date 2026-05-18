import { useState, useCallback, MutableRefObject } from "react";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";
import { handleNotification } from "../../../../Util/Utils";
import { dispatchAppNotification } from "../../../../Context/NotificationHubContext";
import { IApiResponse, IComment, ICommentState, IGtppTaskSummary, IUserTaskElement } from "../types/gtppTypes";
import GtppWebSocket from "../GtppWebSocket";

function formatTaskRef(taskId: number, taskList?: IGtppTaskSummary[]): string {
  const found = taskList?.find((t) => Number(t.id) === Number(taskId));
  const title = (found?.description ?? "").toString().trim();
  if (title) return `#${taskId} ${title}`;
  return `#${taskId}`;
}

export function useGtppComments(
  updateCommentCount: (taskItemId: number, action: "add" | "remove") => void,
  ws: MutableRefObject<GtppWebSocket>,
  taskList?: IGtppTaskSummary[]
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

  const notifyIncomingComment = useCallback(
    async (taskId: number, taskItemId: number, senderUserId?: number): Promise<void> => {
      if (!taskItemId) return;
      if (senderUserId && Number(senderUserId) === Number(userLog?.id)) return;
      try {
        const res = await fetchData({
          method: "GET",
          params: null,
          pathFile: "GTPP/TaskItemResponse.php",
          urlComplement: `&task_item_id=${taskItemId}`,
          exception: ["No data"],
        }) as IApiResponse<IComment[]>;

        if (!res || res.error || !Array.isArray(res.data) || res.data.length === 0) return;

        const latest = res.data.reduce<IComment>(
          (best, cur) => (Number(cur.id) > Number(best.id) ? cur : best),
          res.data[0]
        );

        const authorName = (latest.name && latest.name.trim()) || "Alguém";
        const rawText = (latest.comment ?? "").toString().trim();
        const hasFile = Boolean(latest.file);
        const snippet = rawText
          ? rawText.length > 140
            ? `${rawText.slice(0, 137)}...`
            : rawText
          : hasFile
            ? "(anexo enviado)"
            : "(comentário sem texto)";

        const taskRef = formatTaskRef(taskId, taskList);
        dispatchAppNotification({
          source: "gtpp",
          title: `${authorName} comentou em ${taskRef}`,
          message: snippet,
          type: "info",
          task_id: taskId,
          externalId: `gtpp-comment-${taskItemId}-${latest.id}`,
          extra: { task_item_id: taskItemId, comment_id: latest.id, has_file: hasFile, task_ref: taskRef },
        });
      } catch (error: unknown) {
        console.error(
          `Erro ao notificar comentário recebido: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    [fetchData, userLog?.id, taskList]
  );

  const notifyDeletedComment = useCallback(
    (taskId: number, taskItemId: number, commentId?: number): void => {
      const taskRef = formatTaskRef(taskId, taskList);
      dispatchAppNotification({
        source: "gtpp",
        title: `Comentário removido em ${taskRef}`,
        message: "Um comentário foi removido em uma tarefa que você acompanha.",
        type: "warning",
        task_id: taskId,
        externalId: `gtpp-comment-del-${taskItemId}-${commentId ?? Date.now()}`,
        extra: { task_ref: taskRef },
      });
    },
    [taskList]
  );

  return {
    comment, setComment,
    getComment, getCountComment,
    sendComment, deleteComment, editComment, notifyMentionWs,
    notifyIncomingComment, notifyDeletedComment,
  };
}
