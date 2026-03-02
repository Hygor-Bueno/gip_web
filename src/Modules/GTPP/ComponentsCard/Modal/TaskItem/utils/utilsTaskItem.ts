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