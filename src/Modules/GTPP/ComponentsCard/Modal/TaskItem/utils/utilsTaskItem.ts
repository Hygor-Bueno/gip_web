export function getCompleteUserList(listUser: any, getUser: any, task: any, users: any) {
    let list: any[] = Array.isArray(listUser) ? [...listUser] : [];

    // Verifica se o getUser existe e possui ID antes de continuar
    if (!getUser || !getUser.id) {
        return list;
    }
    
    // 1. Garante que o usuário logado (Você) está na lista para poder ser mencionado/visualizado
    const exists = list.some((item: any) => item.user_id === getUser.id);
    if (!exists) {
        list.push({
            user_id: getUser.id,
            name: getUser.name || "Você",
            photo: getUser.photo,
            status: true
        });
    }

    // 2. Garante que o AUTOR DA TAREFA está na lista (Busca na prop 'users' geral)
    // O autor geralmente está em task.user_id ou task.created_by
    const authorId = task?.user_id || task?.created_by; 
    if (authorId) {
        const authorExists = list.some((item: any) => item.user_id === authorId);
        if (!authorExists && users) {
            // Procura os dados do autor na lista completa de usuários que vem na prop
            const authorDetails = users.find((u: any) => u.user_id === authorId);
            if (authorDetails) {
                list.push({
                    user_id: authorDetails.user_id,
                    name: authorDetails.name,
                    photo: authorDetails.photo,
                    status: true
                });
            }
        }
    }

    return list;
}

export function changePositionItem(next: boolean, id: number, taskDetails: any, setTaskDetails: any) {
    let result = false;
    if (taskDetails.data && taskDetails.data.task_item) {
      const items = taskDetails.data.task_item;
      const currentIndex = items.findIndex((item: any) => item.id === id);
      const newIndex = next ? currentIndex + 1 : currentIndex - 1;
      const validMove = currentIndex !== -1 && newIndex >= 0 && newIndex < items.length;
      if (validMove) {
        const [movedItem] = items.splice(currentIndex, 1);
        items.splice(newIndex, 0, movedItem);
        setTaskDetails({ ...taskDetails });
        result = true;
      }
    }
    return result;
}

export function includeAuthorInList(listUser: any, getUser: any) {
    let list: any[] = Array.isArray(listUser) ? [...listUser] : [];
    if (listUser && listUser.length > 0) {
      const exists = list.some((item: any) => item.user_id === getUser?.id);
      if (!exists && getUser?.id) {
        list.push({
          task_id: listUser[0].task_id,
          user_id: getUser.id,
          status: true,
          name: getUser.name || "",
          photo: getUser.photo
        });
      }
    }
    return list;
  }

export function closeObservation({taskObj, setSubtask}: {taskObj?: any, setSubtask?: any}) {
    setSubtask((prev: any) => ({ ...prev, idSubTask: taskObj.id, openDialog: !prev.openDialog }));
}

export async function deleteTaskItem(item: { id: number; task_id: number }, fetchData: any) {
    const req: any = await fetchData({ method: "DELETE", params: { id: item.id, task_id: item.task_id }, pathFile: 'GTPP/TaskItem.php' });
    return req;
}

export function removeItemOfList(id: number, taskDetails: any, setTaskDetails: any) {
    const indexDelete: number | undefined = taskDetails.data?.task_item.findIndex((item: any) => item.id == id);
    if (indexDelete != undefined && indexDelete >= 0) {
        taskDetails.data?.task_item.splice(indexDelete, 1);
        setTaskDetails({ ...taskDetails });
    }
}